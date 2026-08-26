import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Return bookmarks for user, or all bookmarks if demo
    const bookmarks = await prisma.bookmark.findMany({
      where: userId ? { userId } : undefined,
      include: {
        cafe: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const cafes = bookmarks
      .map((b) => b.cafe)
      .filter((cafe): cafe is NonNullable<typeof cafe> => cafe !== null);

    return NextResponse.json({ success: true, bookmarks: cafes });
  } catch (error: any) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cafeId, userId } = body;

    if (!cafeId) {
      return NextResponse.json(
        { success: false, error: 'cafeId is required' },
        { status: 400 }
      );
    }

    // Default to the first demo user if userId not provided
    let targetUserId = userId;
    if (!targetUserId) {
      const user = await prisma.user.findFirst();
      if (user) {
        targetUserId = user.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            name: 'Nomad Traveler',
            email: 'nomad@workspace.local',
          },
        });
        targetUserId = newUser.id;
      }
    }

    // Check if bookmark already exists
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_cafeId: {
          userId: targetUserId,
          cafeId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, bookmarked: false });
    } else {
      const bookmark = await prisma.bookmark.create({
        data: {
          userId: targetUserId,
          cafeId,
        },
      });
      return NextResponse.json({ success: true, bookmarked: true, bookmark });
    }
  } catch (error: any) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}
