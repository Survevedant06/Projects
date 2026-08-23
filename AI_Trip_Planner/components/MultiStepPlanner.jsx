'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, Calendar, Users, Compass, Sparkles,
  ArrowRight, ArrowLeft, Check, Utensils, Camera,
  Heart, Mountain, SunMedium, Plane, Loader2, Info, ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'

const POPULAR_DESTINATIONS = [
  { name: 'Goa, India',        tag: 'Beaches' },
  { name: 'Tokyo, Japan',      tag: 'Culture' },
  { name: 'Paris, France',     tag: 'Romance' },
  { name: 'Bali, Indonesia',   tag: 'Wellness' },
  { name: 'Dubai, UAE',        tag: 'Luxury' },
  { name: 'Kyoto, Japan',      tag: 'History' },
  { name: 'New York, USA',     tag: 'Cityscape' },
  { name: 'London, UK',        tag: 'Heritage' },
]

const TRAVEL_STYLES = [
  { id: 'Foodie & Culinary',         icon: '🍜', desc: 'Street food, markets & dining' },
  { id: 'Cultural & Historic',        icon: '🏛️', desc: 'Temples, museums & monuments' },
  { id: 'Adventure & Outdoors',       icon: '🏔️', desc: 'Hiking, water sports & thrills' },
  { id: 'Relaxed & Wellness',         icon: '🌿', desc: 'Beaches, cafes & slow pace' },
  { id: 'Sightseeing & Photography',  icon: '📸', desc: 'Iconic landmarks & viewpoints' },
  { id: 'Romantic Getaway',           icon: '💕', desc: 'Sunset spots & cozy dinners' },
]

const BUDGET_TIERS = [
  { id: 'Budget',   emoji: '🎒', label: 'Budget / Backpacker',  desc: 'Hostels, public transit, street food' },
  { id: 'Moderate', emoji: '🏨', label: 'Moderate / Balanced',   desc: '3–4★ hotels, mid-tier restaurants' },
  { id: 'Luxury',   emoji: '✨', label: 'Luxury / Premium',      desc: '5★ resorts, private transfers & fine dining' },
]

const LOADING_TIPS = [
  'Exploring local hidden gems and landmarks…',
  'Curating morning, afternoon & evening slots…',
  'Calculating realistic costs and meal picks…',
  'Mapping coordinates and polyline routes…',
  'Assembling your personalised travel guide…',
]

const STEPS = [
  { num: 1, label: 'Destination' },
  { num: 2, label: 'Group & Style' },
  { num: 3, label: 'Budget' },
  { num: 4, label: 'Extras' },
]

// ─── Shared style tokens ───────────────────────────────────────
const C = {
  cream: '#F0EBE1',
  forest: '#1B3A2D',
  coral: '#E86B4A',
  warmGray: '#8A8478',
  muted: '#5A5248',
  border: '#E0D8CE',
  cardBg: '#FAFAF8',
}

