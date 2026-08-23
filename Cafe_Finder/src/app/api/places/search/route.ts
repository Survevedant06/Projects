import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyPlaces } from '@/lib/providers/aggregator';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const radius = parseFloat(searchParams.get('radius') || '3');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { success: false, error: 'Valid lat and lng query parameters are required' },
      { status: 400 }
    );
  }

  try {
    const result = await searchNearbyPlaces(lat, lng, radius);
    return NextResponse.json({
      success: true,
      places: result.places,
      count: result.places.length,
      executedRadiusKm: result.executedRadiusKm,
      fromCache: result.fromCache,
    });
  } catch (error) {
    console.error('[/api/places/search] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to aggregate places' },
      { status: 500 }
    );
  }
}
