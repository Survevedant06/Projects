'use client';

import React from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { FilterState } from '@/lib/types';

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export default function AdvancedFilterModal({ isOpen, onClose, filters, onChange, onReset, totalResults }: AdvancedFilterModalProps) {
  if (!isOpen) return null;

  const toggle = (key: 'plugDensity' | 'noiseLevel' | 'seatingComfort' | 'lighting', val: string) => {
    const cur = filters[key];
    onChange({ ...filters, [key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] });
  };

  const chipCls = (active: boolean) =>
    `p-2.5 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
      active
        ? 'bg-[#0EA5E9]/15 border-[#0EA5E9] text-[#0EA5E9] font-bold'
        : 'bg-[#090D16] border-[#243247] text-[#A0A0A0] hover:border-[#0EA5E9]/30 hover:text-white'
    }`;

  const checkCls = 'flex items-center gap-2 p-2.5 rounded-xl border border-[#243247] bg-[#090D16] text-xs text-[#A0A0A0] cursor-pointer hover:border-[#0EA5E9]/30 hover:text-white transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-[#243247] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#243247]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#0EA5E9]" />
            <h3 className="font-bold text-lg text-white">Workspace Filters</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#1E293B] text-[#6B6B6B] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-6">
          {/* Wi-Fi Speed Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-white uppercase tracking-wider">Minimum Wi-Fi Download Speed</label>
              <span className="font-mono text-xs font-bold text-[#0EA5E9] bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 px-2 py-0.5 rounded-md">
                {filters.minWifiSpeed === 0 ? 'Any Speed' : `${filters.minWifiSpeed}+ Mbps`}
              </span>
            </div>
            <input type="range" min="0" max="250" step="25" value={filters.minWifiSpeed}
              onChange={e => onChange({ ...filters, minWifiSpeed: parseInt(e.target.value) })}
              className="w-full h-2 bg-[#243247] rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]" />
            <div className="flex justify-between text-[11px] text-[#404040] mt-1.5 font-mono">
              {['0', '50', '100', '150', '200', '250+'].map(v => <span key={v}>{v}</span>)}
            </div>
          </div>

          {/* Power Outlets */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">Power Outlet Density</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['AT_EVERY_SEAT', '⚡ At Every Seat'],
                ['PLENTIFUL', '🔌 Plentiful (Most Tables)'],
                ['MODERATE', '🔋 Moderate (Some Walls)'],
                ['SCARCE', '⚠️ Scarce / Limited'],
              ].map(([val, label]) => (
                <button key={val} type="button" onClick={() => toggle('plugDensity', val)} className={chipCls(filters.plugDensity.includes(val))}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Noise Level */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">Background Noise Level</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['SILENT', '🤫 Library Silent'],
                ['QUIET', '🎧 Quiet & Focused'],
                ['MODERATE', '☕ Moderate Hum'],
                ['LIVELY', '💬 Lively Ambient'],
              ].map(([val, label]) => (
                <button key={val} type="button" onClick={() => toggle('noiseLevel', val)} className={chipCls(filters.noiseLevel.includes(val))}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Seating */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">Seating & Posture</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['ERGONOMIC', '🪑 Ergonomic Desks'],
                ['COZY_COUCHES', '🛋️ Couches & Sofas'],
                ['MIXED', '🔀 Mixed Seating'],
              ].map(([val, label]) => (
                <button key={val} type="button" onClick={() => toggle('seatingComfort', val)} className={chipCls(filters.seatingComfort.includes(val))}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Lighting */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">Daylight & Lighting</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['NATURAL_LIGHT', '☀️ Natural Light'],
                ['BRIGHT', '💡 Bright Studio'],
                ['DIM_COZY', '🕯️ Warm & Dim'],
              ].map(([val, label]) => (
                <button key={val} type="button" onClick={() => toggle('lighting', val)} className={chipCls(filters.lighting.includes(val))}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">Special Amenities</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['openLateOnly', '🌙 Open Late (8 PM+)', 'openLateOnly'],
                ['callBoothsOnly', '📞 Phone / Call Pods', 'callBoothsOnly'],
                ['specialtyCoffeeOnly', '☕ Specialty Coffee', 'specialtyCoffeeOnly'],
                ['outdoorSeatingOnly', '🌿 Outdoor Patio', 'outdoorSeatingOnly'],
                ['petFriendlyOnly', '🐶 Pet Friendly', 'petFriendlyOnly'],
                ['verifiedOnly', '🛡️ Verified Only', 'verifiedOnly'],
              ].map(([key, label]) => (
                <label key={key} className={checkCls}>
                  <input type="checkbox"
                    checked={!!(filters as any)[key]}
                    onChange={e => onChange({ ...filters, [key]: e.target.checked })}
                    className="rounded accent-[#0EA5E9] w-4 h-4" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#243247] flex items-center justify-between">
          <button onClick={onReset} className="flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-white transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0EA5E9] hover:bg-[#38BDF8] text-black shadow-[0_0_15px_rgba(14,165,233,0.2)] transition-all">
            Show {totalResults} Results
          </button>
        </div>
      </div>
    </div>
  );
}
