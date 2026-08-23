import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const {
      authorName,
      authorAvatar,
      overallRating,
      wifiRating,
      noiseRating,
      outletRating,
      comfortRating,
      coffeeRating,
      reportedWifiSpeed,
      comment,
      bestForTags,
      visitTiming,
    } = body;

    if (!authorName || !comment || !overallRating) {
      return NextResponse.json(
        { success: false, error: 'Name, review text, and overall rating are required.' },
        { status: 400 }
      );
    }

    const cafe = await prisma.cafe.findUnique({ where: { slug } });
    if (!cafe) {
      return NextResponse.json(
        { success: false, error: 'Cafe not found' },
        { status: 404 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        cafeId: cafe.id,
        authorName,
        authorAvatar:
          authorAvatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`,
        overallRating: Math.min(5, Math.max(1, parseInt(overallRating))),
        wifiRating: Math.min(5, Math.max(1, parseInt(wifiRating || overallRating))),
        noiseRating: Math.min(5, Math.max(1, parseInt(noiseRating || overallRating))),
        outletRating: Math.min(5, Math.max(1, parseInt(outletRating || overallRating))),
        comfortRating: Math.min(5, Math.max(1, parseInt(comfortRating || overallRating))),
        coffeeRating: Math.min(5, Math.max(1, parseInt(coffeeRating || overallRating))),
        reportedWifiSpeed: reportedWifiSpeed ? parseFloat(reportedWifiSpeed) : null,
        comment,
        bestForTags:
          typeof bestForTags === 'string'
            ? bestForTags
            : JSON.stringify(bestForTags || []),
        visitTiming: visitTiming || 'Afternoon',
      },
    });

    // Update cafe average rating and count
    const allReviews = await prisma.review.findMany({
      where: { cafeId: cafe.id },
      select: { overallRating: true },
    });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length;

    await prisma.cafe.update({
      where: { id: cafe.id },
      data: {
        averageRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
