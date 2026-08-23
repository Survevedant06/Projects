'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  MapPin,
  Calendar,
  DollarSign,
  Trash2,
  Share2,
  ExternalLink,
  PlusCircle,
  BookmarkCheck,
  Search,
  Sparkles,
  Plane,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

export default function TripsLibraryPage() {
  const { data: session, status } = useSession()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchTrips() {
      try {
        const res = await fetch('/api/itineraries')
        if (res.ok) {
          const data = await res.json()
          setTrips(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchTrips()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const handleDeleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip itinerary?')) return

    try {
      const res = await fetch(`/api/itineraries/${tripId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      setTrips((prev) => prev.filter((t) => t.id !== tripId))
      toast.success('Trip deleted.')
    } catch (err) {
      toast.error('Could not delete trip.')
    }
  }

  const filteredTrips = trips.filter((t) =>
    t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="text-sm text-muted-foreground">Loading your trips...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <BookmarkCheck className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Sign In to View Saved Trips</h2>
          <p className="text-sm text-muted-foreground">
            Sign in with an account to save, manage, and edit all your AI-generated travel itineraries.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20"
          >
            Sign In / Create Account
          </Link>
          <Link
            href="/planner"
            className="w-full py-2.5 px-4 rounded-xl border hover:bg-muted text-foreground text-sm font-medium"
          >
            Plan a Trip as Guest
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <BookmarkCheck className="h-7 w-7 text-blue-600" />
            My Saved Itineraries
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and manage all your generated travel plans.
          </p>
        </div>

        <Link
          href="/planner"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Plan New Itinerary
        </Link>
      </div>

      {/* Search Bar */}
      {trips.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by destination or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
        </div>
      )}

      {/* Trips Grid */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="group rounded-3xl border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                    <MapPin className="h-3 w-3" />
                    {trip.destination}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {trip.duration} Days
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                  {trip.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {trip.summary || `Personalized ${trip.duration}-day travel plan.`}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t text-muted-foreground">
                  <span>
                    Est. Budget:{' '}
                    <strong className="text-foreground">
                      {formatCurrency(trip.totalEstimatedCost, trip.currency)}
                    </strong>
                  </span>
                  <span className="capitalize">{trip.budgetTier} Tier</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t flex items-center justify-between gap-2">
                <Link
                  href={`/trip/${trip.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <span>View Itinerary</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/share/${trip.shareSlug || trip.id}`}
                    target="_blank"
                    className="p-2 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-muted transition-colors"
                    title="Share Link"
                  >
                    <Share2 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete Trip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-3xl border border-dashed bg-card/50 p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
            <Plane className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">No Saved Trips Found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery
                ? 'No itineraries match your search query.'
                : "You haven't saved any travel itineraries yet."}
            </p>
          </div>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Create Your First Trip
          </Link>
        </div>
      )}
    </div>
  )
}
