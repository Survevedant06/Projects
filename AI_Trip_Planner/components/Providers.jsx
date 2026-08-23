'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </SessionProvider>
  )
}
