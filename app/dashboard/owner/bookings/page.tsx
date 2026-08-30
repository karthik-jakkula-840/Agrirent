import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { BookingService } from '@/services/booking.service'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarClock, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react'

export const metadata = {
  title: 'Bookings | Owner Portal | Agriform',
}

export default async function OwnerBookingsPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()
  const bookingService = new BookingService(supabase)
  
  const bookings = await bookingService.getOwnerBookings(user!.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Equipment Bookings</h1>
        <p className="text-gray-500 mt-1">Manage rental requests and active bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarClock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            When customers request to rent your equipment, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Mobile View */}
          <div className="divide-y divide-gray-100 md:hidden">
            {bookings.map((booking: any) => (
              <div key={booking.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{booking.equipment?.title || 'Equipment'}</h4>
                    <p className="text-xs text-gray-500">Customer: {booking.customer?.full_name || 'Anonymous'}</p>
                  </div>
                  <StatusBadge status={booking.booking_status} />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>
                      {format(new Date(booking.start_time), 'MMM d')} - {format(new Date(booking.end_time), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="font-bold text-gray-900 text-sm">
                    ₹{booking.total_amount}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-gray-400">
                    ID: {booking.id.split('-')[0]}...
                  </span>
                  <Link href={`/dashboard/owner/bookings/${booking.id}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs font-semibold text-primary border-primary/20 hover:bg-primary/10">
                      View Details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Equipment</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {booking.id.split('-')[0]}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {booking.equipment?.title}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {booking.customer?.full_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {format(new Date(booking.start_time), 'MMM d')} - {format(new Date(booking.end_time), 'MMM d, yy')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.booking_status} />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹{booking.total_amount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/owner/bookings/${booking.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                          View <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    accepted: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
  }

  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="mr-1.5 h-3.5 w-3.5" />,
    accepted: <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />,
    confirmed: <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />,
    completed: <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />,
    rejected: <XCircle className="mr-1.5 h-3.5 w-3.5" />,
    cancelled: <XCircle className="mr-1.5 h-3.5 w-3.5" />,
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.pending}`}>
      {icons[status]}
      {status}
    </span>
  )
}
