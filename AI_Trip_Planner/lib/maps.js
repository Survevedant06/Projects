// Maps & Geolocation Service with Google Places API proxy and caching

const geocodeCache = new Map()

// Popular destination fallback center coordinates
const DESTINATION_CENTERS = {
  tokyo: { lat: 35.6762, lng: 139.6503 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5074, lng: -0.1278 },
  newyork: { lat: 40.7128, lng: -74.006 },
  'new york': { lat: 40.7128, lng: -74.006 },
  rome: { lat: 41.9028, lng: 12.4964 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  goa: { lat: 15.2993, lng: 74.124 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  bali: { lat: -8.3405, lng: 115.092 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
}

export function getFallbackCoordinates(destination, spotName = '', index = 0) {
  const normDest = destination.toLowerCase().trim()
  let center = { lat: 40.7128, lng: -74.006 } // default fallback

  for (const [key, coords] of Object.entries(DESTINATION_CENTERS)) {
    if (normDest.includes(key)) {
      center = coords
      break
    }
  }

  // Create subtle deterministic geographic spread based on index and spot name hash
  let hash = 0
  for (let i = 0; i < spotName.length; i++) {
    hash = (hash << 5) - hash + spotName.charCodeAt(i)
    hash |= 0
  }

  const offsetLat = ((hash % 100) / 2500) + (index * 0.008 - 0.015)
  const offsetLng = (((hash >> 3) % 100) / 2500) + (index * 0.008 - 0.015)

  return {
    lat: Number((center.lat + offsetLat).toFixed(6)),
    lng: Number((center.lng + offsetLng).toFixed(6)),
    formattedAddress: `${spotName}, ${destination}`,
    source: 'estimated',
  }
}

export async function geocodePlace(placeName, destination = '') {
  const query = `${placeName}, ${destination}`.trim()
  const cacheKey = query.toLowerCase()

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    const fallback = getFallbackCoordinates(destination, placeName)
    geocodeCache.set(cacheKey, fallback)
    return fallback
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      query
    )}&inputtype=textquery&fields=formatted_address,name,geometry,place_id,rating,photos&key=${apiKey}`

    const res = await fetch(url)
    const data = await res.json()

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0]
      const result = {
        lat: candidate.geometry?.location?.lat,
        lng: candidate.geometry?.location?.lng,
        formattedAddress: candidate.formatted_address || query,
        placeId: candidate.place_id,
        rating: candidate.rating,
        photoReference: candidate.photos?.[0]?.photo_reference,
        source: 'google',
      }
      geocodeCache.set(cacheKey, result)
      return result
    }
  } catch (error) {
    console.error('Google Places Geocode error:', error)
  }

  const fallback = getFallbackCoordinates(destination, placeName)
  geocodeCache.set(cacheKey, fallback)
  return fallback
}

export async function enrichItineraryCoordinates(itinerary) {
  if (!itinerary || !itinerary.days) return itinerary

  const destination = itinerary.destination || ''

  for (const day of itinerary.days) {
    if (day.activities && Array.isArray(day.activities)) {
      for (let i = 0; i < day.activities.length; i++) {
        const activity = day.activities[i]
        const locationQuery = activity.locationName || activity.name
        const geo = await geocodePlace(locationQuery, destination)
        
        activity.latitude = geo.lat
        activity.longitude = geo.lng
        activity.googlePlaceId = geo.placeId || null
        if (geo.rating && !activity.rating) {
          activity.rating = geo.rating
        }
      }
    }
  }

  return itinerary
}
