import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/services/booking.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/api-auth'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const bookingService = new BookingService(supabase)

    const booking = await bookingService.getBookingById(id)
    if (!booking) return errorResponse('Booking not found', 'NOT_FOUND', 404)

    // Only owner of the equipment or admin can accept/reject
    const isOwner = booking.owner_id === user.id
    const isAdmin = profile.role === 'admin'

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden: Only the owner can manage this booking', 'FORBIDDEN', 403)
    }

    const body = await req.json()
    const { status } = statusSchema.parse(body)

    if (booking.booking_status !== 'pending') {
      return errorResponse(`Cannot change status of a ${booking.booking_status} booking`, 'BAD_REQUEST', 400)
    }

    await bookingService.updateBookingStatus(id, status)

    // Notify customer
    await bookingService.createNotification(
      booking.customer_id,
      `Booking ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
      `Your booking for ${booking.equipment?.title} has been ${status}.`,
      status === 'accepted' ? 'booking_accepted' : 'booking_rejected',
      id
    )

    return successResponse({ status })
  } catch (error) {
    return handleApiError(error)
  }
}
