import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/api-auth'
import { PaymentService, MockPaymentProvider } from '@/services/payment.service'
import { paymentIntentSchema } from '@/lib/validations/payment'

export async function POST(req: NextRequest) {
  try {
    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    if (profile.role !== 'customer') {
      return errorResponse('Only customers can initiate payments', 'FORBIDDEN', 403)
    }

    const body = await req.json()
    const validatedData = paymentIntentSchema.parse(body)

    const supabase = await createClient()
    const provider = new MockPaymentProvider(supabase) // Swap out with actual provider later
    const paymentService = new PaymentService(supabase, provider)

    const intent = await paymentService.createPaymentIntent({
      bookingId: validatedData.booking_id,
      amount: validatedData.amount,
      currency: validatedData.currency,
      customerId: user.id,
    })

    return successResponse(intent)
  } catch (error) {
    if (error instanceof Error && error.message === 'Amount mismatch') {
      return errorResponse('Payment amount does not match booking amount', 'BAD_REQUEST', 400)
    }
    return handleApiError(error)
  }
}
