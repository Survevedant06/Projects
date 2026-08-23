'use client'

import React, { useState } from 'react'
import { FileDown, Printer, Check, X, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function PdfExportModal({ trip, isOpen, onClose }) {
  const [generating, setGenerating] = useState(false)

  if (!isOpen || !trip) return null

  const handlePrint = () => {
    window.print()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 no-print">
      <div className="relative w-full max-w-md rounded-2xl bg-card border shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-lg">
              <FileDown className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Export Itinerary PDF</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Generate a clean, high-resolution printable travel guide for{' '}
            <strong className="text-foreground">{trip.title || trip.destination}</strong>.
          </p>

          <div className="p-3 bg-muted/50 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Destination:</span>
              <strong className="text-foreground">{trip.destination}</strong>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <strong className="text-foreground">{trip.duration} Days</strong>
            </div>
            <div className="flex justify-between">
              <span>Total Est. Budget:</span>
              <strong className="text-foreground">
                {formatCurrency(trip.totalEstimatedCost, trip.currency)}
              </strong>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
            >
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </button>
            <p className="text-[11px] text-center text-muted-foreground">
              Tip: In the print dialog, select &ldquo;Save as PDF&rdquo; as your destination.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
