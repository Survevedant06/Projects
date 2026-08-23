import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyPlaces } from '@/lib/providers/aggregator';
import { CafeItem, OsmCafe } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const radiusKm = parseFloat(searchParams.get('radius') || '5');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ success: false, error: 'lat and lng are required' }, { status: 400 });
  }

  try {
    const result = await searchNearbyPlaces(lat, lng, radiusKm);

    const dbCafes = result.places
      .filter((p) => p.source === 'VERIFIED' || p.source === 'USER_SUBMITTED' || p.isVerified)
      .map((p) => p as unknown as CafeItem);

    const osmCafes = result.places
      .filter((p) => p.source === 'OSM' && !p.isVerified)
      .map((p) => p as unknown as OsmCafe);

    return NextResponse.json({
      success: true,
      userLocation: { lat, lng },
      radiusKm: result.executedRadiusKm,
      dbCafes,
      osmCafes,
      totalCount: result.places.length,
      fromCache: result.fromCache,
    });
  } catch (err) {
    console.error('[/api/cafes/nearby]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
