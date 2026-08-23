import { OsmCafe } from './types';

/** Haversine distance in km */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Format distance for display */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

interface OverpassNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassNode[];
}

const CAFE_IMAGES = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=800&q=70',
];

function parseOsmNode(el: OverpassNode, lat: number, lng: number): OsmCafe {
  const tags = el.tags!;
  const distanceKm = haversineKm(lat, lng, el.lat, el.lon);

  const addrParts = [
    tags['addr:housenumber'] && tags['addr:street']
      ? `${tags['addr:housenumber']} ${tags['addr:street']}`
      : tags['addr:street'],
    tags['addr:suburb'] || tags['addr:neighbourhood'],
    tags['addr:city'] || tags['addr:town'],
  ].filter(Boolean);

  return {
    id: `osm_${el.id}`,
    osmId: el.id,
    source: 'osm' as const,
    name: tags.name,
    lat: el.lat,
    lng: el.lon,
    address: addrParts.join(', ') || 'See on map',
    city: tags['addr:city'] || tags['addr:town'] || tags['addr:county'] || 'Nearby',
    neighborhood: tags['addr:suburb'] || tags['addr:neighbourhood'] || tags['addr:quarter'],
    website: tags.website || tags['contact:website'],
    phone: tags.phone || tags['contact:phone'],
    openingHours: tags.opening_hours,
    coverImage: CAFE_IMAGES[el.id % CAFE_IMAGES.length],
    distanceKm,
  };
}

/**
 * Build Overpass query — intentionally broad to catch local cafes in
 * tier-2/tier-3 cities (India etc.) where tagging is inconsistent.
 */
function buildQuery(radiusMeters: number, lat: number, lng: number): string {
  return `
[out:json][timeout:28];
(
  node["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
  node["amenity"="coffee_shop"](around:${radiusMeters},${lat},${lng});
  node["shop"="coffee"](around:${radiusMeters},${lat},${lng});
  node["shop"="tea"](around:${radiusMeters},${lat},${lng});
  node["amenity"="restaurant"]["cuisine"~"coffee|cafe|tea|espresso",i](around:${radiusMeters},${lat},${lng});
  node["amenity"="fast_food"]["cuisine"~"coffee|cafe",i](around:${radiusMeters},${lat},${lng});
  node["amenity"="ice_cream"]["name"~"cafe|coffee|brew",i](around:${radiusMeters},${lat},${lng});
);
out body;
  `.trim();
}

/** Build viewport bbox query for map panning */
function buildBboxQuery(south: number, west: number, north: number, east: number): string {
  // Cap bbox size to avoid overloading Overpass
  return `
[out:json][timeout:20];
(
  node["amenity"="cafe"](${south},${west},${north},${east});
  node["amenity"="coffee_shop"](${south},${west},${north},${east});
  node["shop"="coffee"](${south},${west},${north},${east});
);
out body;
  `.trim();
}

async function overpassFetch(query: string): Promise<OverpassResponse> {
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  return res.json();
}

/**
 * Fetch cafes near a point. Auto-expands radius up to 3× if < 5 results.
 */
export async function fetchNearbyCafes(
  lat: number,
  lng: number,
  radiusMeters: number = 5000
): Promise<OsmCafe[]> {
  let radius = radiusMeters;
  let elements: OverpassNode[] = [];

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const data = await overpassFetch(buildQuery(radius, lat, lng));
      elements = data.elements.filter(
        (el): el is OverpassNode => el.type === 'node' && !!el.tags?.name
      );
      // Auto-expand: if fewer than 5 named cafes, triple radius and retry
      if (elements.length >= 5) break;
      radius = Math.min(radius * 3, 25000); // max 25 km
    } catch (err) {
      if (attempt === 2) throw err;
      radius = Math.min(radius * 2, 25000);
    }
  }

  return elements
    .map(el => parseOsmNode(el, lat, lng))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Fetch cafes within a bounding box (for map viewport loading).
 * Used when user pans the map without Near Me mode.
 */
export async function fetchCafesInViewport(
  south: number,
  west: number,
  north: number,
  east: number,
  centerLat: number,
  centerLng: number
): Promise<OsmCafe[]> {
  const data = await overpassFetch(buildBboxQuery(south, west, north, east));
  const elements = data.elements.filter(
    (el): el is OverpassNode => el.type === 'node' && !!el.tags?.name
  );
  return elements
    .map(el => parseOsmNode(el, centerLat, centerLng))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 200); // cap at 200 pins per viewport
}
