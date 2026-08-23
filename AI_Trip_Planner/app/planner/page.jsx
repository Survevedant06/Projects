'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import MultiStepPlanner from '@/components/MultiStepPlanner'
import { Compass } from 'lucide-react'

function PlannerContent() {
  const searchParams = useSearchParams()
  const initialDestination = searchParams.get('destination') || ''

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#F0EBE1' }}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Page header */}
        <div className="text-center space-y-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{ background: '#E8F5EE', color: '#1B3A2D', border: '1px solid #B3D0C2' }}
          >
            <Compass className="h-3.5 w-3.5" style={{ color: '#E86B4A' }} />
            AI TRIP STUDIO
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#1B3A2D' }}
          >
            Build your custom itinerary.
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: '#8A8478' }}>
            Fill in the details below and our AI will craft a day-by-day plan with maps, dining, and real budgets.
          </p>
        </div>

        <MultiStepPlanner initialDestination={initialDestination} />
      </div>
    </div>
  )
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0EBE1' }}>
          <div
            className="animate-spin rounded-full h-8 w-8 border-2"
            style={{ borderColor: '#E86B4A', borderTopColor: 'transparent' }}
          />
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  )
}
