import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const cafe = await prisma.cafe.findUnique({
      where: { slug },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
        speedTests: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        curatedListItems: {
          include: {
            list: true,
          },
        },
      },
    });

    if (!cafe) {
      return NextResponse.json(
        { success: false, error: 'Cafe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, cafe });
  } catch (error: any) {
    console.error('Error fetching cafe detail:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cafe detail' },
      { status: 500 }
    );
  }
}
