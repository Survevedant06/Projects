'use client';

import React, { useState } from 'react';
import { MapPin, Wifi, Zap, Volume2, X, Sparkles } from 'lucide-react';
import { CafeItem } from '@/lib/types';

interface DropPinModalProps {
  isOpen: boolean;
  coords: { lat: number; lng: number } | null;
  onClose: () => void;
  onSuccess: (newPlace: CafeItem) => void;
}

export default function DropPinSubmissionModal({
  isOpen,
  coords,
  onClose,
  onSuccess,
}: DropPinModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [wifiSpeed, setWifiSpeed] = useState('65');
  const [plugDensity, setPlugDensity] = useState('PLENTIFUL');
  const [noiseLevel, setNoiseLevel] = useState('QUIET');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !coords) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/places/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          lat: coords.lat,
          lng: coords.lng,
          address,
          city: city || 'Local Area',
          wifiSpeedMbps: Number(wifiSpeed),
          powerPlugDensity: plugDensity,
          noiseLevel,
          comment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(data.place);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nomad-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-nomad-navy-900 border border-nomad-navy-700 rounded-3xl max-w-md w-full shadow-dune-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-nomad-navy-800 bg-nomad-navy-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-nomad-teal-500/10 border border-nomad-teal-500/20 text-nomad-teal-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-nomad-sand-50 text-base">
                Drop a Pin — Add Workspace
              </h3>
              <p className="text-[11px] text-nomad-muted-dark">
                Coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-nomad-navy-800 text-nomad-muted-dark hover:text-nomad-sand-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-nomad-sand-100">
          <div>
            <label className="block text-xs font-bold text-nomad-sand-200 uppercase tracking-wider mb-1">
              Cafe / Place Name *
            </label>
            <input
              required
              placeholder="e.g. Artjuna Garden Roastery"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-nomad-navy-950 border border-nomad-navy-700 text-sm text-white placeholder-nomad-muted-dark focus:outline-none focus:border-nomad-teal-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-nomad-sand-200 uppercase tracking-wider mb-1">
                City / Town
              </label>
              <input
                placeholder="e.g. Ratnagiri"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-nomad-navy-950 border border-nomad-navy-700 text-xs text-white placeholder-nomad-muted-dark focus:outline-none focus:border-nomad-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-nomad-sand-200 uppercase tracking-wider mb-1">
                Street / Landmark
              </label>
              <input
                placeholder="e.g. Near Sea View Rd"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-nomad-navy-950 border border-nomad-navy-700 text-xs text-white placeholder-nomad-muted-dark focus:outline-none focus:border-nomad-teal-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-nomad-sand-200 uppercase tracking-wider mb-1">
                <Wifi className="w-3.5 h-3.5 text-nomad-teal-400" /> Wi-Fi Speed
              </label>
              <select
                value={wifiSpeed}
                onChange={(e) => setWifiSpeed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-nomad-navy-950 border border-nomad-navy-700 text-xs font-medium text-white focus:outline-none focus:border-nomad-teal-500"
              >
                <option value="30">~30 Mbps (Standard)</option>
                <option value="65">~65 Mbps (Fast)</option>
                <option value="150">150+ Mbps (Fiber)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-nomad-sand-200 uppercase tracking-wider mb-1">
                <Zap className="w-3.5 h-3.5 text-nomad-sienna-500" /> Outlets
              </label>
              <select
                value={plugDensity}
                onChange={(e) => setPlugDensity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-nomad-navy-950 border border-nomad-navy-700 text-xs font-medium text-white focus:outline-none focus:border-nomad-teal-500"
              >
                <option value="PLENTIFUL">Plentiful Plugs</option>
                <option value="AT_EVERY_SEAT">At Every Seat</option>
                <option value="MODERATE">Moderate</option>
                <option value="SCARCE">Scarce</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-nomad-sand-200 uppercase tracking-wider mb-1">
              Nomad Note / Review
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Quiet garden workspace, good filter coffee, friendly staff."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-nomad-navy-950 border border-nomad-navy-700 text-xs text-white placeholder-nomad-muted-dark focus:outline-none focus:border-nomad-teal-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-3 bg-nomad-teal-600 hover:bg-nomad-teal-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-teal-glow transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                'Submitting...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Add to Community Map
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
