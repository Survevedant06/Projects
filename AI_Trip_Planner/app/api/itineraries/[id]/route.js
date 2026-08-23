import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const trip = await prisma.trip.findFirst({
      where: {
        OR: [{ id: id }, { shareSlug: id }],
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        dayPlans: {
          include: {
            activities: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 })
    }

    return NextResponse.json(trip)
  } catch (error) {
    console.error('Error getting trip:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const body = await request.json()

    // Find trip
    const existingTrip = await prisma.trip.findUnique({
      where: { id },
      include: { dayPlans: { include: { activities: true } } },
    })

    if (!existingTrip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 })
    }

    // If claiming guest trip to authenticated user
    if (body.action === 'claim' && session?.user?.id) {
      const updated = await prisma.trip.update({
        where: { id },
        data: { userId: session.user.id },
      })
      return NextResponse.json(updated)
    }

    // If updating trip metadata (title, summary, isPublic, etc.)
    const { title, summary, isPublic, totalEstimatedCost } = body

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(summary !== undefined && { summary }),
        ...(isPublic !== undefined && { isPublic }),
        ...(totalEstimatedCost !== undefined && { totalEstimatedCost: Number(totalEstimatedCost) }),
      },
      include: {
        dayPlans: {
          include: {
            activities: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json({ error: 'Failed to update trip.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    const existingTrip = await prisma.trip.findUnique({
      where: { id },
    })

    if (!existingTrip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 })
    }

    // Check ownership if trip has a userId
    if (existingTrip.userId && existingTrip.userId !== session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this trip.' }, { status: 403 })
    }

    await prisma.trip.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Trip deleted successfully.' })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json({ error: 'Failed to delete trip.' }, { status: 500 })
  }
}
