'use client';

import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ArrowUpDown,
  X,
  Navigation,
  Loader2,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';
import { FilterState } from '@/lib/types';
import AdvancedFilterModal from './AdvancedFilterModal';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  availableCities: string[];
  totalResults: number;
  nearMeLoading?: boolean;
  dropPinMode?: boolean;
  onToggleDropPin?: () => void;
  onRequestNearMe?: () => void;
  onClearNearMe?: () => void;
}

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
];

export default function FilterBar({
  filters,
  onChange,
  onReset,
  availableCities,
  totalResults,
  nearMeLoading = false,
  dropPinMode = false,
  onToggleDropPin,
  onRequestNearMe,
  onClearNearMe,
}: FilterBarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const presets = [
    {
      id: 'fast_wifi',
      label: '🚀 100+ Mbps',
      isActive: filters.minWifiSpeed >= 100,
      toggle: () =>
        onChange({ ...filters, minWifiSpeed: filters.minWifiSpeed >= 100 ? 0 : 100 }),
    },
    {
      id: 'outlets',
      label: '🔌 Plugs Everywhere',
      isActive: filters.plugDensity.includes('AT_EVERY_SEAT'),
      toggle: () => {
        const exists = filters.plugDensity.includes('AT_EVERY_SEAT');
        onChange({
          ...filters,
          plugDensity: exists ? [] : ['AT_EVERY_SEAT', 'PLENTIFUL'],
        });
      },
    },
    {
      id: 'quiet',
      label: '🤫 Silent / Quiet',
      isActive:
        filters.noiseLevel.includes('SILENT') || filters.noiseLevel.includes('QUIET'),
      toggle: () =>
        onChange({
          ...filters,
          noiseLevel: filters.noiseLevel.includes('SILENT') ? [] : ['SILENT', 'QUIET'],
        }),
    },
    {
      id: 'open_late',
      label: '🌙 Open Late',
      isActive: filters.openLateOnly,
      toggle: () => onChange({ ...filters, openLateOnly: !filters.openLateOnly }),
    },
    {
      id: 'specialty',
      label: '☕ Specialty Coffee',
      isActive: filters.specialtyCoffeeOnly,
      toggle: () =>
        onChange({ ...filters, specialtyCoffeeOnly: !filters.specialtyCoffeeOnly }),
    },
    {
      id: 'calls',
      label: '📞 Call Pods',
      isActive: filters.callBoothsOnly,
      toggle: () => onChange({ ...filters, callBoothsOnly: !filters.callBoothsOnly }),
    },
  ];

  const activeCount =
    (filters.minWifiSpeed > 0 ? 1 : 0) +
    filters.plugDensity.length +
    filters.noiseLevel.length +
    filters.seatingComfort.length +
    filters.lighting.length +
    [
      filters.openLateOnly,
      filters.specialtyCoffeeOnly,
      filters.outdoorSeatingOnly,
      filters.petFriendlyOnly,
      filters.callBoothsOnly,
      filters.verifiedOnly,
    ].filter(Boolean).length;

  const handleNearMeClick = () => {
    if (filters.nearMe) {
      onClearNearMe?.();
    } else {
      onRequestNearMe?.();
    }
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Search + Dropdowns + Actions */}
      <div className="bg-nomad-navy-900 border border-nomad-navy-800 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3 shadow-dune">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-nomad-muted-dark absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cafe, neighborhood, city, or roaster…"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-nomad-navy-950 border border-nomad-navy-800 text-sm text-nomad-sand-50 placeholder-nomad-muted-dark focus:outline-none focus:border-nomad-teal-500 focus:ring-1 focus:ring-nomad-teal-500/30 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-nomad-muted-dark hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* City Selector */}
          {!filters.nearMe && (
            <div className="relative flex-1 md:w-44">
              <MapPin className="w-4 h-4 text-nomad-teal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filters.city}
                onChange={(e) => onChange({ ...filters, city: e.target.value })}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-nomad-navy-950 border border-nomad-navy-800 text-sm font-medium text-nomad-sand-100 focus:outline-none focus:border-nomad-teal-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="All">All Cities</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Radius Selector */}
          {filters.nearMe && (
            <div className="flex items-center gap-1 bg-nomad-navy-950 border border-nomad-teal-500/30 rounded-xl px-2 py-1.5">
              <Navigation className="w-3.5 h-3.5 text-nomad-teal-400 flex-shrink-0" />
              <span className="text-[11px] text-nomad-teal-400 font-bold mr-1">Radius:</span>
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...filters, radiusKm: opt.value })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filters.radiusKm === opt.value
                      ? 'bg-nomad-teal-600 text-white shadow-teal-glow'
                      : 'text-nomad-muted-dark hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Sort Selector */}
          <div className="relative flex-1 md:w-40">
            <ArrowUpDown className="w-3.5 h-3.5 text-nomad-muted-dark absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
              }
              className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-nomad-navy-950 border border-nomad-navy-800 text-sm font-medium text-nomad-sand-100 focus:outline-none focus:border-nomad-teal-500 appearance-none cursor-pointer transition-colors"
            >
              {filters.nearMe && <option value="nearest">📍 Nearest First</option>}
              <option value="highest_rated">★ Top Rated</option>
              <option value="fastest_wifi">🚀 Fastest WiFi</option>
              <option value="most_reviews">💬 Most Reviews</option>
              <option value="name">🔤 Name A-Z</option>
            </select>
          </div>

          {/* 📍 Near Me Button */}
          <button
            onClick={handleNearMeClick}
            disabled={nearMeLoading}
            className={`px-3.5 py-2.5 rounded-xl text-sm font-bold border flex items-center gap-2 whitespace-nowrap transition-all ${
              filters.nearMe
                ? 'bg-nomad-teal-600 text-white border-nomad-teal-500 shadow-teal-glow'
                : 'bg-nomad-navy-950 border-nomad-navy-800 text-nomad-sand-200 hover:border-nomad-teal-500/50 hover:text-white'
            }`}
          >
            {nearMeLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : filters.nearMe ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Navigation className="w-4 h-4 text-nomad-teal-400" />
            )}
            <span>{nearMeLoading ? 'Locating…' : filters.nearMe ? 'Near Me ✓' : 'Near Me'}</span>
          </button>

          {/* Drop-a-Pin Button */}
          {onToggleDropPin && (
            <button
              onClick={onToggleDropPin}
              className={`px-3.5 py-2.5 rounded-xl text-sm font-bold border flex items-center gap-1.5 whitespace-nowrap transition-all ${
                dropPinMode
                  ? 'bg-nomad-sienna-600 text-white border-nomad-sienna-500 shadow-sienna-glow'
                  : 'bg-nomad-navy-950 border-nomad-navy-800 text-nomad-sand-200 hover:border-nomad-sienna-500/50 hover:text-white'
              }`}
              title="Click on the map to add a workspace"
            >
              <PlusCircle className="w-4 h-4 text-nomad-sienna-500" />
              <span>{dropPinMode ? 'Click Map Pin' : 'Drop a Pin'}</span>
            </button>
          )}

          {/* More Filters Modal */}
          <button
            onClick={() => setModalOpen(true)}
            className={`px-3.5 py-2.5 rounded-xl text-sm font-bold border flex items-center gap-2 whitespace-nowrap transition-all ${
              activeCount > 0
                ? 'bg-nomad-teal-600 text-white border-nomad-teal-500 shadow-teal-glow'
                : 'bg-nomad-navy-950 border-nomad-navy-800 text-nomad-sand-200 hover:border-nomad-teal-500/50 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-nomad-navy-950 text-nomad-teal-400 text-[10px] flex items-center justify-center font-black border border-nomad-teal-500/30">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Preset Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={p.toggle}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              p.isActive
                ? 'bg-nomad-teal-600 text-white border-nomad-teal-500 shadow-teal-glow'
                : 'bg-nomad-navy-900 text-nomad-sand-300 border-nomad-navy-800 hover:border-nomad-teal-500/40 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
        {(activeCount > 0 || filters.nearMe) && (
          <button
            onClick={() => {
              onReset();
              onClearNearMe?.();
            }}
            className="text-xs text-nomad-muted-dark hover:text-nomad-teal-400 underline whitespace-nowrap px-2 font-medium transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      <AdvancedFilterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        filters={filters}
        onChange={onChange}
        onReset={onReset}
        totalResults={totalResults}
      />
    </div>
  );
}
