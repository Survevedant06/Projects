import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      lat,
      lng,
      address,
      city,
      neighborhood,
      hasWifi,
      wifiSpeedMbps,
      powerPlugDensity,
      noiseLevel,
      seatingComfort,
      comment,
      authorName,
    } = body;

    if (!name || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: 'Name and valid GPS coordinates are required' },
        { status: 400 }
      );
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    const coverImage =
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80';

    const place = await prisma.cafe.create({
      data: {
        name,
        slug,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: address || 'Community Drop-in Location',
        city: city || 'Local Area',
        neighborhood: neighborhood || null,
        source: 'USER_SUBMITTED',
        status: 'COMMUNITY_ADDED',
        isVerified: false,
        coverImage,
        images: JSON.stringify([coverImage]),
        hasWifi: Boolean(hasWifi ?? true),
        wifiSpeedMbps: wifiSpeedMbps ? parseFloat(wifiSpeedMbps) : 50.0,
        wifiUploadMbps: wifiSpeedMbps ? parseFloat(wifiSpeedMbps) * 0.5 : 25.0,
        wifiReliability: 'STABLE',
        powerPlugDensity: powerPlugDensity || 'MODERATE',
        noiseLevel: noiseLevel || 'QUIET',
        seatingComfort: seatingComfort || 'MIXED',
        reviews: comment
          ? {
              create: {
                authorName: authorName || 'Community Member',
                overallRating: 5,
                wifiRating: 5,
                noiseRating: 4,
                outletRating: 4,
                comfortRating: 4,
                coffeeRating: 4,
                comment,
              },
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, place }, { status: 201 });
  } catch (err) {
    console.error('[/api/places/submit] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to record community place' },
      { status: 500 }
    );
  }
}
