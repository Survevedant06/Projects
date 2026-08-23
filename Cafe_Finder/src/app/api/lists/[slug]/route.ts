import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const list = await prisma.curatedList.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            cafe: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { success: false, error: 'Curated list not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, list });
  } catch (error: any) {
    console.error('Error fetching curated list:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch curated list' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { cafeId, curatorNote } = body;

    const list = await prisma.curatedList.findUnique({ where: { slug } });
    if (!list) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      );
    }

    const currentCount = await prisma.curatedListItem.count({
      where: { listId: list.id },
    });

    const item = await prisma.curatedListItem.upsert({
      where: {
        listId_cafeId: {
          listId: list.id,
          cafeId,
        },
      },
      update: {
        curatorNote: curatorNote || undefined,
      },
      create: {
        listId: list.id,
        cafeId,
        curatorNote: curatorNote || null,
        order: currentCount,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Error adding cafe to list:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add item to list' },
      { status: 500 }
    );
  }
}
