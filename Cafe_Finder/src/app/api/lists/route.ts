import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const lists = await prisma.curatedList.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            cafe: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, lists });
  } catch (error: any) {
    console.error('Error fetching lists:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch curated lists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, coverImage, tags, authorName, cafeIds } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required.' },
        { status: 400 }
      );
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${randomSuffix}`;

    const newList = await prisma.curatedList.create({
      data: {
        title,
        slug,
        description,
        coverImage:
          coverImage ||
          'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
        isPublic: true,
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        authorName: authorName || 'Nomad Explorer',
      },
    });

    // Add initial cafes if provided
    if (cafeIds && Array.isArray(cafeIds) && cafeIds.length > 0) {
      for (let i = 0; i < cafeIds.length; i++) {
        await prisma.curatedListItem.create({
          data: {
            listId: newList.id,
            cafeId: cafeIds[i],
            order: i,
          },
        });
      }
    }

    const completeList = await prisma.curatedList.findUnique({
      where: { id: newList.id },
      include: {
        items: {
          include: { cafe: true },
        },
      },
    });

    return NextResponse.json({ success: true, list: completeList }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating curated list:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create curated list' },
      { status: 500 }
    );
  }
}
