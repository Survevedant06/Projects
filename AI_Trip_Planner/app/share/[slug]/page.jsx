import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import ItineraryView from '@/components/ItineraryView'
import { Sparkles, Globe, PlaneTakeoff, Copy } from 'lucide-react'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const trip = await prisma.trip.findFirst({
    where: { OR: [{ shareSlug: slug }, { id: slug }] },
  })

  if (!trip) {
    return { title: 'Shared Trip - WanderAI' }
  }

  return {
    title: `${trip.title} | WanderAI Shared Travel Plan`,
    description: trip.summary || `Explore this ${trip.duration}-day curated itinerary for ${trip.destination}.`,
  }
}

export default async function SharedTripPage({ params }) {
  const { slug } = await params

  const trip = await prisma.trip.findFirst({
    where: {
      OR: [{ shareSlug: slug }, { id: slug }],
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

  return (
    <div className="space-y-4">
      {/* Public Share Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Globe className="h-4 w-4" />
            <span>
              You are viewing a shared itinerary for <strong>{trip.destination}</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/planner?destination=${encodeURIComponent(trip.destination)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Customize for Yourself
            </Link>
          </div>
        </div>
      </div>

      <ItineraryView initialTrip={trip} isPublicView={true} />
    </div>
  )
}
