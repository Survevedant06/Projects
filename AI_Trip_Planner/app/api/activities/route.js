import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { geocodePlace } from '@/lib/maps'

// POST /api/activities - Add new activity to a day plan
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      dayPlanId,
      timeSlot = 'morning',
      name,
      description = '',
      category = 'Sightseeing',
      locationName = '',
      estimatedCost = 0,
      durationMinutes = 90,
      userNotes = '',
      destination = '',
    } = body

    if (!dayPlanId || !name) {
      return NextResponse.json({ error: 'dayPlanId and name are required' }, { status: 400 })
    }

    // Geocode location if not provided
    let lat = body.latitude
    let lng = body.longitude

    if (!lat || !lng) {
      const geo = await geocodePlace(locationName || name, destination)
      lat = geo.lat
      lng = geo.lng
    }

    // Find current highest order index in this day plan
    const count = await prisma.activity.count({
      where: { dayPlanId },
    })

    const activity = await prisma.activity.create({
      data: {
        dayPlanId,
        timeSlot,
        name,
        description,
        category,
        locationName: locationName || name,
        latitude: lat ? Number(lat) : null,
        longitude: lng ? Number(lng) : null,
        estimatedCost: Number(estimatedCost) || 0,
        durationMinutes: Number(durationMinutes) || 90,
        userNotes,
        orderIndex: count,
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
