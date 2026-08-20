import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/services/booking.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
