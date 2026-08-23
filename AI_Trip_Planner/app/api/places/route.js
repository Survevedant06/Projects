import { NextResponse } from 'next/server'
import { geocodePlace, getFallbackCoordinates } from '@/lib/maps'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const placeName = searchParams.get('place') || ''
  const destination = searchParams.get('destination') || ''

  if (!placeName) {
    return NextResponse.json({ error: 'place parameter is required' }, { status: 400 })
  }

  try {
    const geo = await geocodePlace(placeName, destination)
    return NextResponse.json(geo)
  } catch (error) {
    console.error('Place API error:', error)
    const fallback = getFallbackCoordinates(destination, placeName)
    return NextResponse.json(fallback)
  }
}
