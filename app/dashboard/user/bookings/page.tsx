import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/services/booking.service'
import { getCurrentUser } from '@/lib/supabase/auth'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export default async function CustomerBookingsPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()
  const bookingService = new BookingService(supabase)
  
  const bookings = await bookingService.getCustomerBookings(user!.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'rejected': 
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">Manage your rental requests and active bookings.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              You haven't requested any equipment yet. Explore the marketplace to find what you need.
            </p>
            <Link href="/equipment">
              <Button className="bg-primary hover:bg-primary/90 text-white">Browse Equipment</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking: any) => {
              const primaryImage = booking.equipment?.equipment_images?.find((i: any) => i.is_primary)?.image_url 
                                || booking.equipment?.equipment_images?.[0]?.image_url 
                                || 'https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=200'
              
              return (
                <div key={booking.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative h-24 w-32 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <Image src={primaryImage} alt={booking.equipment?.title || 'Equipment'} fill className="object-cover" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">{booking.equipment?.title}</h3>
                      <Badge variant="outline" className={`border-transparent capitalize ${getStatusColor(booking.booking_status)}`}>
                        {booking.booking_status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium text-gray-700">Booking No:</span> {booking.booking_number}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Period:</span> {format(new Date(booking.start_time), 'MMM dd, yy')} - {format(new Date(booking.end_time), 'MMM dd, yy')}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Total Amount:</span> ₹{booking.total_amount}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Payment:</span> <span className="capitalize">{booking.payment_status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center flex flex-col gap-2">
                    {booking.booking_status === 'completed' && (
                      <Link href={`/equipment/${booking.equipment_id}#reviews`}>
                        <Button variant="default" className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                          Leave Review
                        </Button>
                      </Link>
                    )}
                    <Link href={`/dashboard/user/bookings/${booking.id}`}>
                      <Button variant="outline" className="w-full gap-2">
                        View Details <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
