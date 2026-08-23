import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { downloadMbps, uploadMbps, pingMs, deviceType } = body;

    if (!downloadMbps) {
      return NextResponse.json(
        { success: false, error: 'Download speed is required' },
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

    const speedLog = await prisma.speedTestLog.create({
      data: {
        cafeId: cafe.id,
        downloadMbps: parseFloat(downloadMbps),
        uploadMbps: parseFloat(uploadMbps || (parseFloat(downloadMbps) * 0.7).toFixed(1)),
        pingMs: parseFloat(pingMs || '18'),
        deviceType: deviceType || 'Web Browser',
      },
    });

    // Recalculate average speed from recent logs
    const recentLogs = await prisma.speedTestLog.findMany({
      where: { cafeId: cafe.id },
      select: { downloadMbps: true, uploadMbps: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    if (recentLogs.length > 0) {
      const avgDl =
        recentLogs.reduce((acc, log) => acc + log.downloadMbps, 0) /
        recentLogs.length;
      const avgUl =
        recentLogs.reduce((acc, log) => acc + log.uploadMbps, 0) /
        recentLogs.length;

      await prisma.cafe.update({
        where: { id: cafe.id },
        data: {
          wifiSpeedMbps: parseFloat(avgDl.toFixed(1)),
          wifiUploadMbps: parseFloat(avgUl.toFixed(1)),
        },
      });
    }

    return NextResponse.json({ success: true, speedLog }, { status: 201 });
  } catch (error: any) {
    console.error('Error logging speed test:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to log speed test' },
      { status: 500 }
    );
  }
}
