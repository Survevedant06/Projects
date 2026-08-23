import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { geocodePlace } from '@/lib/maps'

// PUT /api/activities/[id] - Update an activity
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      name,
      description,
      timeSlot,
      category,
      locationName,
      estimatedCost,
      durationMinutes,
      userNotes,
      destination,
    } = body

    let updateData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(timeSlot !== undefined && { timeSlot }),
      ...(category !== undefined && { category }),
      ...(locationName !== undefined && { locationName }),
      ...(estimatedCost !== undefined && { estimatedCost: Number(estimatedCost) }),
      ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
      ...(userNotes !== undefined && { userNotes }),
    }

    if (locationName) {
      const geo = await geocodePlace(locationName, destination || '')
      if (geo.lat && geo.lng) {
        updateData.latitude = geo.lat
        updateData.longitude = geo.lng
      }
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
  }
}

// DELETE /api/activities/[id] - Delete an activity
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.activity.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Activity deleted' })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
  }
}
