'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusCircle, 
  MapPin, 
  Wifi, 
  Zap, 
  Volume1, 
  Coffee, 
  Armchair, 
  Sun, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building,
  Image as ImageIcon
} from 'lucide-react';
import CafeCard from '@/components/cafes/CafeCard';
import { CafeItem } from '@/lib/types';

export default function SubmitCafePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    address: '',
    city: 'San Francisco',
    neighborhood: '',
    lat: 37.7749,
    lng: -122.4194,
    phone: '',
    website: '',
    coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    priceLevel: 2,
    hasWifi: true,
    wifiSpeedMbps: 120.0,
    wifiUploadMbps: 60.0,
    wifiReliability: 'ROCK_SOLID',
    wifiPasswordNote: '',
    powerPlugDensity: 'PLENTIFUL',
    noiseLevel: 'QUIET',
    seatingCapacity: 'MEDIUM',
    seatingComfort: 'ERGONOMIC',
    lighting: 'NATURAL_LIGHT',
    hasOutdoorSeating: false,
    isPetFriendly: true,
    hasCallBooths: false,
    hasMeetingRooms: false,
    hasParking: false,
    hasAirConditioning: true,
    openLate: false,
    specialtyCoffee: true,
    roasterName: '',
    foodOptions: 'LIGHT_BITES',
    veganOptions: true,
    submitterName: 'Community Nomad',
  });

  // Dynamic preview mock object
  const previewCafe: CafeItem = {
    id: 'preview',
    name: formData.name || 'Your Cafe Name',
    slug: 'preview',
    tagline: formData.tagline || 'High-speed Wi-Fi, abundant plugs & specialty roasts.',
    description: formData.description || 'A productive workspace for remote workers.',
    address: formData.address || '123 Workspace Ave',
    city: formData.city,
    neighborhood: formData.neighborhood || 'Downtown',
    lat: formData.lat,
    lng: formData.lng,
    coverImage: formData.coverImage,
    images: JSON.stringify([formData.coverImage]),
    priceLevel: formData.priceLevel,
    hasWifi: formData.hasWifi,
    wifiSpeedMbps: formData.wifiSpeedMbps,
    wifiUploadMbps: formData.wifiUploadMbps,
    wifiReliability: formData.wifiReliability,
    wifiPasswordNote: formData.wifiPasswordNote,
    powerPlugDensity: formData.powerPlugDensity,
    noiseLevel: formData.noiseLevel,
    seatingCapacity: formData.seatingCapacity,
    seatingComfort: formData.seatingComfort,
    lighting: formData.lighting,
    hasOutdoorSeating: formData.hasOutdoorSeating,
    isPetFriendly: formData.isPetFriendly,
    hasCallBooths: formData.hasCallBooths,
    hasMeetingRooms: formData.hasMeetingRooms,
    hasParking: formData.hasParking,
    hasAirConditioning: formData.hasAirConditioning,
    hasRestrooms: true,
    openLate: formData.openLate,
    specialtyCoffee: formData.specialtyCoffee,
    roasterName: formData.roasterName,
    foodOptions: formData.foodOptions,
    veganOptions: formData.veganOptions,
    status: 'COMMUNITY_SUBMITTED',
    isVerified: true,
    openingHours: JSON.stringify({ daily: '8:00 AM - 8:00 PM' }),
    averageRating: 5.0,
    reviewCount: 1,
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name.trim() || !formData.address.trim()) {
        setError('Please provide the cafe name and address.');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/cafes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit workspace');
      }
      router.push(`/cafes/${data.cafe.slug}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong submitting the workspace');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-amber-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>Community Workspace Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Submit a Work-Friendly Cafe
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B6B]">
          Index new productive spots, record Wi-Fi speeds, and help fellow remote engineers find great workspaces.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-3 text-xs font-semibold">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
            step >= 1 ? 'bg-[#0EA5E9] text-stone-950 font-bold' : 'bg-[#0F172A] text-[#6B6B6B]'
          }`}
        >
          <span>1. Location & Identity</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
            step >= 2 ? 'bg-[#0EA5E9] text-stone-950 font-bold' : 'bg-[#0F172A] text-[#6B6B6B]'
          }`}
        >
          <span>2. Nomad Amenities & Telemetry</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
            step >= 3 ? 'bg-[#0EA5E9] text-stone-950 font-bold' : 'bg-[#0F172A] text-[#6B6B6B]'
          }`}
        >
          <span>3. Review & Publish</span>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center">
          {error}
        </div>
      )}

      {/* 2-Column Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#243247] shadow-sm">
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h3 className="font-bold text-base text-white border-b pb-3">
                Step 1: Venue Information
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                  Cafe / Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verve Coffee Roasters"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs sm:text-sm focus:ring-2 focus:ring-[#0EA5E9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                  Tagline / Quick Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spacious timber benches, 200 Mbps fiber, quiet backyard."
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs sm:text-sm focus:ring-2 focus:ring-[#0EA5E9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0EA5E9]"
                  >
                    <option value="San Francisco">San Francisco</option>
                    <option value="New York">New York</option>
                    <option value="Austin">Austin</option>
                    <option value="Berlin">Berlin</option>
                    <option value="Kyoto">Kyoto</option>
                    <option value="Bali">Bali (Canggu)</option>
                    <option value="London">London</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                    Neighborhood
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SOMA / Mission"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs sm:text-sm focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 Howard St"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs sm:text-sm focus:ring-2 focus:ring-[#0EA5E9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                  Cover Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs sm:text-sm focus:ring-2 focus:ring-[#0EA5E9]"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#090D16] hover:bg-[#0EA5E9] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <span>Next: Workspace Amenities</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-5">
              <h3 className="font-bold text-base text-white border-b pb-3">
                Step 2: Workspace Telemetry & Amenities
              </h3>

              {/* Wi-Fi Speed */}
              <div className="p-4 bg-[#090D16] rounded-2xl border border-[#243247] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-emerald-600" />
                    Measured Wi-Fi Speed (Download)
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-600">
                    {formData.wifiSpeedMbps} Mbps
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="350"
                  step="10"
                  value={formData.wifiSpeedMbps}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wifiSpeedMbps: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
                />
              </div>

              {/* Power Plug Density */}
              <div>
                <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                  Power Plug Density *
                </label>
                <select
                  value={formData.powerPlugDensity}
                  onChange={(e) => setFormData({ ...formData, powerPlugDensity: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs sm:text-sm font-medium"
                >
                  <option value="AT_EVERY_SEAT">⚡ Outlets at Every Single Seat</option>
                  <option value="PLENTIFUL">🔌 Plentiful Outlets (Most Tables)</option>
                  <option value="MODERATE">🔋 Moderate (A few wall outlets)</option>
                  <option value="SCARCE">⚠️ Scarce / Hard to find</option>
                </select>
              </div>

              {/* Noise Level */}
              <div>
                <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                  Background Noise Level *
                </label>
                <select
                  value={formData.noiseLevel}
                  onChange={(e) => setFormData({ ...formData, noiseLevel: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs sm:text-sm font-medium"
                >
                  <option value="SILENT">🤫 Library Silent (Ideal for deep focus)</option>
                  <option value="QUIET">🎧 Quiet & Focused (Gentle ambient music)</option>
                  <option value="MODERATE">☕ Moderate Coffee Shop Hum</option>
                  <option value="LIVELY">💬 Lively Ambient Chatter</option>
                </select>
              </div>

              {/* Seating & Lighting */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                    Seating Type
                  </label>
                  <select
                    value={formData.seatingComfort}
                    onChange={(e) => setFormData({ ...formData, seatingComfort: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs"
                  >
                    <option value="ERGONOMIC">Ergonomic Task Chairs</option>
                    <option value="MIXED">Mixed (Benches + Chairs)</option>
                    <option value="COZY_COUCHES">Couches & Armchairs</option>
                    <option value="BASIC">Basic Cafe Stools</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                    Natural Lighting
                  </label>
                  <select
                    value={formData.lighting}
                    onChange={(e) => setFormData({ ...formData, lighting: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs"
                  >
                    <option value="NATURAL_LIGHT">Floor-to-Ceiling Sun</option>
                    <option value="BRIGHT">Bright Studio</option>
                    <option value="DIM_COZY">Warm & Dim Cozy</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 bg-[#090D16] rounded-xl border border-[#243247] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.openLate}
                    onChange={(e) => setFormData({ ...formData, openLate: e.target.checked })}
                    className="rounded text-[#0EA5E9]"
                  />
                  <span>🌙 Open Late Past 8PM</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-[#090D16] rounded-xl border border-[#243247] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasCallBooths}
                    onChange={(e) => setFormData({ ...formData, hasCallBooths: e.target.checked })}
                    className="rounded text-[#0EA5E9]"
                  />
                  <span>📞 Call / Phone Pods</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-[#090D16] rounded-xl border border-[#243247] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specialtyCoffee}
                    onChange={(e) => setFormData({ ...formData, specialtyCoffee: e.target.checked })}
                    className="rounded text-[#0EA5E9]"
                  />
                  <span>☕ Specialty Coffee</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-[#090D16] rounded-xl border border-[#243247] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPetFriendly}
                    onChange={(e) => setFormData({ ...formData, isPetFriendly: e.target.checked })}
                    className="rounded text-[#0EA5E9]"
                  />
                  <span>🐶 Dog Friendly</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-[#A0A0A0] hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#090D16] hover:bg-[#0EA5E9] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <span>Next: Review & Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-base text-white border-b pb-3">
                Step 3: Verification & Submitter Info
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                  Detailed Workspace Review / Notes
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe where the best desks are, the vibe, seating comfort, food options, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs sm:text-sm focus:ring-2 focus:ring-[#0EA5E9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A0A0A0] mb-1">
                  Your Submitter Name / Handle
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera (@nomadcoder)"
                  value={formData.submitterName}
                  onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs sm:text-sm focus:ring-2 focus:ring-[#0EA5E9]"
                />
              </div>

              <div className="p-4 bg-[#0EA5E9]/10 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                  <span>Community Verification Policy</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Submitted workspaces are immediately published for community exploration and earn you Nomad Reputation points.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-[#A0A0A0] hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#0EA5E9] hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  {submitting ? (
                    <span>Publishing Workspace...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Publish Workspace to Directory</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] font-semibold px-1">
            <span>Live Listing Card Preview</span>
            <span className="text-[#0284C7] font-bold">Auto-updates</span>
          </div>

          <div className="max-w-sm mx-auto lg:max-w-none pointer-events-none opacity-95">
            <CafeCard cafe={previewCafe} />
          </div>
        </div>
      </div>
    </div>
  );
}
