import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Providers } from '@/components/Providers'

export const metadata = {
  title: 'WanderAI — Your Trip, Thoughtfully Planned',
  description:
    'Personalised day-by-day travel itineraries crafted by AI — with Google Maps routes, budget estimates, meal picks, and PDF exports.',
  keywords: ['travel planner', 'ai itinerary', 'google maps trip', 'vacation planner', 'wanderai'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen flex flex-col antialiased"
        style={{ background: '#F0EBE1', color: '#1B3A2D', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
