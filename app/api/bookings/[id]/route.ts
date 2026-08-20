import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/services/booking.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/api-auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const bookingService = new BookingService(supabase)

    const booking = await bookingService.getBookingById(id)
    if (!booking) return errorResponse('Booking not found', 'NOT_FOUND', 404)

    // Authorization: only the customer, owner, or admin can view
    const isCustomer = booking.customer_id === user.id
    const isOwner = booking.owner_id === user.id
    const isAdmin = profile.role === 'admin'

    if (!isCustomer && !isOwner && !isAdmin) {
      return errorResponse('Forbidden', 'FORBIDDEN', 403)
    }

    return successResponse(booking)
  } catch (error) {
    return handleApiError(error)
  }
}