function InputField({ label, children, hint }) {
  return (
    <div>
      {label && (
        <label className="block text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: C.warmGray }}>
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-[11px] mt-1" style={{ color: C.warmGray }}>{hint}</p>}
    </div>
  )
}

export default function MultiStepPlanner({ initialDestination = '' }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTipIndex, setLoadingTipIndex] = useState(0)

  const [formData, setFormData] = useState({
    destination: initialDestination || '',
    duration: 4,
    startDate: '',
    groupSize: 2,
    groupType: 'Couple',
    travelStyles: ['Foodie & Culinary'],
    currency: 'USD',
    budgetTier: 'Moderate',
    pace: 'Balanced (Good mix of sights and cafes)',
    dietaryRestrictions: 'None (Everything)',
    specialNotes: '',
  })

  useEffect(() => {
    if (initialDestination && !formData.destination) {
      setFormData(p => ({ ...p, destination: initialDestination }))
    }
  }, [initialDestination])

  useEffect(() => {
    if (!isLoading) return
    const iv = setInterval(() => setLoadingTipIndex(p => (p + 1) % LOADING_TIPS.length), 3000)
    return () => clearInterval(iv)
  }, [isLoading])

  const update = (key, val) => setFormData(p => ({ ...p, [key]: val }))

  const toggleStyle = (id) => {
    setFormData(p => {
      const has = p.travelStyles.includes(id)
      if (has && p.travelStyles.length === 1) return p
      return { ...p, travelStyles: has ? p.travelStyles.filter(s => s !== id) : [...p.travelStyles, id] }
    })
  }

  const handleNext = () => {
    if (step === 1 && !formData.destination.trim()) {
      toast.error('Please enter or select a destination.')
      return
    }
    setStep(p => Math.min(p + 1, 4))
  }

  const handleBack = () => setStep(p => Math.max(p - 1, 1))

  const goToStep = (n) => {
    if (n > 1 && !formData.destination.trim()) {
      toast.error('Please choose a destination first.')
      return
    }
    setStep(n)
  }

  const handleSubmit = async () => {
    if (!formData.destination.trim()) { toast.error('Please enter a destination.'); return }
    setIsLoading(true)
    try {
      const payload = {
        destination: formData.destination.trim(),
        duration: Number(formData.duration),
        startDate: formData.startDate || null,
        groupSize: Number(formData.groupSize),
        travelStyle: formData.travelStyles.join(', '),
        currency: formData.currency,
        budgetTier: formData.budgetTier,
        pace: formData.pace,
        dietaryRestrictions: formData.dietaryRestrictions,
        specialNotes: formData.specialNotes,
      }
      const res = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const raw = await res.text()
      let data
      try { data = JSON.parse(raw) } catch { throw new Error('Unexpected server response. Please try again.') }
      if (!res.ok) throw new Error(data.error || 'Failed to generate itinerary')
      toast.success('Your itinerary has been crafted!')
      router.push(`/trip/${data.id}`)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Something went wrong.')
      setIsLoading(false)
    }
  }

  // ── Loading Screen ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="w-full max-w-lg mx-auto rounded-2xl p-10 text-center"
        style={{ background: 'white', boxShadow: '0 2px 32px rgba(27,58,45,0.1)' }}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: '#E8F5EE' }}
        >
          <Plane
            className="h-9 w-9"
            style={{ color: C.coral, animation: 'bounce 1s infinite' }}
          />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: C.forest, fontFamily: 'Playfair Display, serif' }}>
          Crafting your {formData.duration}-day trip to {formData.destination}
        </h2>
        <p className="text-sm h-8 transition-all" style={{ color: C.coral }}>
          {LOADING_TIPS[loadingTipIndex]}
        </p>
        {/* Animated progress bar */}
        <div className="mt-8 h-1.5 rounded-full overflow-hidden" style={{ background: '#E0D8CE' }}>
          <div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${C.coral}, ${C.forest})`,
              width: '100%',
              animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
            }}
          />
        </div>
        <p className="text-xs mt-4" style={{ color: C.warmGray }}>
          Powered by AI & Google Maps · Usually takes 5–10 seconds
        </p>
      </div>
    )
  }

  // ── Shared input style ───────────────────────────────────────
  const inputCls = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: `1.5px solid ${C.border}`,
    background: C.cardBg,
    color: C.forest,
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const focusHandlers = {
    onFocus: e => { e.target.style.borderColor = C.coral; e.target.style.boxShadow = '0 0 0 3px rgba(232,107,74,0.12)' },
    onBlur:  e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' },
  }

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden"
      style={{ background: 'white', boxShadow: '0 2px 32px rgba(27,58,45,0.1)' }}
    >
      {/* ── Progress Header ────────────────────────────────── */}
      <div className="px-7 pt-7 pb-5" style={{ borderBottom: `1px solid ${C.cream}` }}>
        {/* Step label */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: C.coral }}>
            STEP {step} OF 4
          </p>
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map(s => (
              <button
                key={s.num}
                type="button"
                onClick={() => goToStep(s.num)}
                title={s.label}
                className="rounded-full transition-all"
                style={{
                  height: '5px',
                  width: step === s.num ? '28px' : step > s.num ? '20px' : '20px',
                  background: step === s.num ? C.coral : step > s.num ? C.forest : C.border,
                }}
              />
            ))}
          </div>
        </div>

        {/* Clickable step tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {STEPS.map(s => (
            <button
              key={s.num}
              type="button"
              onClick={() => goToStep(s.num)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: step === s.num ? C.forest : step > s.num ? '#E8F5EE' : 'transparent',
                color: step === s.num ? 'white' : step > s.num ? C.forest : C.warmGray,
                border: `1px solid ${step === s.num ? C.forest : step > s.num ? '#B3D0C2' : C.border}`,
              }}
            >
              {step > s.num && '✓ '}{s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Step Content ───────────────────────────────────── */}
      <div className="px-7 py-6 space-y-6">

        {/* ── STEP 1 ── Destination & Dates ─────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: C.forest, fontFamily: 'Playfair Display, serif' }}>
                Where to next?
              </h2>
              <p className="text-sm" style={{ color: C.warmGray }}>Type a destination or tap a popular pick below.</p>
            </div>

            {/* Destination input */}
            <InputField label="Destination *">
              <div className="relative">
                <MapPin
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: C.coral }}
                />
                <input
                  type="text"
                  placeholder="e.g. Goa, Tokyo, Paris, Bali…"
                  value={formData.destination}
                  onChange={e => update('destination', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  style={{ ...inputCls, paddingLeft: '38px' }}
                  {...focusHandlers}
                  autoFocus
                />
              </div>
            </InputField>

            {/* Popular destination pills */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: C.warmGray }}>
                POPULAR PICKS
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_DESTINATIONS.map(d => {
                  const isSelected = formData.destination.toLowerCase().trim() === d.name.toLowerCase().trim()
                    || formData.destination.toLowerCase().trim() === d.name.split(',')[0].toLowerCase().trim()
                  return (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => update('destination', d.name)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5"
                      style={{
                        border: `1.5px solid ${isSelected ? C.coral : C.border}`,
                        background: isSelected ? '#FEF5F2' : 'white',
                        color: isSelected ? C.coral : C.muted,
                      }}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {d.name.split(',')[0]}
                      <span className="opacity-60">· {d.tag}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Duration + Start Date */}
            <div className="grid grid-cols-2 gap-4">
              <InputField label={`Duration: ${formData.duration} day${formData.duration > 1 ? 's' : ''}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1" max="10"
                    value={formData.duration}
                    onChange={e => update('duration', Number(e.target.value))}
                    className="flex-1 cursor-pointer"
                    style={{ accentColor: C.coral }}
                  />
                  <span
                    className="text-sm font-bold w-10 text-center py-1 rounded-lg"
                    style={{ background: '#E8F5EE', color: C.forest }}
                  >
                    {formData.duration}d
                  </span>
                </div>
              </InputField>

              <InputField label="Start Date (optional)">
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: C.warmGray }}
                  />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => update('startDate', e.target.value)}
                    style={{ ...inputCls, paddingLeft: '34px' }}
                    {...focusHandlers}
                  />
                </div>
              </InputField>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── Group & Travel Style ─────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: C.forest, fontFamily: 'Playfair Display, serif' }}>
                Who's coming & what's your vibe?
              </h2>
              <p className="text-sm" style={{ color: C.warmGray }}>Choose travel companions and style preferences.</p>
            </div>

            {/* Group type cards */}
            <InputField label="Traveling With">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { type: 'Solo',    count: 1, icon: '🎒', label: 'Solo' },
                  { type: 'Couple',  count: 2, icon: '💑', label: 'Couple' },
                  { type: 'Family',  count: 4, icon: '👨‍👩‍👧', label: 'Family' },
                  { type: 'Friends', count: 5, icon: '🎉', label: 'Friends' },
                ].map(item => {
                  const isSelected = formData.groupType === item.type
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, groupType: item.type, groupSize: item.count }))}
                      className="p-3 rounded-xl text-center transition-all"
                      style={{
                        border: `1.5px solid ${isSelected ? C.forest : C.border}`,
                        background: isSelected ? '#F2F6F4' : 'white',
                        boxShadow: isSelected ? `0 0 0 2px rgba(27,58,45,0.12)` : 'none',
                      }}
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs font-bold" style={{ color: C.forest }}>{item.label}</div>
                    </button>
                  )
                })}
              </div>
            </InputField>

            {/* Travel styles */}
            <InputField label="Travel Style (pick any)">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TRAVEL_STYLES.map(st => {
                  const isSelected = formData.travelStyles.includes(st.id)
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleStyle(st.id)}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                      style={{
                        border: `1.5px solid ${isSelected ? C.forest : C.border}`,
                        background: isSelected ? '#F2F6F4' : 'white',
                      }}
                    >
                      <span className="text-xl">{st.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold flex items-center justify-between" style={{ color: C.forest }}>
                          {st.id}
                          {isSelected && <Check className="h-3 w-3 shrink-0" style={{ color: C.coral }} />}
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: C.warmGray }}>{st.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </InputField>
          </div>
        )}

        {/* ── STEP 3 ── Budget & Currency ─────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: C.forest, fontFamily: 'Playfair Display, serif' }}>
                What's your budget feel?
              </h2>
              <p className="text-sm" style={{ color: C.warmGray }}>AI will tailor costs, hotels & dining to match.</p>
            </div>

            {/* Currency selector */}
            <InputField label="Currency">
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { code: 'USD', sym: '$', label: 'Dollar' },
                  { code: 'INR', sym: '₹', label: 'Rupee' },
                  { code: 'EUR', sym: '€', label: 'Euro' },
                  { code: 'GBP', sym: '£', label: 'Pound' },
                ].map(c => {
                  const isSel = formData.currency === c.code
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => update('currency', c.code)}
                      className="py-3 px-2 rounded-xl text-center transition-all"
                      style={{
                        border: `1.5px solid ${isSel ? C.coral : C.border}`,
                        background: isSel ? '#FEF5F2' : 'white',
                      }}
                    >
                      <span className="text-lg font-bold block" style={{ color: isSel ? C.coral : C.forest }}>
                        {c.sym}
                      </span>
                      <span className="text-[11px] font-semibold block" style={{ color: C.muted }}>
                        {c.code}
                      </span>
                    </button>
                  )
                })}
              </div>
            </InputField>

            {/* Budget tier */}
            <InputField label="Budget Tier">
              <div className="space-y-2.5">
                {BUDGET_TIERS.map(tier => {
                  const isSel = formData.budgetTier === tier.id
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => update('budgetTier', tier.id)}
                      className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all"
                      style={{
                        border: `1.5px solid ${isSel ? C.coral : C.border}`,
                        background: isSel ? '#FEF5F2' : C.cardBg,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{tier.emoji}</span>
                        <div>
                          <div className="text-sm font-bold" style={{ color: C.forest }}>{tier.label}</div>
                          <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>{tier.desc}</p>
                        </div>
                      </div>
                      <div
                        className="h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: isSel ? C.coral : C.border,
                          background: isSel ? C.coral : 'transparent',
                          width: '18px',
                          height: '18px',
                        }}
                      >
                        {isSel && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </InputField>
          </div>
        )}

        {/* ── STEP 4 ── Preferences & Notes ───────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: C.forest, fontFamily: 'Playfair Display, serif' }}>
                Any special requests?
              </h2>
              <p className="text-sm" style={{ color: C.warmGray }}>Pace, diet, must-sees — make it entirely yours.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Pace">
                <div className="relative">
                  <select
                    value={formData.pace}
                    onChange={e => update('pace', e.target.value)}
                    style={{ ...inputCls, paddingRight: '32px', appearance: 'none' }}
                    {...focusHandlers}
                  >
                    <option value="Relaxed (Few sights, plenty of downtime)">Relaxed & Chill</option>
                    <option value="Balanced (Good mix of sights and cafes)">Balanced (Recommended)</option>
                    <option value="Fast-Paced (Pack in as much as possible)">Fast-Paced</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: C.warmGray }} />
                </div>
              </InputField>

              <InputField label="Dietary Preference">
                <div className="relative">
                  <select
                    value={formData.dietaryRestrictions}
                    onChange={e => update('dietaryRestrictions', e.target.value)}
                    style={{ ...inputCls, paddingRight: '32px', appearance: 'none' }}
                    {...focusHandlers}
                  >
                    <option value="None (Everything)">No Restrictions</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Halal">Halal</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: C.warmGray }} />
                </div>
              </InputField>
            </div>

            <InputField label="Must-see landmarks or notes (optional)">
              <textarea
                rows={3}
                placeholder="e.g. Must visit Baga Beach and Old Goa churches; love authentic seafood thali places."
                value={formData.specialNotes}
                onChange={e => update('specialNotes', e.target.value)}
                style={{ ...inputCls, resize: 'none' }}
                {...focusHandlers}
              />
            </InputField>

            {/* Summary card */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: '#E8F5EE', border: '1px solid #B3D0C2' }}
            >
              <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: C.forest }} />
              <p className="text-xs leading-relaxed" style={{ color: C.forest }}>
                <strong>{formData.duration} days</strong> in <strong>{formData.destination}</strong> ·{' '}
                {formData.groupSize} {formData.groupSize === 1 ? 'traveller' : 'travellers'} ·{' '}
                {formData.budgetTier} budget in {formData.currency} ·{' '}
                {formData.travelStyles.slice(0, 2).join(', ')}
                {formData.travelStyles.length > 2 && ` +${formData.travelStyles.length - 2} more`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation Buttons ─────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-4 px-7 py-5"
        style={{ borderTop: `1px solid ${C.cream}` }}
      >
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ border: `1.5px solid ${C.border}`, color: C.muted, background: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.forest}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: C.forest }}
            onMouseEnter={e => { e.currentTarget.style.background = '#243F32'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.forest; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: C.coral }}
            onMouseEnter={e => { e.currentTarget.style.background = '#D45A38'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.coral; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Sparkles className="h-4 w-4" /> Generate My Itinerary
          </button>
        )}
      </div>
    </div>
  )
}
