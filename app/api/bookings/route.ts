import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/services/booking.service'
import { EquipmentService } from '@/services/equipment.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/api-auth'
import { bookingSchema } from '@/lib/validations/booking'

export async function GET(req: NextRequest) {
  try {
    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const bookingService = new BookingService(supabase)

    let data
    if (profile.role === 'customer') {
      data = await bookingService.getCustomerBookings(user.id)
    } else if (profile.role === 'owner' || profile.role === 'rental_owner') {
      data = await bookingService.getOwnerBookings(user.id)
    } else if (profile.role === 'admin') {
      // Admin sees all bookings
      const { data: adminData, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
      if (error) throw error
      data = adminData
    }

    return successResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    if (profile.role !== 'customer') {
      return errorResponse('Only customers can create bookings', 'FORBIDDEN', 403)
    }

    const body = await req.json()
    const validatedData = bookingSchema.parse(body)

    const supabase = await createClient()
    const bookingService = new BookingService(supabase)
    const equipmentService = new EquipmentService(supabase)

    // Verify equipment
    const equipment = await equipmentService.getEquipmentById(validatedData.equipment_id)
    if (!equipment) return errorResponse('Equipment not found', 'NOT_FOUND', 404)
    if (equipment.availability !== 'available') {
      return errorResponse('Equipment is not available', 'UNAVAILABLE', 400)
    }

    // Verify dates availability
    const existingBookings = await bookingService.getEquipmentAvailability(equipment.id)
    const newStart = new Date(`${validatedData.start_date}T${validatedData.start_time}`)
    const newEnd = new Date(`${validatedData.end_date}T${validatedData.end_time}`)

    const isConflict = existingBookings.some((b: any) => {
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      return newStart < bEnd && newEnd > bStart
    })

    if (isConflict) {
      return errorResponse('Equipment is already booked for these dates', 'CONFLICT', 409)
    }

    // Calculate price securely on server
    const pricing = bookingService.calculateBookingPrice(equipment, newStart, newEnd)

    // Create booking
    const bookingId = await bookingService.createAtomicBooking(
      equipment.id,
      user.id,
      equipment.owner_id,
      newStart.toISOString(),
      newEnd.toISOString(),
      pricing,
      pricing.totalAmount
    )

    // Optional: notifications can be created here
    await bookingService.createNotification(
      equipment.owner_id,
      'New Booking Request',
      `You have a new booking request for ${equipment.title}`,
      'booking_request',
      bookingId
    )

    return successResponse({ id: bookingId }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
