'use client'

import React from 'react'
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  ExternalLink,
  Edit3,
  Trash2,
  Tag,
  Sunrise,
  Sun,
  Moon,
} from 'lucide-react'
import { formatCurrency, getCurrencySymbol } from '@/lib/utils'

const SLOT_CONFIG = {
  morning: {
    label: 'Morning',
    icon: Sunrise,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  afternoon: {
    label: 'Afternoon',
    icon: Sun,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  evening: {
    label: 'Evening',
    icon: Moon,
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-300',
    dot: 'bg-purple-500',
  },
}

export default function ActivityCard({
  activity,
  currency = 'USD',
  destination = '',
  canEdit = true,
  onEdit = null,
  onDelete = null,
  onSelect = null,
  isActive = false,
}) {
  const slotKey = activity.timeSlot?.toLowerCase() || 'morning'
  const config = SLOT_CONFIG[slotKey] || SLOT_CONFIG.morning
  const SlotIcon = config.icon

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${activity.name}, ${activity.locationName || destination}`
  )}`

  return (
    <div
      onClick={() => onSelect && onSelect(activity)}
      className={`group relative rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${
        isActive
          ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
          : 'hover:border-blue-300 dark:hover:border-blue-800'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}
          >
            <SlotIcon className="h-3.5 w-3.5" />
            {config.label}
          </span>

          {activity.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              <Tag className="h-3 w-3" />
              {activity.category}
            </span>
          )}
        </div>

        {/* Rating and Edit Actions */}
        <div className="flex items-center gap-2">
          {activity.rating && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
              <Star className="h-3 w-3 fill-amber-500" />
              {activity.rating.toFixed(1)}
            </div>
          )}

          {canEdit && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(activity)
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                  title="Edit Activity"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(activity.id)
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  title="Delete Activity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Activity Title & Location */}
      <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 transition-colors">
        {activity.name}
      </h3>

      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
        <span className="truncate">{activity.locationName || destination}</span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="ml-auto inline-flex items-center gap-0.5 text-blue-600 hover:underline font-medium shrink-0"
        >
          Directions <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Description */}
      <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {activity.description}
      </p>

      {/* User Custom Notes if any */}
      {activity.userNotes && (
        <div className="mt-2.5 p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 italic">
          💡 <span className="font-medium">My Note:</span> {activity.userNotes}
        </div>
      )}

      {/* Bottom Footer: Cost & Duration */}
      <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-blue-500" />
          <span>
            {activity.durationMinutes
              ? `${Math.floor(activity.durationMinutes / 60)}h ${
                  activity.durationMinutes % 60 ? `${activity.durationMinutes % 60}m` : ''
                }`
              : '1.5 hrs'}
          </span>
        </div>

        <div className="font-semibold text-foreground">
          {activity.estimatedCost > 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              Est. {formatCurrency(activity.estimatedCost, currency)}
            </span>
          ) : (
            <span className="text-muted-foreground font-normal">Free Admission</span>
          )}
        </div>
      </div>
    </div>
  )
}
