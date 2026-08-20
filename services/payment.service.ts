import { SupabaseClient } from '@supabase/supabase-js'

export interface PaymentIntentOptions {
  bookingId: string
  amount: number
  currency: string
  customerId: string
}

export abstract class PaymentProvider {
  constructor(protected supabase: SupabaseClient) {}

  abstract createPaymentIntent(options: PaymentIntentOptions): Promise<any>
  abstract verifyPayment(paymentId: string, signature?: string): Promise<boolean>
}

// Example Mock implementation for now, can be replaced by Stripe/Razorpay
export class MockPaymentProvider extends PaymentProvider {
  async createPaymentIntent(options: PaymentIntentOptions) {
    // In real implementation, this would call Stripe/Razorpay API
    return {
      clientSecret: 'mock_secret_123',
      providerPaymentId: `mock_pi_${Date.now()}`,
    }
  }

  async verifyPayment(paymentId: string) {
    return true
  }
}

export class PaymentService {
  private provider: PaymentProvider

  constructor(private supabase: SupabaseClient, provider: PaymentProvider) {
    this.provider = provider
  }

  async createPaymentIntent(options: PaymentIntentOptions) {
    // Ensure booking belongs to customer
    const { data: booking, error: bookingError } = await this.supabase
      .from('bookings')
      .select('customer_id, total_amount')
      .eq('id', options.bookingId)
      .single()

    if (bookingError || !booking) throw new Error('Booking not found')
    if (booking.customer_id !== options.customerId) throw new Error('Unauthorized for this booking')
    
    // Server-side amount validation (never trust client amount)
    if (booking.total_amount !== options.amount) throw new Error('Amount mismatch')

    // Call Provider
    const intent = await this.provider.createPaymentIntent(options)

    // Save initial payment record
    const { data: payment, error: paymentError } = await this.supabase
      .from('payments')
      .insert({
        booking_id: options.bookingId,
        customer_id: options.customerId,
        amount: options.amount,
        payment_method: 'online', // Or dynamic
        payment_status: 'pending',
        transaction_id: intent.providerPaymentId
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    return {
      ...intent,
      internalPaymentId: payment.id,
    }
  }
}
