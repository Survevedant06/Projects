'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Map as MapIcon,
  List as ListIcon,
  Coffee,
  Compass,
  Wifi,
  Zap,
  Navigation,
  AlertTriangle,
  X,
  Globe,
  MapPin,
} from 'lucide-react';
import { CafeItem, OsmCafe, FilterState, UserLocation } from '@/lib/types';
import CafeCard from '@/components/cafes/CafeCard';
import OsmCafeCard from '@/components/cafes/OsmCafeCard';
import FilterBar from '@/components/filters/FilterBar';
import MapWrapper from '@/components/map/MapWrapper';
import AddToListModal from '@/components/lists/AddToListModal';
import DropPinSubmissionModal from '@/components/map/DropPinSubmissionModal';
import { useGeolocation } from '@/hooks/useGeolocation';

const initialFilters: FilterState = {
  searchQuery: '',
  city: 'All',
  minWifiSpeed: 0,
  plugDensity: [],
  noiseLevel: [],
  seatingComfort: [],
  lighting: [],
  foodOptions: [],
  openLateOnly: false,
  specialtyCoffeeOnly: false,
  outdoorSeatingOnly: false,
  petFriendlyOnly: false,
  callBoothsOnly: false,
  verifiedOnly: false,
  sortBy: 'highest_rated',
  nearMe: false,
  radiusKm: 5,
};

