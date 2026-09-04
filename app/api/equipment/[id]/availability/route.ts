import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/services/booking.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // If ID is not a valid UUID (e.g. mock equipment), return empty availability array
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (!isUuid) {
      return NextResponse.json({ success: true, data: [] })
    }

    const supabase = await createClient()
    const bookingService = new BookingService(supabase)
    
    const availability = await bookingService.getEquipmentAvailability(id)
    
    return NextResponse.json({ success: true, data: availability })
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}
