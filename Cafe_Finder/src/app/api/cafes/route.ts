import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const city = searchParams.get('city') || '';
    const minWifi = parseFloat(searchParams.get('minWifi') || '0');
    const plugDensity = searchParams.getAll('plugDensity');
    const noiseLevel = searchParams.getAll('noiseLevel');
    const seatingComfort = searchParams.getAll('seatingComfort');
    const openLate = searchParams.get('openLate') === 'true';
    const specialtyCoffee = searchParams.get('specialtyCoffee') === 'true';
    const outdoorSeating = searchParams.get('outdoorSeating') === 'true';
    const petFriendly = searchParams.get('petFriendly') === 'true';
    const callBooths = searchParams.get('callBooths') === 'true';
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const sortBy = searchParams.get('sortBy') || 'highest_rated';

    // Build Prisma query filters
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
        { neighborhood: { contains: search } },
        { city: { contains: search } },
        { roasterName: { contains: search } },
      ];
    }

    if (city && city !== 'All') {
      where.city = { equals: city };
    }

    if (minWifi > 0) {
      where.wifiSpeedMbps = { gte: minWifi };
    }

    if (plugDensity.length > 0) {
      where.powerPlugDensity = { in: plugDensity };
    }

    if (noiseLevel.length > 0) {
      where.noiseLevel = { in: noiseLevel };
    }

    if (seatingComfort.length > 0) {
      where.seatingComfort = { in: seatingComfort };
    }

    if (openLate) {
      where.openLate = true;
    }

    if (specialtyCoffee) {
      where.specialtyCoffee = true;
    }

    if (outdoorSeating) {
      where.hasOutdoorSeating = true;
    }

    if (petFriendly) {
      where.isPetFriendly = true;
    }

    if (callBooths) {
      where.hasCallBooths = true;
    }

    if (verifiedOnly) {
      where.isVerified = true;
    }

    // Determine sorting
    let orderBy: any = { averageRating: 'desc' };
    if (sortBy === 'fastest_wifi') {
      orderBy = { wifiSpeedMbps: 'desc' };
    } else if (sortBy === 'most_reviews') {
      orderBy = { reviewCount: 'desc' };
    } else if (sortBy === 'name') {
      orderBy = { name: 'asc' };
    }

    const cafes = await prisma.cafe.findMany({
      where,
      orderBy,
      include: {
        reviews: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
        speedTests: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, count: cafes.length, cafes });
  } catch (error: any) {
    console.error('Error fetching cafes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cafes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      tagline,
      description,
      address,
      city,
      neighborhood,
      lat,
      lng,
      phone,
      website,
      coverImage,
      images,
      priceLevel,
      hasWifi,
      wifiSpeedMbps,
      wifiUploadMbps,
      wifiReliability,
      wifiPasswordNote,
      powerPlugDensity,
      noiseLevel,
      seatingCapacity,
      seatingComfort,
      lighting,
      hasOutdoorSeating,
      isPetFriendly,
      hasCallBooths,
      hasMeetingRooms,
      hasParking,
      hasAirConditioning,
      hasRestrooms,
      openLate,
      specialtyCoffee,
      roasterName,
      foodOptions,
      veganOptions,
      openingHours,
      submitterName,
    } = body;

    if (!name || !address || !city) {
      return NextResponse.json(
        { success: false, error: 'Name, address, and city are required.' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${city.toLowerCase().replace(/[^a-z0-9]/g, '')}-${randomSuffix}`;

    // Ensure default images
    const defaultCover =
      coverImage ||
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80';
    const imagesArray = images && Array.isArray(images) && images.length > 0 ? images : [defaultCover];

    // Create user or link if submitterName provided
    let user = null;
    if (submitterName) {
      user = await prisma.user.findFirst({ where: { name: submitterName } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: submitterName,
            role: 'NOMAD',
            reputation: 15,
          },
        });
      }
    }

    const newCafe = await prisma.cafe.create({
      data: {
        name,
        slug,
        tagline: tagline || null,
        description: description || `Community-contributed workspace in ${city}.`,
        address,
        city,
        neighborhood: neighborhood || null,
        lat: lat ? parseFloat(lat) : 37.7749 + (Math.random() - 0.5) * 0.05,
        lng: lng ? parseFloat(lng) : -122.4194 + (Math.random() - 0.5) * 0.05,
        phone: phone || null,
        website: website || null,
        coverImage: defaultCover,
        images: JSON.stringify(imagesArray),
        priceLevel: priceLevel ? parseInt(priceLevel) : 2,
        hasWifi: hasWifi ?? true,
        wifiSpeedMbps: wifiSpeedMbps ? parseFloat(wifiSpeedMbps) : 50.0,
        wifiUploadMbps: wifiUploadMbps ? parseFloat(wifiUploadMbps) : 25.0,
        wifiReliability: wifiReliability || 'STABLE',
        wifiPasswordNote: wifiPasswordNote || null,
        powerPlugDensity: powerPlugDensity || 'MODERATE',
        noiseLevel: noiseLevel || 'QUIET',
        seatingCapacity: seatingCapacity || 'MEDIUM',
        seatingComfort: seatingComfort || 'MIXED',
        lighting: lighting || 'NATURAL_LIGHT',
        hasOutdoorSeating: hasOutdoorSeating ?? false,
        isPetFriendly: isPetFriendly ?? true,
        hasCallBooths: hasCallBooths ?? false,
        hasMeetingRooms: hasMeetingRooms ?? false,
        hasParking: hasParking ?? false,
        hasAirConditioning: hasAirConditioning ?? true,
        hasRestrooms: hasRestrooms ?? true,
        openLate: openLate ?? false,
        specialtyCoffee: specialtyCoffee ?? true,
        roasterName: roasterName || null,
        foodOptions: foodOptions || 'LIGHT_BITES',
        veganOptions: veganOptions ?? true,
        status: 'COMMUNITY_SUBMITTED',
        isVerified: false,
        openingHours:
          typeof openingHours === 'string'
            ? openingHours
            : JSON.stringify(openingHours || { weekday: '8:00 AM - 8:00 PM', weekend: '9:00 AM - 6:00 PM' }),
        averageRating: 5.0,
        reviewCount: 0,
        submitterId: user ? user.id : null,
      },
    });

    return NextResponse.json({ success: true, cafe: newCafe }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting cafe:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit cafe' },
      { status: 500 }
    );
  }
}
