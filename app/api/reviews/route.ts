import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireRole } from '@/lib/api-auth'
import { reviewSchema } from '@/lib/validations/review'

export async function POST(req: NextRequest) {
  try {
    const { user, profile, error: authError } = await requireRole(['customer'])
    if (authError) return authError

    const body = await req.json()
    const validatedData = reviewSchema.parse(body)

    const supabase = await createClient()

    // 1. Verify the customer has a completed booking for this equipment
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('customer_id', user.id)
      .eq('equipment_id', validatedData.equipment_id)
      .eq('booking_status', 'completed')
      .limit(1)

    if (bookingsError) throw bookingsError

    if (!bookings || bookings.length === 0) {
      return errorResponse('You can only review equipment you have successfully rented and completed.', 'FORBIDDEN', 403)
    }

    // 2. Insert the review
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          equipment_id: validatedData.equipment_id,
          booking_id: bookings[0].id,
          customer_id: user.id,
          rating: validatedData.rating,
          review: validatedData.comment,
        }
      ])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation (e.g., one review per equipment per user)
        return errorResponse('You have already reviewed this equipment.', 'CONFLICT', 409)
      }
      throw error
    }

    return successResponse(data, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
