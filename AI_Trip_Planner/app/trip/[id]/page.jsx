import React from 'react'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ItineraryView from '@/components/ItineraryView'

export async function generateMetadata({ params }) {
  const { id } = await params
  const trip = await prisma.trip.findFirst({
    where: { OR: [{ id }, { shareSlug: id }] },
  })

  if (!trip) {
    return { title: 'Trip Not Found - WanderAI' }
  }

  return {
    title: `${trip.title} - WanderAI Travel Planner`,
    description: trip.summary || `Personalized ${trip.duration}-day travel itinerary for ${trip.destination}.`,
  }
}

export default async function TripPage({ params }) {
  const { id } = await params

  const trip = await prisma.trip.findFirst({
    where: {
      OR: [{ id }, { shareSlug: id }],
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
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

  if (!trip) {
    notFound()
  }

  return <ItineraryView initialTrip={trip} isPublicView={false} />
}
