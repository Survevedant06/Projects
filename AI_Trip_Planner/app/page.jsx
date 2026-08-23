'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Compass, Star } from 'lucide-react'

const FEATURED_DESTINATIONS = [
  {
    name: 'Kyoto, Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
    tag: 'History & Tea',
    duration: '4 Days',
    budget: '$850',
  },
  {
    name: 'Goa, India',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
    tag: 'Beaches & Seafood',
    duration: '3 Days',
    budget: '₹25,000',
  },
  {
    name: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
    tag: 'Art & Romance',
    duration: '5 Days',
    budget: '$1,200',
  },
  {
    name: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop',
    tag: 'Wellness & Nature',
    duration: '6 Days',
    budget: '$650',
  },
]

export default function HomePage() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [days, setDays] = useState(4)

  const handleStart = (e) => {
    e.preventDefault()
    if (!destination.trim()) return
    router.push(`/planner?destination=${encodeURIComponent(destination.trim())}`)
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F0EBE1' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: Headline */}
            <div className="space-y-7">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
                style={{ background: '#E8F5EE', color: '#1B3A2D', border: '1px solid #B3D0C2' }}
              >
                <Compass className="h-3.5 w-3.5" style={{ color: '#E86B4A' }} />
                YOUR TRIP, THOUGHTFULLY PLANNED
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <h1
                  className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] font-bold"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#1B3A2D' }}
                >
                  Travel well.
                </h1>
                <h1
                  className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] font-bold italic"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#E86B4A' }}
                >
                  Feel more.
                </h1>
              </div>

              {/* Sub-copy */}
              <p
                className="text-base sm:text-lg leading-relaxed max-w-md"
                style={{ color: '#5A5248' }}
              >
                Tell us what you're dreaming of. WanderAI turns it into a considered itinerary with the right places, pace, and little moments.
              </p>

              {/* Value chips */}
              <div className="flex flex-col gap-2 text-sm font-medium" style={{ color: '#5A5248' }}>
                {['No cookie-cutter days', 'Built around you', 'Maps & budgets included'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" style={{ color: '#E86B4A' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form Card */}
            <div
              className="rounded-2xl p-7 sm:p-8"
              style={{
                background: 'white',
                boxShadow: '0 2px 32px rgba(27,58,45,0.1), 0 1px 6px rgba(27,58,45,0.06)',
              }}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: '#E86B4A' }}>
                    STEP 1 OF 3
                  </p>
                  <h2 className="text-xl font-bold" style={{ color: '#1B3A2D', fontFamily: 'Playfair Display, serif' }}>
                    Where to next?
                  </h2>
                </div>
                {/* Progress dots */}
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-7 rounded-full" style={{ background: '#E86B4A' }} />
                  <div className="h-1 w-5 rounded-full" style={{ background: '#E0D8CE' }} />
                  <div className="h-1 w-5 rounded-full" style={{ background: '#E0D8CE' }} />
                </div>
              </div>

              <form onSubmit={handleStart} className="space-y-4">
                {/* Destination input */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#8A8478' }}>
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kyoto, Japan"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      border: '1.5px solid #E0D8CE',
                      background: '#FAFAF8',
                      color: '#1B3A2D',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#E86B4A'
                      e.target.style.boxShadow = '0 0 0 3px rgba(232,107,74,0.12)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#E0D8CE'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                {/* Start date + Days */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#8A8478' }}>
                      Start date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ border: '1.5px solid #E0D8CE', background: '#FAFAF8', color: '#1B3A2D' }}
                      onFocus={e => {
                        e.target.style.borderColor = '#E86B4A'
                        e.target.style.boxShadow = '0 0 0 3px rgba(232,107,74,0.12)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#E0D8CE'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#8A8478' }}>
                      Days
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={days}
                      onChange={e => setDays(Number(e.target.value))}
                      className="w-full px-3 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ border: '1.5px solid #E0D8CE', background: '#FAFAF8', color: '#1B3A2D' }}
                      onFocus={e => {
                        e.target.style.borderColor = '#E86B4A'
                        e.target.style.boxShadow = '0 0 0 3px rgba(232,107,74,0.12)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#E0D8CE'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: '#1B3A2D' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#243F32'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1B3A2D'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Quick destination pills */}
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid #F0EBE1' }}>
                <p className="text-[11px] font-semibold mb-2" style={{ color: '#B0A898' }}>POPULAR RIGHT NOW</p>
                <div className="flex flex-wrap gap-2">
                  {['Goa', 'Tokyo', 'Bali', 'Paris', 'Dubai'].map(dest => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setDestination(dest)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        border: `1.5px solid ${destination === dest ? '#E86B4A' : '#E0D8CE'}`,
                        background: destination === dest ? '#FEF5F2' : 'transparent',
                        color: destination === dest ? '#E86B4A' : '#5A5248',
                      }}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'white' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#E86B4A' }}>
              THE PROCESS
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold"
              style={{ fontFamily: 'Playfair Display, serif', color: '#1B3A2D' }}
            >
              Three steps to your ideal trip.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Share your vision',
                desc: 'Tell us where, when, who, and how you like to travel — foodie, adventure, relaxed, cultural, or a mix.',
              },
              {
                num: '02',
                title: 'AI builds your plan',
                desc: 'Our AI crafts a day-by-day itinerary with real landmark names, estimated costs, local eats, and maps.',
              },
              {
                num: '03',
                title: 'Refine & export',
                desc: 'Edit activities, view interactive map routes, export as PDF, or share a live link with travel companions.',
              },
            ].map((item) => (
              <div key={item.num} className="space-y-4">
                <div
                  className="text-4xl font-bold"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#E0D8CE' }}
                >
                  {item.num}
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: '#1B3A2D' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8A8478' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED DESTINATIONS ─────────────────────────────── */}
      <section className="py-20" style={{ background: '#F0EBE1' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#E86B4A' }}>
                INSPIRATION
              </p>
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{ fontFamily: 'Playfair Display, serif', color: '#1B3A2D' }}
              >
                Where will you go next?
              </h2>
            </div>
            <Link
              href="/planner"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: '#1B3A2D' }}
            >
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_DESTINATIONS.map((dest) => (
              <Link
                key={dest.name}
                href={`/planner?destination=${encodeURIComponent(dest.name)}`}
                className="group block rounded-2xl overflow-hidden transition-all"
                style={{ background: 'white', boxShadow: '0 1px 8px rgba(27,58,45,0.07)' }}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className="absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ background: 'rgba(27,58,45,0.85)' }}
                  >
                    {dest.tag}
                  </div>
                  <div
                    className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.9)', color: '#5A5248' }}
                  >
                    {dest.duration}
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#1B3A2D' }}>{dest.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8A8478' }}>Est. {dest.budget}</p>
                  </div>
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center transition-all"
                    style={{ background: '#E86B4A' }}
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ─────────────────────────────────────────── */}
      <section className="py-16" style={{ background: '#1B3A2D' }}>
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#7DB09A' }}>
            MADE FOR MEANINGFUL MILES
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Your next adventure starts with one destination.
          </h2>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#E86B4A', color: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#D45A38' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#E86B4A' }}
          >
            Plan my trip <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
