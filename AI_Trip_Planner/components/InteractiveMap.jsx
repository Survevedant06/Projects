'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, Navigation, ExternalLink, Layers, ZoomIn, ZoomOut, Compass } from 'lucide-react'

// Color map for slots
const SLOT_COLORS = {
  morning: '#f59e0b',   // Amber
  afternoon: '#3b82f6', // Blue
  evening: '#8b5cf6',   // Purple
}

export default function InteractiveMap({
  activities = [],
  destination = '',
  selectedDay = 'all',
  activeActivityId = null,
  onMarkerClick = null,
}) {
  const mapRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [markers, setMarkers] = useState([])
  const [polylines, setPolylines] = useState([])
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false)
  const [mapError, setMapError] = useState(null)

  // Filter activities based on selected day
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (!act.latitude || !act.longitude) return false
      if (selectedDay === 'all') return true
      return act.dayNumber === Number(selectedDay)
    })
  }, [activities, selectedDay])

  // Center calculation
  const center = useMemo(() => {
    if (filteredActivities.length > 0) {
      const avgLat =
        filteredActivities.reduce((acc, curr) => acc + curr.latitude, 0) /
        filteredActivities.length
      const avgLng =
        filteredActivities.reduce((acc, curr) => acc + curr.longitude, 0) /
        filteredActivities.length
      return { lat: avgLat, lng: avgLng }
    }
    return { lat: 35.6762, lng: 139.6503 } // default Tokyo
  }, [filteredActivities])

  // Initialize Google Maps
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setIsGoogleMapsReady(false)
      return
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    })

    loader
      .load()
      .then((google) => {
        if (!mapRef.current) return

        const map = new google.maps.Map(mapRef.current, {
          center: center,
          zoom: 13,
          mapTypeId: 'roadmap',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'simplified' }],
            },
            {
              featureType: 'transit',
              elementType: 'labels.icon',
              stylers: [{ visibility: 'off' }],
            },
          ],
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
          zoomControl: true,
        })

        setMapInstance(map)
        setIsGoogleMapsReady(true)
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err)
        setMapError(err.message)
        setIsGoogleMapsReady(false)
      })
  }, [])

  // Update Markers & Polylines when map or activities change
  useEffect(() => {
    if (!mapInstance || !window.google) return

    // Clear old markers
    markers.forEach((m) => m.setMap(null))
    polylines.forEach((p) => p.setMap(null))

    const newMarkers = []
    const newPolylines = []
    const bounds = new window.google.maps.LatLngBounds()

    // Group activities by day for polyline routes
    const dayGroups = {}

    filteredActivities.forEach((activity, idx) => {
      const position = { lat: activity.latitude, lng: activity.longitude }
      bounds.extend(position)

      const color = SLOT_COLORS[activity.timeSlot?.toLowerCase()] || '#3b82f6'

      // Custom SVG Pin
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstance,
        title: activity.name,
        label: {
          text: `${idx + 1}`,
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '11px',
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
        animation: activeActivityId === activity.id ? window.google.maps.Animation.BOUNCE : null,
      })

      marker.addListener('click', () => {
        setSelectedSpot(activity)
        if (onMarkerClick) onMarkerClick(activity)
      })

      newMarkers.push(marker)

      // Add to day group for line routing
      const dayKey = activity.dayNumber || 1
      if (!dayGroups[dayKey]) dayGroups[dayKey] = []
      dayGroups[dayKey].push(position)
    })

    // Draw connecting polyline routes for each day
    Object.entries(dayGroups).forEach(([dayNum, pathCoords]) => {
      if (pathCoords.length > 1) {
        const polyline = new window.google.maps.Polyline({
          path: pathCoords,
          geodesic: true,
          strokeColor: '#2563eb',
          strokeOpacity: 0.8,
          strokeWeight: 3.5,
          icons: [
            {
              icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5 },
              offset: '50%',
              repeat: '100px',
            },
          ],
        })
        polyline.setMap(mapInstance)
        newPolylines.push(polyline)
      }
    })

    setMarkers(newMarkers)
    setPolylines(newPolylines)

    if (filteredActivities.length > 0) {
      if (filteredActivities.length === 1) {
        mapInstance.setCenter(bounds.getCenter())
        mapInstance.setZoom(14)
      } else {
        mapInstance.fitBounds(bounds)
      }
    }
  }, [mapInstance, filteredActivities, activeActivityId])

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border shadow-inner bg-slate-900">
      {/* If Google Maps API is initialized */}
      <div ref={mapRef} className={`w-full h-full min-h-[420px] ${!isGoogleMapsReady ? 'hidden' : ''}`} />

      {/* Fallback Interactive Visual Map when API Key is pending or loading */}
      {!isGoogleMapsReady && (
        <div className="relative w-full h-full min-h-[420px] bg-slate-950 flex flex-col items-center justify-between p-6 text-white overflow-hidden">
          {/* Subtle Map Grid Background */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(#60a5fa 1px, transparent 1px), radial-gradient(#60a5fa 1px, #020617 1px)`,
              backgroundSize: '32px 32px',
              backgroundPosition: '0 0, 16px 16px',
            }}
          />

          {/* Top Overlay Badge */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
              <Compass className="h-4 w-4 text-blue-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span className="text-xs font-semibold text-slate-200">
                {destination} Itinerary Map
              </span>
              <span className="bg-blue-600/30 text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-medium">
                {filteredActivities.length} Spots
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Morning
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> Afternoon
              </span>
              <span className="flex items-center gap-1 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" /> Evening
              </span>
            </div>
          </div>

          {/* Dynamic Pin Grid Display */}
          <div className="relative z-10 my-auto w-full max-w-lg py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredActivities.map((act, index) => {
                const color =
                  act.timeSlot === 'morning'
                    ? 'border-amber-500/50 bg-amber-950/30 text-amber-300'
                    : act.timeSlot === 'afternoon'
                    ? 'border-blue-500/50 bg-blue-950/30 text-blue-300'
                    : 'border-purple-500/50 bg-purple-950/30 text-purple-300'

                const isSelected = selectedSpot?.id === act.id || activeActivityId === act.id

                return (
                  <div
                    key={act.id || index}
                    onClick={() => {
                      setSelectedSpot(act)
                      if (onMarkerClick) onMarkerClick(act)
                    }}
                    className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 backdrop-blur-sm ${color} ${
                      isSelected ? 'ring-2 ring-white scale-[1.03] shadow-lg shadow-blue-500/20' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                        {act.timeSlot} • Day {act.dayNumber || 1}
                      </span>
                      <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white line-clamp-1">{act.name}</p>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {act.locationName || destination}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Info Tip */}
          <div className="relative z-10 w-full flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
            <span className="flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-blue-400" />
              Route paths & pins active
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${destination} tourist attractions`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Open in Google Maps
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Selected Spot Details Floating Card */}
      {selectedSpot && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${SLOT_COLORS[selectedSpot.timeSlot?.toLowerCase()] || '#3b82f6'}30`,
                  color: SLOT_COLORS[selectedSpot.timeSlot?.toLowerCase()] || '#3b82f6',
                }}
              >
                {selectedSpot.timeSlot}
              </span>
              <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{selectedSpot.name}</h4>
            </div>
            <button
              onClick={() => setSelectedSpot(null)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">{selectedSpot.description}</p>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              {selectedSpot.estimatedCost > 0 ? `Est. Cost: $${selectedSpot.estimatedCost}` : 'Free Activity'}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${selectedSpot.name}, ${selectedSpot.locationName || destination}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              Get Directions <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
