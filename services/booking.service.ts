import { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/server'

export class BookingService {
  constructor(private supabase: SupabaseClient) {}

  async getEquipmentAvailability(equipmentId: string) {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('bookings')
      .select('start_time, end_time')
      .eq('equipment_id', equipmentId)
      .in('booking_status', ['pending', 'accepted', 'confirmed'])

    if (error) throw error
    return data || []
  }

  async getCustomerBookings(customerId: string) {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        equipment:equipment_id(title, daily_price, equipment_images(image_url, is_primary))
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getOwnerBookings(ownerId: string) {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        equipment:equipment_id(title, daily_price),
        customer:customer_id(full_name, email, phone)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getBookingById(bookingId: string) {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        equipment:equipment_id(*, equipment_images(*), profiles(*)),
        customer:customer_id(full_name, email, phone, address, district)
      `)
      .eq('id', bookingId)
      .single()

    if (error) throw error
    return data
  }

  // Uses the RPC function created in migration 003 to safely insert the booking atomically
  async createAtomicBooking(
    equipmentId: string,
    customerId: string,
    ownerId: string,
    startTime: string,
    endTime: string,
    pricing: any,
    totalAmount: number
  ) {
    const { data, error } = await this.supabase.rpc('create_booking_atomic', {
      p_equipment_id: equipmentId,
      p_customer_id: customerId,
      p_owner_id: ownerId,
      p_start_time: startTime,
      p_end_time: endTime,
      p_pricing: pricing,
      p_total_amount: totalAmount
    })

    if (error) throw error
    return data // Returns the new booking UUID
  }

  async updateBookingStatus(bookingId: string, status: string) {
    const { error } = await this.supabase
      .from('bookings')
      .update({ booking_status: status })
      .eq('id', bookingId)

    if (error) throw error

    // Attempt to send an SMS to the customer
    if (['accepted', 'confirmed', 'rejected', 'cancelled'].includes(status)) {
      try {
        const booking = await this.getBookingById(bookingId)
        if (booking && booking.customer && booking.customer.phone) {
          const { TwoFactorService } = await import('@/lib/2factor')
          const message = `Agrirent Update: Your booking for ${booking.equipment?.title || 'equipment'} has been ${status}.`
          await TwoFactorService.sendTransactionalSMS(booking.customer.phone, message)
        }
      } catch (err) {
        console.error('Failed to send status update SMS:', err)
      }
    }

    return true
  }

  calculateBookingPrice(equipment: any, start: Date, end: Date) {
    const diffMs = end.getTime() - start.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = Math.ceil(diffHours / 24)
    
    // In a real application, you'd apply weekly/monthly rates if defined
    // For simplicity, we use daily rate for days >= 1, or hourly if defined and duration < 24h
    let rentalAmount = 0
    let pricingType = 'daily'

    if (diffHours <= 24 && equipment.hourly_price) {
      rentalAmount = equipment.hourly_price * Math.ceil(diffHours)
      pricingType = 'hourly'
    } else {
      rentalAmount = equipment.daily_price * (diffDays > 0 ? diffDays : 1)
    }

    const securityDeposit = equipment.deposit || 0
    const totalAmount = rentalAmount + securityDeposit

    return {
      rentalAmount,
      securityDeposit,
      totalAmount,
      pricingType,
      durationHours: Math.ceil(diffHours),
      durationDays: diffDays > 0 ? diffDays : 1
    }
  }

  async createNotification(userId: string, title: string, message: string, type: string, referenceId?: string) {
    // Use the admin client (service role) to bypass RLS so notifications
    // can be created for any user (e.g. owner) from a customer request.
    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('notifications')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({
        user_id: userId,
        title,
        message,
        notification_type: type,
        reference_id: referenceId
      } as any)

    if (error) throw error
    return true
  }
}
