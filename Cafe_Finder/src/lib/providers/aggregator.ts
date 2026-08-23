import { prisma } from '@/lib/prisma';
import { NormalizedPlace } from './types';
import { fetchOverpassPlaces } from './overpass';
import { haversineDistanceKm, areDuplicates } from './geo-utils';

export interface AggregatorResult {
  places: NormalizedPlace[];
  executedRadiusKm: number;
  fromCache: boolean;
}

/**
 * Unified place discovery aggregator with DB write-through caching,
 * adaptive radius stepping, and multi-provider deduplication.
 */
export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  requestedRadiusKm: number = 5
): Promise<AggregatorResult> {
  // Delta in degrees: 1 deg lat ~ 111 km. For 25km, delta is ~0.25 deg.
  const degDelta = Math.max(0.3, (requestedRadiusKm / 111) * 1.5);

  // 1. Check existing places in DB cache within latitude/longitude delta
  const cachedDbPlaces = await prisma.cafe.findMany({
    where: {
      lat: { gte: lat - degDelta, lte: lat + degDelta },
      lng: { gte: lng - degDelta, lte: lng + degDelta },
    },
    include: { reviews: true },
  });

  const localPlaces: NormalizedPlace[] = cachedDbPlaces
    .map((p) => ({
      id: p.id,
      source: (p.source as NormalizedPlace['source']) || 'VERIFIED',
      osmId: p.osmId,
      googlePlaceId: p.googlePlaceId,
      mapboxId: p.mapboxId,
      name: p.name,
      slug: p.slug,
      lat: p.lat,
      lng: p.lng,
      address: p.address,
      city: p.city,
      neighborhood: p.neighborhood,
      phone: p.phone,
      website: p.website,
      coverImage: p.coverImage,
      images: p.images,
      hasWifi: p.hasWifi,
      wifiSpeedMbps: p.wifiSpeedMbps,
      wifiUploadMbps: p.wifiUploadMbps,
      wifiReliability: p.wifiReliability,
      powerPlugDensity: p.powerPlugDensity,
      noiseLevel: p.noiseLevel,
      seatingComfort: p.seatingComfort,
      isVerified: p.isVerified,
      status: p.status,
      openingHours: p.openingHours,
      averageRating: p.averageRating,
      reviewCount: p.reviewCount,
      distanceKm: haversineDistanceKm(lat, lng, p.lat, p.lng),
    }))
    .filter((p) => (p.distanceKm ?? 0) <= requestedRadiusKm);

  // 2. Fetch fresh/additional places from Overpass API (with adaptive stepping)
  let incomingOsmPlaces: NormalizedPlace[] = [];
  let executedRadiusKm = requestedRadiusKm;

  try {
    const overpassRes = await fetchOverpassPlaces(
      lat,
      lng,
      requestedRadiusKm,
      6
    );
    incomingOsmPlaces = overpassRes.places;
    executedRadiusKm = Math.max(requestedRadiusKm, overpassRes.executedRadiusKm);
  } catch (err) {
    console.warn('[Aggregator Overpass Fetch Warning]:', err);
  }

  // 3. Deduplicate incoming OSM places against existing DB records
  const uniqueIncoming: NormalizedPlace[] = [];

  for (const osmPlace of incomingOsmPlaces) {
    const isDuplicate = localPlaces.some((dbPlace) => areDuplicates(dbPlace, osmPlace));
    if (!isDuplicate) {
      uniqueIncoming.push(osmPlace);
    }
  }

  // 4. Background Write-Through Cache: Upsert newly discovered places into Prisma
  if (uniqueIncoming.length > 0) {
    (async () => {
      for (const place of uniqueIncoming) {
        try {
          await prisma.cafe.upsert({
            where: { slug: place.slug },
            update: {
              address: place.address,
              phone: place.phone,
              website: place.website,
            },
            create: {
              name: place.name,
              slug: place.slug,
              lat: place.lat,
              lng: place.lng,
              address: place.address,
              city: place.city,
              neighborhood: place.neighborhood,
              source: 'OSM',
              osmId: place.osmId ?? undefined,
              coverImage: place.coverImage,
              images: place.images,
              hasWifi: place.hasWifi,
              wifiSpeedMbps: place.wifiSpeedMbps,
              wifiUploadMbps: place.wifiUploadMbps,
              wifiReliability: place.wifiReliability,
              powerPlugDensity: place.powerPlugDensity,
              noiseLevel: place.noiseLevel,
              seatingComfort: place.seatingComfort,
              isVerified: false,
              status: 'COMMUNITY_ADDED',
              openingHours: place.openingHours,
            },
          });
        } catch {
          // Ignore duplicate constraint races in background writes
        }
      }
    })().catch((err) => console.error('[Aggregator Write-Through Cache Error]:', err));
  }

  // Combine and sort total results by nearest distance
  const combined = [...localPlaces, ...uniqueIncoming].sort(
    (a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)
  );

  return {
    places: combined,
    executedRadiusKm,
    fromCache: localPlaces.length > 0 && uniqueIncoming.length === 0,
  };
}
