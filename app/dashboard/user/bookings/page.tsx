import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/services/booking.service'
import { getCurrentUser } from '@/lib/supabase/auth'
import { CustomerBookingsClient } from './bookings-client'

export const metadata = {
  title: 'My Bookings | Customer Dashboard | AgriRent',
  description: 'Manage and track your agricultural equipment rental bookings',
}

export default async function CustomerBookingsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  const bookingService = new BookingService(supabase)
  
  const bookings = await bookingService.getCustomerBookings(user.id)

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          My Bookings
        </h1>
        <p className="text-gray-500 mt-1 text-xs sm:text-sm font-medium">
          Manage your rental requests, active reservations, and payment confirmations.
        </p>
      </div>

      <CustomerBookingsClient initialBookings={bookings} />
    </div>
  )
}
