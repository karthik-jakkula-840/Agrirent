'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getCurrentUser, requireRole } from '@/lib/supabase/auth'
import { BookingService } from '@/services/booking.service'
import { EquipmentService } from '@/services/equipment.service'
import { bookingSchema } from '@/lib/validations/booking'
import { revalidatePath } from 'next/cache'
export async function createBookingAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Please login to book equipment' }

    // Parse form data
    const rawData = {
      equipment_id: formData.get('equipment_id') as string,
      start_date: formData.get('start_date') as string,
      start_time: formData.get('start_time') as string,
      end_date: formData.get('end_date') as string,
      end_time: formData.get('end_time') as string,
      notes: formData.get('notes') as string || undefined,
    }

    const validatedData = bookingSchema.parse(rawData)

    const startDateTime = new Date(`${validatedData.start_date}T${validatedData.start_time}`).toISOString()
    const endDateTime = new Date(`${validatedData.end_date}T${validatedData.end_time}`).toISOString()

    const supabase = await createClient()
    const equipmentService = new EquipmentService(supabase)
    const bookingService = new BookingService(supabase)

    // Verify equipment exists and get pricing details
    const equipment = await equipmentService.getEquipmentById(validatedData.equipment_id) as any
    if (!equipment) return { success: false, error: 'Equipment not found' }
    if (equipment.owner_id === user.id) return { success: false, error: 'You cannot book your own equipment' }

    // Server-side price calculation
    const pricingData = bookingService.calculateBookingPrice(
      equipment,
      new Date(startDateTime),
      new Date(endDateTime)
    )

    // Create the booking using the atomic RPC function
    const newBookingId = await bookingService.createAtomicBooking(
      equipment.id,
      user.id,
      equipment.owner_id,
      startDateTime,
      endDateTime,
      pricingData,
      pricingData.totalAmount
    )

    // If we have notes, we should update the booking since our RPC might not have included it (it takes basic fields)
    if (validatedData.notes) {
      // @ts-ignore
      await supabase.from('bookings').update({ notes: validatedData.notes }).eq('id', newBookingId)
    }

    // Create notifications
    await bookingService.createNotification(
      user.id,
      'Booking Request Submitted',
      `Your booking request for ${equipment.title} has been submitted and is pending owner approval.`,
      'booking_created',
      newBookingId
    )

    await bookingService.createNotification(
      equipment.owner_id,
      'New Booking Request',
      `You have a new booking request for ${equipment.title}.`,
      'new_booking',
      newBookingId
    )

    revalidatePath('/dashboard/user/bookings')
    revalidatePath(`/dashboard/owner/bookings`)

    return { success: true, bookingId: newBookingId }

  } catch (error: any) {
    console.error('Failed to create booking:', error)
    if (error.name === 'ZodError') {
      return { success: false, error: error.errors[0].message }
    }
    // Handle specific Postgres RPC errors
    if (error.message?.includes('EQUIPMENT_UNAVAILABLE')) {
      return { success: false, error: 'The equipment is not available for the selected dates.' }
    }
    return { success: false, error: 'Failed to create booking request. Please try again.' }
  }
}

export async function acceptBookingAction(bookingId: string) {
  try {
    await requireRole('owner')
    const user = await getCurrentUser()
    const supabase = await createClient()
    const bookingService = new BookingService(supabase)

    const booking = await bookingService.getBookingById(bookingId)
    if (booking.owner_id !== user!.id) return { success: false, error: 'Forbidden' }
    if (booking.booking_status !== 'pending') return { success: false, error: 'Booking cannot be accepted' }

    await bookingService.updateBookingStatus(bookingId, 'accepted')

    await bookingService.createNotification(
      booking.customer_id,
      'Booking Accepted',
      `Your booking request for ${booking.equipment.title} has been accepted! Please proceed to payment.`,
      'booking_accepted',
      bookingId
    )

    revalidatePath(`/dashboard/owner/bookings/${bookingId}`)
    revalidatePath('/dashboard/owner/bookings')

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to accept booking' }
  }
}

export async function rejectBookingAction(bookingId: string) {
  try {
    await requireRole('owner')
    const user = await getCurrentUser()
    const supabase = await createClient()
    const bookingService = new BookingService(supabase)

    const booking = await bookingService.getBookingById(bookingId)
    if (booking.owner_id !== user!.id) return { success: false, error: 'Forbidden' }
    if (booking.booking_status !== 'pending') return { success: false, error: 'Booking cannot be rejected' }

    await bookingService.updateBookingStatus(bookingId, 'rejected')

    await bookingService.createNotification(
      booking.customer_id,
      'Booking Rejected',
      `Unfortunately, your booking request for ${booking.equipment.title} has been rejected by the owner.`,
      'booking_rejected',
      bookingId
    )

    revalidatePath(`/dashboard/owner/bookings/${bookingId}`)
    revalidatePath('/dashboard/owner/bookings')

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to reject booking' }
  }
}

export async function cancelBookingAction(bookingId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }
    
    const supabase = await createClient()
    const bookingService = new BookingService(supabase)

    const booking = await bookingService.getBookingById(bookingId)
    if (booking.customer_id !== user.id) return { success: false, error: 'Forbidden' }
    if (!['pending', 'accepted'].includes(booking.booking_status)) {
      return { success: false, error: 'This booking cannot be cancelled' }
    }

    await bookingService.updateBookingStatus(bookingId, 'cancelled')

    await bookingService.createNotification(
      booking.owner_id,
      'Booking Cancelled',
      `The customer has cancelled their booking for ${booking.equipment.title}.`,
      'booking_cancelled',
      bookingId
    )

    revalidatePath(`/dashboard/user/bookings/${bookingId}`)
    revalidatePath('/dashboard/user/bookings')

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to cancel booking' }
  }
}

export async function confirmPaymentAction(bookingId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }
    
    const supabase = await createClient()
    const bookingService = new BookingService(supabase)

    const booking = await bookingService.getBookingById(bookingId)
    if (booking.customer_id !== user.id) return { success: false, error: 'Forbidden' }
    if (booking.booking_status !== 'accepted' || booking.payment_status !== 'pending') {
      return { success: false, error: 'Payment cannot be processed for this booking' }
    }

    // 1. Update booking status
    // @ts-ignore
    const { error: updateError } = await supabase.from('bookings').update({ 
      payment_status: 'paid',
      booking_status: 'confirmed' 
    }).eq('id', bookingId)

    if (updateError) throw updateError

    // 2. Insert transaction record for the user dashboard
    const adminSupabase = createAdminClient()
    const { error: txError } = await adminSupabase.from('transactions').insert({
      user_id: user.id,
      booking_id: bookingId,
      amount: booking.total_amount,
      transaction_type: 'payment',
      reference_id: `TXN-${Date.now()}`
    } as any)

    if (txError) throw txError

    // 3. Notify owner
    await bookingService.createNotification(
      booking.owner_id,
      'Payment Received',
      `The customer has completed the payment for ${booking.equipment.title}. The booking is now confirmed.`,
      'payment_received',
      bookingId
    )

    revalidatePath(`/dashboard/user/bookings/${bookingId}`)
    revalidatePath('/dashboard/user/bookings')
    revalidatePath('/dashboard/user/payments')
    revalidatePath(`/dashboard/owner/bookings/${bookingId}`)
    revalidatePath('/dashboard/owner/bookings')

    return { success: true }
  } catch (error) {
    console.error('Failed to confirm payment:', error)
    return { success: false, error: 'Failed to verify payment' }
  }
}
