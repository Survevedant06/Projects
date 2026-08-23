import { NextRequest, NextResponse } from 'next/server';
import { fetchCafesInViewport } from '@/lib/overpass';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const south = parseFloat(searchParams.get('south') || '');
  const west = parseFloat(searchParams.get('west') || '');
  const north = parseFloat(searchParams.get('north') || '');
  const east = parseFloat(searchParams.get('east') || '');
  const clat = parseFloat(searchParams.get('clat') || '');
  const clng = parseFloat(searchParams.get('clng') || '');

  if ([south, west, north, east, clat, clng].some(isNaN)) {
    return NextResponse.json({ success: false, error: 'Missing bbox params' }, { status: 400 });
  }

  // Prevent runaway queries: cap bbox area
  const latSpan = north - south;
  const lngSpan = east - west;
  if (latSpan > 5 || lngSpan > 5) {
    return NextResponse.json({ success: true, cafes: [], note: 'Zoom in to load cafes' });
  }

  try {
    const cafes = await fetchCafesInViewport(south, west, north, east, clat, clng);
    return NextResponse.json({ success: true, cafes });
  } catch (err) {
    console.error('[viewport]', err);
    return NextResponse.json({ success: false, cafes: [], error: 'Overpass timeout' });
  }
}
