'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import {
  PlaneTakeoff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/trips'

  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        isSignUp: isSignUp ? 'true' : 'false',
        callbackUrl,
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(isSignUp ? 'Account created successfully!' : 'Welcome back!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      toast.error('An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: 'alex.traveler@wanderai.com',
        name: 'Alex Explorer',
        password: 'password123',
        isSignUp: 'false',
        callbackUrl,
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Logged in as Demo Traveler!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      toast.error('Demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/30 via-background to-background">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Intro */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <PlaneTakeoff className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            {isSignUp ? 'Create your WanderAI Account' : 'Welcome back, Traveler'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isSignUp
              ? 'Save your itineraries, edit spots, and export custom PDFs.'
              : 'Sign in to access your saved travel itineraries.'}
          </p>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="p-4 rounded-2xl border bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-sky-500/10 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              Instant 1-Click Demo Mode
            </span>
            <p className="text-[11px] text-muted-foreground">
              Explore with a pre-configured traveler profile.
            </p>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shrink-0"
          >
            Demo Sign In
          </button>
        </div>

        {/* Auth Box */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xl space-y-6">
          {/* Tab switch */}
          <div className="grid grid-cols-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isSignUp ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                isSignUp ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Explorer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="traveler@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/planner"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Continue without signing in (Guest Mode) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