export default function HomePage() {
  // ─── State ───────────────────────────────────────────────────────────────
  const [dbCafes, setDbCafes] = useState<CafeItem[]>([]);
  const [osmCafes, setOsmCafes] = useState<OsmCafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedCafe, setSelectedCafe] = useState<CafeItem | null>(null);
  const [hoveredCafe, setHoveredCafe] = useState<CafeItem | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [modalCafe, setModalCafe] = useState<CafeItem | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Drop-a-Pin state
  const [dropPinMode, setDropPinMode] = useState(false);
  const [droppedCoords, setDroppedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const {
    location,
    status: geoStatus,
    error: geoError,
    requestLocation,
    clearLocation,
  } = useGeolocation();

  // ─── Fetch verified DB cafes (with standard filters) ──────────────────
  const fetchDbCafes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.searchQuery) params.set('search', filters.searchQuery);
      if (!filters.nearMe && filters.city && filters.city !== 'All')
        params.set('city', filters.city);
      if (filters.minWifiSpeed > 0) params.set('minWifi', filters.minWifiSpeed.toString());
      filters.plugDensity.forEach((p) => params.append('plugDensity', p));
      filters.noiseLevel.forEach((n) => params.append('noiseLevel', n));
      filters.seatingComfort.forEach((s) => params.append('seatingComfort', s));
      if (filters.openLateOnly) params.set('openLate', 'true');
      if (filters.specialtyCoffeeOnly) params.set('specialtyCoffee', 'true');
      if (filters.outdoorSeatingOnly) params.set('outdoorSeating', 'true');
      if (filters.petFriendlyOnly) params.set('petFriendly', 'true');
      if (filters.callBoothsOnly) params.set('callBooths', 'true');
      if (filters.verifiedOnly) params.set('verifiedOnly', 'true');
      params.set('sortBy', filters.sortBy === 'nearest' ? 'highest_rated' : filters.sortBy);

      const res = await fetch(`/api/cafes?${params.toString()}`);
      const data = await res.json();
      if (data.success) setDbCafes(data.cafes);
    } catch (err) {
      console.error('Error fetching cafes:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ─── Fetch nearby places via modernized Aggregator (Overpass + DB) ────
  const fetchNearbyCafes = useCallback(async (loc: UserLocation, radiusKm: number) => {
    setNearMeLoading(true);
    setOsmCafes([]);
    setLocationError(null);
    try {
      const res = await fetch(`/api/cafes/nearby?lat=${loc.lat}&lng=${loc.lng}&radius=${radiusKm}`);
      const data = await res.json();
      if (data.success) {
        setDbCafes(data.dbCafes || []);
        setOsmCafes(data.osmCafes || []);
      }
    } catch (err) {
      console.error('Error fetching nearby cafes:', err);
      setLocationError('Could not load nearby cafes. Please try again.');
    } finally {
      setNearMeLoading(false);
      setLoading(false);
    }
  }, []);

  // ─── Effect: fetch on filter change ───────────────────────────────────
  useEffect(() => {
    if (filters.nearMe && location) {
      fetchNearbyCafes(location, filters.radiusKm);
    } else if (!filters.nearMe) {
      setOsmCafes([]);
      fetchDbCafes();
    }
  }, [filters.nearMe, filters.radiusKm, location, fetchDbCafes, fetchNearbyCafes]);

  // ─── Handler: Near Me button ──────────────────────────────────────────
  const handleRequestNearMe = useCallback(() => {
    setLocationError(null);
    if (geoStatus === 'granted' && location) {
      setFilters((f) => ({ ...f, nearMe: true, sortBy: 'nearest' }));
    } else {
      setNearMeLoading(true);
      requestLocation();
    }
  }, [geoStatus, location, requestLocation]);

  // ─── Effect: once geolocation granted, enable Near Me ────────────────
  useEffect(() => {
    if (geoStatus === 'granted' && location && !filters.nearMe && nearMeLoading) {
      setFilters((f) => ({ ...f, nearMe: true, sortBy: 'nearest' }));
      setNearMeLoading(false);
    }
    if (geoStatus === 'denied' || geoStatus === 'error') {
      setNearMeLoading(false);
      setLocationError(geoError || 'Location access failed.');
    }
  }, [geoStatus, location, geoError, filters.nearMe, nearMeLoading]);

  const handleClearNearMe = useCallback(() => {
    clearLocation();
    setFilters((f) => ({ ...f, nearMe: false, city: 'All', sortBy: 'highest_rated' }));
    setOsmCafes([]);
    setLocationError(null);
  }, [clearLocation]);

  const handleReset = useCallback(() => {
    setFilters(initialFilters);
    setOsmCafes([]);
  }, []);

  // ─── Drop-a-Pin Map Click Handler ────────────────────────────────────
  const handleMapClick = (coords: { lat: number; lng: number }) => {
    setDroppedCoords(coords);
  };

  const handleDropPinSuccess = (newPlace: CafeItem) => {
    setDbCafes((prev) => [newPlace, ...prev]);
    setSelectedCafe(newPlace);
    setDropPinMode(false);
    setDroppedCoords(null);
  };

  // ─── Derived stats ────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      avgWifi: dbCafes.length
        ? Math.round(dbCafes.reduce((s, c) => s + c.wifiSpeedMbps, 0) / dbCafes.length)
        : 0,
      verified: dbCafes.filter((c) => c.isVerified).length,
      community: dbCafes.filter(
        (c) => c.source === 'USER_SUBMITTED' || c.status === 'COMMUNITY_ADDED'
      ).length,
      osmCount: osmCafes.length,
      total: dbCafes.length + osmCafes.length,
    }),
    [dbCafes, osmCafes]
  );

  const availableCities = [
    'San Francisco',
    'New York',
    'Austin',
    'Berlin',
    'Kyoto',
    'Bali',
    'Ratnagiri',
    'Mumbai',
    'Bengaluru',
    'Delhi',
    'Pune',
    'Hyderabad',
    'Goa',
    'London',
    'Tokyo',
    'Singapore',
  ];

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ── Editorial Travel Hero Banner ── */}
      <div className="relative rounded-3xl bg-nomad-navy-900 border border-nomad-navy-800 p-6 sm:p-10 overflow-hidden shadow-dune-lg">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-nomad-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 bottom-0 w-64 h-64 bg-nomad-sienna-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-nomad-teal-500/10 border border-nomad-teal-500/25 text-nomad-teal-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Adaptive Geospatial Discovery · Nomad Indigo & Sand
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-nomad-sand-50 leading-tight">
            Find cafes where you can{' '}
            <span className="text-nomad-teal-400 relative">
              actually get work done.
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-nomad-teal-500/30 rounded" />
            </span>
          </h1>

          <p className="text-nomad-sand-300 text-sm sm:text-base leading-relaxed max-w-lg">
            High-density workspace discovery with verified Wi-Fi speed logs, power outlet density,
            and real-time OpenStreetMap ingestion across global and regional cities.
          </p>

          {/* Live stats pills */}
          <div className="flex items-center flex-wrap gap-2.5 pt-1">
            {stats.avgWifi > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-nomad-navy-950 border border-nomad-navy-800 text-xs">
                <Wifi className="w-3.5 h-3.5 text-nomad-teal-400" />
                <span className="text-white font-bold">{stats.avgWifi} Mbps</span>
                <span className="text-nomad-muted-dark">avg speed</span>
              </div>
            )}
            {stats.verified > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-nomad-navy-950 border border-nomad-navy-800 text-xs">
                <Zap className="w-3.5 h-3.5 text-nomad-sienna-500" />
                <span className="text-white font-bold">{stats.verified}</span>
                <span className="text-nomad-muted-dark">verified hubs</span>
              </div>
            )}
            {filters.nearMe && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-nomad-teal-500/10 border border-nomad-teal-500/30 text-xs">
                <Navigation className="w-3.5 h-3.5 text-nomad-teal-400" />
                <span className="text-nomad-teal-300 font-bold">
                  {stats.osmCount + stats.community + stats.verified} places
                </span>
                <span className="text-nomad-muted-dark">within {filters.radiusKm} km</span>
              </div>
            )}
            {!filters.nearMe && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-nomad-navy-950 border border-nomad-navy-800 text-xs">
                <Globe className="w-3.5 h-3.5 text-nomad-muted-dark" />
                <span className="text-white font-bold">60M+</span>
                <span className="text-nomad-muted-dark">OSM venues</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Location Error Banner ── */}
      {locationError && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-nomad-sienna-500/10 border border-nomad-sienna-500/30 text-sm text-nomad-sienna-100">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-nomad-sienna-500" />
          <div className="flex-1">
            <strong className="font-bold text-nomad-sienna-400">Location Access</strong>
            <p className="text-xs text-nomad-sand-300 mt-0.5">{locationError}</p>
          </div>
          <button
            onClick={() => setLocationError(null)}
            className="text-nomad-muted-dark hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Near Me Active Banner ── */}
      {filters.nearMe && location && !nearMeLoading && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-nomad-teal-500/10 border border-nomad-teal-500/25 text-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-nomad-teal-400 shadow-teal-glow flex-shrink-0 animate-pulse" />
          <span className="text-nomad-teal-300 font-bold text-xs">
            Showing workspaces within {filters.radiusKm} km of your position
          </span>
          <span className="text-nomad-muted-dark text-xs ml-auto hidden sm:block">
            {stats.osmCount} via OpenStreetMap · {stats.verified} Verified · {stats.community} Community
          </span>
          <button
            onClick={handleClearNearMe}
            className="text-nomad-muted-dark hover:text-white transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
        availableCities={availableCities}
        totalResults={stats.total}
        nearMeLoading={nearMeLoading}
        dropPinMode={dropPinMode}
        onToggleDropPin={() => setDropPinMode(!dropPinMode)}
        onRequestNearMe={handleRequestNearMe}
        onClearNearMe={handleClearNearMe}
      />

      {/* ── Toolbar: count + view switcher ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-nomad-muted-dark font-medium">
          {loading || nearMeLoading ? (
            'Discovering workspaces…'
          ) : (
            <>
              <strong className="text-nomad-sand-50">{stats.total}</strong> workspace
              {stats.total !== 1 ? 's' : ''} found
              {filters.nearMe && (
                <span className="ml-2 text-nomad-muted-dark">
                  ({dbCafes.length} verified/community · {osmCafes.length} via OpenStreetMap)
                </span>
              )}
            </>
          )}
        </p>

        <div className="flex items-center gap-1 bg-nomad-navy-900 border border-nomad-navy-800 p-1 rounded-xl text-xs font-bold shadow-sm">
          <button
            onClick={() => setViewMode('split')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'split'
                ? 'bg-nomad-teal-600 text-white shadow-teal-glow'
                : 'text-nomad-sand-300 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-nomad-teal-600 text-white shadow-teal-glow'
                : 'text-nomad-sand-300 hover:text-white'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'map'
                ? 'bg-nomad-teal-600 text-white shadow-teal-glow'
                : 'text-nomad-sand-300 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout: Split / List / Map ── */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Cards Column */}
          <div className="lg:col-span-7 space-y-4">
            {loading || nearMeLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-72 rounded-2xl bg-nomad-navy-900 border border-nomad-navy-800 animate-pulse"
                  />
                ))}
              </div>
            ) : stats.total === 0 ? (
              <div className="bg-nomad-navy-900 border border-nomad-navy-800 rounded-3xl p-12 text-center space-y-4 shadow-dune">
                <Coffee className="w-12 h-12 text-nomad-muted-dark mx-auto" />
                <h3 className="text-base font-serif font-bold text-nomad-sand-50">
                  No workspaces match these filters
                </h3>
                <p className="text-xs text-nomad-muted-dark max-w-xs mx-auto">
                  {filters.nearMe
                    ? `No cafes found within ${filters.radiusKm} km. Try stepping the search radius to 10 km or 20 km.`
                    : 'Try widening your search terms or resetting the active filters.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-nomad-teal-600 hover:bg-nomad-teal-500 text-white rounded-xl text-xs font-bold shadow-teal-glow transition-colors"
                  >
                    Reset Filters
                  </button>
                  {filters.nearMe && (
                    <button
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          radiusKm: Math.min(f.radiusKm * 2, 20),
                        }))
                      }
                      className="px-4 py-2 bg-nomad-navy-950 border border-nomad-navy-800 text-nomad-sand-200 rounded-xl text-xs font-bold hover:border-nomad-teal-500 hover:text-white transition-colors"
                    >
                      Expand Radius (2x)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Verified / Community DB Cafes */}
                {dbCafes.length > 0 && (
                  <div>
                    {filters.nearMe && osmCafes.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-nomad-teal-400 uppercase tracking-wider">
                          ✓ Verified & Community Hubs
                        </span>
                        <div className="flex-1 h-px bg-nomad-navy-800" />
                        <span className="text-[10px] text-nomad-muted-dark">
                          {dbCafes.length} spots
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {dbCafes.map((cafe) => (
                        <CafeCard
                          key={cafe.id}
                          cafe={cafe}
                          isSelected={
                            selectedCafe?.id === cafe.id || hoveredCafe?.id === cafe.id
                          }
                          onHover={setHoveredCafe}
                          onOpenAddToList={setModalCafe}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* OSM Regional Cafes */}
                {osmCafes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 mt-4">
                      <span className="text-xs font-bold text-nomad-muted-dark uppercase tracking-wider">
                        📍 Discovered Nearby — OpenStreetMap
                      </span>
                      <div className="flex-1 h-px bg-nomad-navy-800" />
                      <span className="text-[10px] text-nomad-muted-dark">
                        {osmCafes.length} spots
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {osmCafes.map((cafe) => (
                        <OsmCafeCard key={cafe.id} cafe={cafe} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sticky Interactive Map */}
          <div className="lg:col-span-5 sticky top-20 h-[calc(100vh-7rem)] min-h-[500px]">
            <MapWrapper
              cafes={dbCafes}
              osmCafes={osmCafes}
              selectedCafe={selectedCafe || hoveredCafe}
              userLocation={location}
              dropPinMode={dropPinMode}
              onMapClick={handleMapClick}
              onSelectCafe={setSelectedCafe}
            />
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-6">
          {dbCafes.length > 0 && (
            <div>
              {filters.nearMe && osmCafes.length > 0 && (
                <h3 className="text-xs font-bold text-nomad-teal-400 uppercase tracking-wider mb-3">
                  ✓ Verified & Community Hubs
                </h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {dbCafes.map((cafe) => (
                  <CafeCard
                    key={cafe.id}
                    cafe={cafe}
                    isSelected={selectedCafe?.id === cafe.id}
                    onOpenAddToList={setModalCafe}
                  />
                ))}
              </div>
            </div>
          )}
          {osmCafes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-nomad-muted-dark uppercase tracking-wider mb-3">
                📍 Nearby from OpenStreetMap
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {osmCafes.map((cafe) => (
                  <OsmCafeCard key={cafe.id} cafe={cafe} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-[calc(100vh-13rem)] min-h-[550px]">
          <MapWrapper
            cafes={dbCafes}
            osmCafes={osmCafes}
            selectedCafe={selectedCafe}
            userLocation={location}
            dropPinMode={dropPinMode}
            onMapClick={handleMapClick}
            onSelectCafe={setSelectedCafe}
          />
        </div>
      )}

      {/* Add To List Modal */}
      {modalCafe && (
        <AddToListModal
          cafe={modalCafe}
          isOpen={!!modalCafe}
          onClose={() => setModalCafe(null)}
        />
      )}

      {/* Drop-a-Pin Submission Modal */}
      {droppedCoords && (
        <DropPinSubmissionModal
          isOpen={!!droppedCoords}
          coords={droppedCoords}
          onClose={() => setDroppedCoords(null)}
          onSuccess={handleDropPinSuccess}
        />
      )}
    </div>
  );
}
