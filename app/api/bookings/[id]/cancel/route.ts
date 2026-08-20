import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/services/booking.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/api-auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const bookingService = new BookingService(supabase)

    const booking = await bookingService.getBookingById(id)
    if (!booking) return errorResponse('Booking not found', 'NOT_FOUND', 404)

    const isCustomer = booking.customer_id === user.id
    const isAdmin = profile.role === 'admin'

    if (!isCustomer && !isAdmin) {
      return errorResponse('Forbidden: Only the customer or admin can cancel this booking', 'FORBIDDEN', 403)
    }

    if (booking.booking_status === 'completed' || booking.booking_status === 'cancelled') {
      return errorResponse(`Booking is already ${booking.booking_status}`, 'BAD_REQUEST', 400)
    }

    await bookingService.updateBookingStatus(id, 'cancelled')

    // Optional: Notify owner
    if (isCustomer) {
      await bookingService.createNotification(
        booking.owner_id,
        'Booking Cancelled',
        `A booking for ${booking.equipment?.title} was cancelled by the customer.`,
        'booking_cancelled',
        id
      )
    }

    return successResponse({ status: 'cancelled' })
  } catch (error) {
    return handleApiError(error)
  }
}
