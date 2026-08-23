import React from 'react'
import Link from 'next/link'
import { Compass, Globe, Sparkles, MapPin, Heart } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="no-print" style={{ background: '#1B3A2D', color: 'rgba(255,255,255,0.65)' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-white"
                style={{ background: '#E86B4A' }}
              >
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                wanderai<span style={{ color: '#E86B4A' }}>.</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Smart, personalised travel itineraries powered by AI & Google Maps.
              Plan in seconds — not hours.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-4 text-white">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/planner', label: 'Plan a Trip' },
                { href: '/trips',   label: 'My Saved Trips' },
                { href: '/login',   label: 'Sign In' },
              ].map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-4 text-white">Features</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" style={{ color: '#E86B4A' }} />
                AI JSON Itineraries
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" style={{ color: '#7DB09A' }} />
                Google Maps & Routes
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" style={{ color: '#7DB09A' }} />
                PDF & Public Sharing
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }}
        >
          <p>© {year} WanderAI. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made for meaningful miles <Heart className="h-3 w-3" style={{ color: '#E86B4A', fill: '#E86B4A' }} />
          </p>
        </div>
      </div>
    </footer>
  )
}
