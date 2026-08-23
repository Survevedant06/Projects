'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Share2,
  FileDown,
  Sparkles,
  Plus,
  Utensils,
  Sun,
  Sunrise,
  Moon,
  Lightbulb,
  CloudSun,
  Luggage,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Eye,
  ExternalLink,
} from 'lucide-react'
import ActivityCard from './ActivityCard'
import InteractiveMap from './InteractiveMap'
import EditActivityModal from './EditActivityModal'
import AddActivityModal from './AddActivityModal'
import PdfExportModal from './PdfExportModal'
import { formatCurrency, getCurrencySymbol } from '@/lib/utils'
import { toast } from 'sonner'

export default function ItineraryView({ initialTrip, isPublicView = false }) {
  const router = useRouter()
  const { data: session } = useSession()

  const [trip, setTrip] = useState(initialTrip)
  const [selectedDay, setSelectedDay] = useState(1)
  const [activeActivityId, setActiveActivityId] = useState(null)

  // Modals
  const [editingActivity, setEditingActivity] = useState(null)
  const [addingDayId, setAddingDayId] = useState(null)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isSavingTrip, setIsSavingTrip] = useState(false)

  // Parse packing list and etiquette from JSON
  const packingList = useMemo(() => {
    try {
      return typeof trip.packingList === 'string' ? JSON.parse(trip.packingList) : trip.packingList || []
    } catch {
      return []
    }
  }, [trip.packingList])

  const localEtiquette = useMemo(() => {
    try {
      return typeof trip.localEtiquette === 'string' ? JSON.parse(trip.localEtiquette) : trip.localEtiquette || []
    } catch {
      return []
    }
  }, [trip.localEtiquette])

  // Flatten all activities with day numbers for map markers
  const allActivitiesWithDay = useMemo(() => {
    const list = []
    trip.dayPlans?.forEach((day) => {
      day.activities?.forEach((act) => {
        list.push({ ...act, dayNumber: day.dayNumber })
      })
    })
    return list
  }, [trip.dayPlans])

  // Active day plan object
  const activeDayPlan = useMemo(() => {
    if (selectedDay === 'all') return null
    return trip.dayPlans?.find((d) => d.dayNumber === Number(selectedDay)) || trip.dayPlans?.[0]
  }, [trip.dayPlans, selectedDay])

  // Save activity edit
  const handleSaveActivity = async (updatedActivity) => {
    try {
      const res = await fetch(`/api/activities/${updatedActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedActivity, destination: trip.destination }),
      })

      if (!res.ok) throw new Error('Failed to update activity')
      const saved = await res.json()

      // Update local state
      setTrip((prev) => ({
        ...prev,
        dayPlans: prev.dayPlans.map((dp) => ({
          ...dp,
          activities: dp.activities.map((a) => (a.id === saved.id ? saved : a)),
        })),
      }))

      toast.success('Activity updated!')
    } catch (err) {
      toast.error('Failed to update activity')
    }
  }

  // Delete activity
  const handleDeleteActivity = async (activityId) => {
    if (!confirm('Are you sure you want to remove this activity?')) return

    try {
      const res = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete activity')

      setTrip((prev) => ({
        ...prev,
        dayPlans: prev.dayPlans.map((dp) => ({
          ...dp,
          activities: dp.activities.filter((a) => a.id !== activityId),
        })),
      }))

      toast.success('Activity removed.')
    } catch (err) {
      toast.error('Failed to delete activity')
    }
  }

  // Add new activity
  const handleAddActivity = async (newActivityData) => {
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivityData),
      })

      if (!res.ok) throw new Error('Failed to add activity')
      const created = await res.json()

      setTrip((prev) => ({
        ...prev,
        dayPlans: prev.dayPlans.map((dp) =>
          dp.id === created.dayPlanId
            ? { ...dp, activities: [...dp.activities, created] }
            : dp
        ),
      }))

      toast.success('Custom activity added!')
    } catch (err) {
      toast.error('Failed to add activity')
    }
  }

  // Save/claim trip for logged-in user
  const handleClaimTrip = async () => {
    if (!session?.user) {
      toast.info('Please sign in to save this trip to your account.')
      router.push('/login')
      return
    }

    setIsSavingTrip(true)
    try {
      const res = await fetch(`/api/itineraries/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim' }),
      })

      if (!res.ok) throw new Error('Failed to save trip')
      const updated = await res.json()
      setTrip(updated)
      toast.success('Trip saved to your library!')
    } catch (err) {
      toast.error('Could not save trip.')
    } finally {
      setIsSavingTrip(false)
    }
  }

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${trip.shareSlug || trip.id}`
    : `/share/${trip.shareSlug || trip.id}`

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopiedLink(true)
    toast.success('Share link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Action Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-blue-900/10 via-background to-sky-900/10 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
                <MapPin className="h-3.5 w-3.5" />
                {trip.destination}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                {trip.duration} Days
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">
                {trip.budgetTier} Budget
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">
                {trip.travelStyle}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
              {trip.title}
            </h1>

            {trip.summary && (
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
                {trip.summary}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 no-print">
            {!isPublicView && (
              <button
                onClick={handleClaimTrip}
                disabled={isSavingTrip}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-card hover:bg-muted text-sm font-semibold transition-all shadow-sm"
              >
                {trip.userId ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 text-emerald-600" />
                    <span>Saved in Library</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 text-blue-600" />
                    <span>{isSavingTrip ? 'Saving...' : 'Save to My Trips'}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-card hover:bg-muted text-sm font-semibold transition-all shadow-sm"
            >
              <Share2 className="h-4 w-4 text-indigo-600" />
              Share Itinerary
            </button>

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Itinerary Timeline & Right Sticky Map & Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Day Selector + Activities + Meals + Tips */}
        <div className="lg:col-span-7 space-y-6">
          {/* Day Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-print">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedDay === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-card border text-muted-foreground hover:text-foreground'
              }`}
            >
              All Days ({trip.duration})
            </button>
            {trip.dayPlans?.map((day) => (
              <button
                key={day.id || day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedDay === day.dayNumber
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-card border text-muted-foreground hover:text-foreground'
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {/* Render Days */}
          {trip.dayPlans?.map((day) => {
            const isVisible = selectedDay === 'all' || selectedDay === day.dayNumber
            if (!isVisible) return null

            return (
              <div
                key={day.id || day.dayNumber}
                className="rounded-3xl border bg-card p-6 shadow-sm space-y-6 print-break-inside"
              >
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 font-extrabold text-xs flex items-center justify-center">
                        {day.dayNumber}
                      </span>
                      <h2 className="text-xl font-bold text-foreground">{day.title}</h2>
                    </div>
                    {day.theme && (
                      <p className="text-xs text-muted-foreground mt-1 font-medium italic">
                        &ldquo;{day.theme}&rdquo;
                      </p>
                    )}
                  </div>

                  {!isPublicView && (
                    <button
                      onClick={() => setAddingDayId(day.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors shrink-0 no-print"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Activity
                    </button>
                  )}
                </div>

                {/* Day Activities List */}
                <div className="space-y-4">
                  {day.activities && day.activities.length > 0 ? (
                    day.activities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        currency={trip.currency}
                        destination={trip.destination}
                        canEdit={!isPublicView}
                        onEdit={(act) => setEditingActivity(act)}
                        onDelete={handleDeleteActivity}
                        onSelect={(act) => setActiveActivityId(act.id)}
                        isActive={activeActivityId === activity.id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-xl">
                      No activities listed for this day. Click &ldquo;Add Activity&rdquo; to add one.
                    </div>
                  )}
                </div>

                {/* Meal Recommendations Box */}
                {(day.breakfastRecommendation || day.lunchRecommendation || day.dinnerRecommendation) && (
                  <div className="rounded-2xl bg-muted/40 border p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                      <Utensils className="h-4 w-4 text-amber-500" />
                      <span>Curated Food & Dining for Day {day.dayNumber}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {day.breakfastRecommendation && (
                        <div className="p-2.5 rounded-xl bg-card border">
                          <span className="font-bold text-amber-600 block mb-1">🍳 Breakfast</span>
                          <p className="text-muted-foreground">{day.breakfastRecommendation}</p>
                        </div>
                      )}
                      {day.lunchRecommendation && (
                        <div className="p-2.5 rounded-xl bg-card border">
                          <span className="font-bold text-blue-600 block mb-1">🍲 Lunch</span>
                          <p className="text-muted-foreground">{day.lunchRecommendation}</p>
                        </div>
                      )}
                      {day.dinnerRecommendation && (
                        <div className="p-2.5 rounded-xl bg-card border">
                          <span className="font-bold text-purple-600 block mb-1">🍷 Dinner</span>
                          <p className="text-muted-foreground">{day.dinnerRecommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Daily Insider Tip */}
                {day.dailyTip && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Insider Tip for Day {day.dayNumber}: </span>
                      <span>{day.dailyTip}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Column (5 cols): Sticky Interactive Map & Trip Essential Notes */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* Interactive Map Card */}
          <div className="rounded-3xl border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-foreground">Interactive Route Map</h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {selectedDay === 'all' ? 'All Days' : `Day ${selectedDay}`}
              </span>
            </div>

            <InteractiveMap
              activities={allActivitiesWithDay}
              destination={trip.destination}
              selectedDay={selectedDay}
              activeActivityId={activeActivityId}
              onMarkerClick={(act) => setActiveActivityId(act.id)}
            />
          </div>

          {/* Quick Budget & Practical Guide Accordion / Cards */}
          <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Trip Essentials & Insights
            </h3>

            {/* Total Budget Summary */}
            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Estimated Total Cost
                </span>
                <p className="text-lg font-extrabold text-blue-600">
                  {formatCurrency(trip.totalEstimatedCost, trip.currency)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded-md border">
                {trip.budgetTier} Tier
              </span>
            </div>

            {/* Best Time & Weather */}
            {(trip.bestTimeToVisit || trip.weatherAdvice) && (
              <div className="space-y-2 text-xs">
                {trip.bestTimeToVisit && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Sun className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Best Season: </strong>
                      {trip.bestTimeToVisit}
                    </div>
                  </div>
                )}
                {trip.weatherAdvice && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <CloudSun className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Weather Note: </strong>
                      {trip.weatherAdvice}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Packing Checklist */}
            {packingList && packingList.length > 0 && (
              <div className="pt-2 border-t space-y-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Luggage className="h-3.5 w-3.5 text-blue-600" />
                  Recommended Packing List
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {packingList.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-muted px-2.5 py-1 rounded-lg text-muted-foreground"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Local Etiquette */}
            {localEtiquette && localEtiquette.length > 0 && (
              <div className="pt-2 border-t space-y-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Local Etiquette & Tips
                </span>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {localEtiquette.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Activity Modal */}
      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          isOpen={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          onSave={handleSaveActivity}
          currency={trip.currency}
        />
      )}

      {/* Add Custom Activity Modal */}
      {addingDayId && (
        <AddActivityModal
          dayPlanId={addingDayId}
          dayNumber={trip.dayPlans?.find((d) => d.id === addingDayId)?.dayNumber || 1}
          isOpen={!!addingDayId}
          onClose={() => setAddingDayId(null)}
          onAdd={handleAddActivity}
          currency={trip.currency}
          destination={trip.destination}
        />
      )}

      {/* PDF Export Modal */}
      <PdfExportModal
        trip={trip}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 no-print">
          <div className="relative w-full max-w-md rounded-2xl bg-card border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-foreground">Share Itinerary</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Anyone with this link can view this itinerary and its interactive map:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs rounded-lg border bg-muted text-foreground outline-none select-all"
              />
              <button
                onClick={copyShareLink}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="pt-2 text-center">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                Preview Public Page <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
