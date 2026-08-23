import { NormalizedPlace, RawOsmElement, OverpassResponse } from './types';
import { haversineDistanceKm } from './geo-utils';

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=900&q=80',
];

/**
 * Builds an Overpass QL query querying nodes, ways, and relations (nwr) with
 * expanded remote-work friendly tags and center extraction for polygons.
 */
function buildOverpassQuery(radiusMeters: number, lat: number, lng: number): string {
  return `
[out:json][timeout:25];
(
  // Primary Workspace & Cafe POIs
  nwr["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
  nwr["amenity"="coworking_space"](around:${radiusMeters},${lat},${lng});
  nwr["amenity"="library"](around:${radiusMeters},${lat},${lng});
  nwr["amenity"="internet_cafe"](around:${radiusMeters},${lat},${lng});
  
  // Secondary Hospitality & Food Outlets
  nwr["amenity"="restaurant"]["cuisine"~"coffee|cafe|tea|bakery",i](around:${radiusMeters},${lat},${lng});
  nwr["amenity"="fast_food"]["cuisine"~"coffee|cafe|bakery",i](around:${radiusMeters},${lat},${lng});
  nwr["tourism"="hotel"]["internet_access"](around:${radiusMeters},${lat},${lng});

  // Speciality Coffee, Bakeries & Tea Rooms
  nwr["shop"="coffee"](around:${radiusMeters},${lat},${lng});
  nwr["shop"="bakery"]["cafe"](around:${radiusMeters},${lat},${lng});
  nwr["shop"="pastry"](around:${radiusMeters},${lat},${lng});
  nwr["shop"="tea"](around:${radiusMeters},${lat},${lng});
);
out center tags;
  `.trim();
}

/**
 * Normalizes an OSM node, way, or relation into the unified NomadSpot Place format.
 */
export function parseOsmElement(element: RawOsmElement, userLat: number, userLng: number): NormalizedPlace | null {
  const tags = element.tags;
  if (!tags || !tags.name) return null;

  // Extract lat/lng: nodes use element.lat/lon; ways & relations use element.center
  const itemLat = element.lat ?? element.center?.lat;
  const itemLng = element.lon ?? element.center?.lon;

  if (itemLat === undefined || itemLng === undefined) return null;

  const distanceKm = haversineDistanceKm(userLat, userLng, itemLat, itemLng);

  // Address parsing from OSM tags
  const street = tags['addr:street']
    ? `${tags['addr:housenumber'] ? tags['addr:housenumber'] + ' ' : ''}${tags['addr:street']}`
    : undefined;
  const suburb = tags['addr:suburb'] || tags['addr:neighbourhood'] || tags['addr:quarter'];
  const city = tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || tags['addr:county'] || 'Nearby';

  const fullAddress = [street, suburb, city].filter(Boolean).join(', ') || 'Address on Map';

  // Workspace heuristics from tags
  const hasWifi = tags.internet_access === 'wlan' || tags.internet_access === 'yes' || tags.wifi === 'yes' || !!tags['internet_access:fee'];
  const isCoworking = tags.amenity === 'coworking_space' || tags.amenity === 'library';

  const imageIndex = Math.abs(element.id) % DEFAULT_IMAGES.length;

  return {
    id: `osm_${element.id}`,
    osmId: BigInt(element.id),
    source: 'OSM',
    name: tags.name.trim(),
    slug: `${tags.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${element.id}`,
    lat: itemLat,
    lng: itemLng,
    address: fullAddress,
    city,
    neighborhood: suburb || null,
    phone: tags.phone || tags['contact:phone'] || null,
    website: tags.website || tags['contact:website'] || null,
    coverImage: DEFAULT_IMAGES[imageIndex],
    images: JSON.stringify([DEFAULT_IMAGES[imageIndex]]),
    distanceKm,

    // Amenities
    hasWifi: hasWifi || isCoworking,
    wifiSpeedMbps: isCoworking ? 100 : (hasWifi ? 50 : 25),
    wifiUploadMbps: isCoworking ? 50 : (hasWifi ? 20 : 10),
    wifiReliability: isCoworking ? 'ROCK_SOLID' : 'STABLE',
    powerPlugDensity: isCoworking ? 'AT_EVERY_SEAT' : 'MODERATE',
    noiseLevel: isCoworking ? 'QUIET' : 'MODERATE',
    seatingComfort: isCoworking ? 'ERGONOMIC' : 'MIXED',
    isVerified: false,
    status: 'COMMUNITY_ADDED',
    openingHours: tags.opening_hours || 'Hours not listed',
    averageRating: 0.0,
    reviewCount: 0,
  };
}

/**
 * Executes an Overpass QL query with adaptive radius stepping:
 * 3 km (standard) -> 7 km (tier-2/suburb) -> 15 km (regional/rural)
 */
export async function fetchOverpassPlaces(
  lat: number,
  lng: number,
  initialRadiusKm: number = 3,
  minRequiredResults: number = 8
): Promise<{ places: NormalizedPlace[]; executedRadiusKm: number }> {
  const radiusSteps = [initialRadiusKm, 7, 15];
  let finalPlaces: NormalizedPlace[] = [];
  let executedRadius = initialRadiusKm;

  for (const radiusKm of radiusSteps) {
    executedRadius = radiusKm;
    const radiusMeters = Math.min(radiusKm * 1000, 20000);
    const query = buildOverpassQuery(radiusMeters, lat, lng);

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(28000),
      });

      if (!response.ok) {
        console.warn(`[Overpass] HTTP ${response.status} at ${radiusKm}km radius.`);
        continue;
      }

      const data: OverpassResponse = await response.json();
      const parsed = data.elements
        .map((el) => parseOsmElement(el, lat, lng))
        .filter((item): item is NormalizedPlace => item !== null);

      if (parsed.length >= minRequiredResults || radiusKm === 15) {
        finalPlaces = parsed;
        break;
      }
    } catch (err) {
      console.warn(`[Overpass] Request failed at radius ${radiusKm}km:`, err);
    }
  }

  // Sort by nearest distance
  finalPlaces.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  return { places: finalPlaces, executedRadiusKm: executedRadius };
}
