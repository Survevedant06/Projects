import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateItinerary } from '@/lib/openai'
import { enrichItineraryCoordinates } from '@/lib/maps'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      destination,
      startDate,
      duration = 3,
      budgetTier = 'Moderate',
      currency = 'USD',
      groupSize = 1,
      travelStyle = 'Exploration',
      interests = [],
      dietaryRestrictions = 'None',
      pace = 'Balanced',
      specialNotes = '',
    } = body

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return NextResponse.json(
        { error: 'Destination is required.' },
        { status: 400 }
      )
    }

    const cleanDuration = Math.min(Math.max(Number(duration) || 3, 1), 14)
    const cleanGroupSize = Math.max(Number(groupSize) || 1, 1)

    // 1. Generate structured itinerary via OpenAI
    const rawItinerary = await generateItinerary({
      destination: destination.trim(),
      startDate,
      duration: cleanDuration,
      budgetTier,
      currency,
      groupSize: cleanGroupSize,
      travelStyle,
      interests,
      dietaryRestrictions,
      pace,
      specialNotes,
    })

    // 2. Enrich spots with coordinates & Places data
    const enrichedItinerary = await enrichItineraryCoordinates(rawItinerary)

    // 3. Save to database using Prisma
    const shareSlug = `${destination.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${uuidv4().substring(0, 8)}`

    const createdTrip = await prisma.trip.create({
      data: {
        userId: session?.user?.id || null,
        title: enrichedItinerary.tripTitle || `${cleanDuration}-Day Trip to ${destination}`,
        destination: destination.trim(),
        startDate: startDate || null,
        duration: cleanDuration,
        budgetTier,
        currency,
        groupSize: cleanGroupSize,
        travelStyle,
        totalEstimatedCost: enrichedItinerary.totalEstimatedCost ? Number(enrichedItinerary.totalEstimatedCost) : null,
        summary: enrichedItinerary.summary || '',
        bestTimeToVisit: enrichedItinerary.bestTimeToVisit || '',
        weatherAdvice: enrichedItinerary.weatherAdvice || '',
        packingList: JSON.stringify(enrichedItinerary.packingList || []),
        localEtiquette: JSON.stringify(enrichedItinerary.localEtiquette || []),
        shareSlug,
        isPublic: true,
        dayPlans: {
          create: (enrichedItinerary.days || []).map((day) => ({
            dayNumber: day.dayNumber,
            date: day.date || null,
            title: day.title || `Day ${day.dayNumber}`,
            theme: day.theme || '',
            breakfastRecommendation: day.breakfastRecommendation || '',
            lunchRecommendation: day.lunchRecommendation || '',
            dinnerRecommendation: day.dinnerRecommendation || '',
            dailyTip: day.dailyTip || '',
            activities: {
              create: (day.activities || []).map((act, index) => ({
                timeSlot: act.timeSlot || 'morning',
                name: act.name || 'Sightseeing',
                description: act.description || '',
                category: act.category || 'Sightseeing',
                locationName: act.locationName || destination,
                latitude: act.latitude ? Number(act.latitude) : null,
                longitude: act.longitude ? Number(act.longitude) : null,
                estimatedCost: act.estimatedCost ? Number(act.estimatedCost) : 0,
                durationMinutes: act.durationMinutes ? Number(act.durationMinutes) : 90,
                googlePlaceId: act.googlePlaceId || null,
                rating: act.rating ? Number(act.rating) : null,
                userNotes: '',
                orderIndex: index,
              })),
            },
          })),
        },
      },
      include: {
        dayPlans: {
          include: {
            activities: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
    })

    return NextResponse.json(createdTrip, { status: 201 })
  } catch (error) {
    console.error('Error creating itinerary:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate travel itinerary. Please check your API key and try again.',
      },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to view your trips.' }, { status: 401 })
    }

    const trips = await prisma.trip.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        dayPlans: {
          include: {
            activities: true,
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(trips)
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json({ error: 'Failed to fetch saved trips.' }, { status: 500 })
  }
}
