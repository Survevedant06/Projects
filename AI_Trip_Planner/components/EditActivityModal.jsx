'use client'

import React, { useState } from 'react'
import { X, Save, Clock, DollarSign, MapPin, Tag } from 'lucide-react'

export default function EditActivityModal({ activity, isOpen, onClose, onSave, currency = 'USD' }) {
  const [formData, setFormData] = useState({
    name: activity?.name || '',
    description: activity?.description || '',
    timeSlot: activity?.timeSlot || 'morning',
    category: activity?.category || 'Sightseeing',
    locationName: activity?.locationName || '',
    estimatedCost: activity?.estimatedCost ?? 0,
    durationMinutes: activity?.durationMinutes ?? 90,
    userNotes: activity?.userNotes || '',
  })
  const [saving, setSaving] = useState(false)

  if (!isOpen || !activity) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...activity,
        ...formData,
        estimatedCost: Number(formData.estimatedCost),
        durationMinutes: Number(formData.durationMinutes),
      })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-lg font-bold text-foreground">Edit Activity</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Activity Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Time Slot
              </label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Sightseeing, Food, Culture"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Location / Landmark Address
            </label>
            <input
              type="text"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Est. Cost ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Personal Notes
            </label>
            <input
              type="text"
              value={formData.userNotes}
              onChange={(e) => setFormData({ ...formData, userNotes: e.target.value })}
              placeholder="e.g., Book tickets online in advance"
              className="w-full px-3.5 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-muted text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
