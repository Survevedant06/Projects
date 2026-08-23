'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Compass,
  BookmarkCheck,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const navLinks = [
    { name: 'Plan smarter', href: '/planner' },
    { name: 'Save your time', href: '/' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full" style={{ backgroundColor: '#F0EBE1' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex h-16 items-center justify-between">

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm"
              style={{ background: 'linear-gradient(135deg, #E86B4A 0%, #D45A38 100%)' }}
            >
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#1B3A2D', fontFamily: 'Inter, sans-serif' }}>
              wander<span style={{ color: '#1B3A2D' }}>ai</span><span style={{ color: '#E86B4A' }}>.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? '#1B3A2D' : '#8A8478',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => e.target.style.color = '#1B3A2D'}
                  onMouseLeave={e => e.target.style.color = isActive ? '#1B3A2D' : '#8A8478'}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all"
                  style={{
                    borderColor: '#1B3A2D',
                    color: '#1B3A2D',
                    background: 'transparent',
                  }}
                >
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: '#E86B4A' }}
                  >
                    {session.user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  My trips
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-xl z-50"
                    style={{ background: 'white', border: '1px solid #E0D8CE' }}
                  >
                    <div className="px-3 py-2 mb-1" style={{ borderBottom: '1px solid #F0EBE1' }}>
                      <p className="text-xs font-semibold" style={{ color: '#1B3A2D' }}>
                        {session.user.name || 'Traveler'}
                      </p>
                      <p className="text-xs" style={{ color: '#8A8478' }}>
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/trips"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-colors"
                      style={{ color: '#1B3A2D' }}
                    >
                      <BookmarkCheck className="h-4 w-4" style={{ color: '#E86B4A' }} />
                      My Saved Trips
                    </Link>
                    <button
                      onClick={() => { setUserDropdownOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-colors"
                      style={{ color: '#B64628' }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors"
                  style={{ color: '#8A8478' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/trips"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                  style={{ borderColor: '#1B3A2D', color: '#1B3A2D', background: 'transparent' }}
                >
                  My trips
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden p-2 rounded-lg"
            style={{ color: '#1B3A2D' }}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-6 pb-5 space-y-2"
          style={{ borderTop: '1px solid #E0D8CE' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-medium"
              style={{ color: '#1B3A2D' }}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3" style={{ borderTop: '1px solid #E0D8CE' }}>
            <Link
              href="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#1B3A2D' }}
            >
              Plan a trip →
            </Link>
          </div>
          {session?.user ? (
            <button
              onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/' }) }}
              className="w-full text-left py-2 text-sm"
              style={{ color: '#B64628' }}
            >
              Sign Out ({session.user.name || session.user.email})
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm"
              style={{ color: '#8A8478' }}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
