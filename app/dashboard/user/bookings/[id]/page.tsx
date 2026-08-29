import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/services/booking.service'
import { getCurrentUser } from '@/lib/supabase/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { BackButton } from '@/components/dashboard/back-button'
import { Receipt, CalendarClock, Shield, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { CancelBookingButton } from './cancel-button'
import { PayNowButton } from './pay-now-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CustomerBookingDetailsPage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()
  const supabase = await createClient()
  const bookingService = new BookingService(supabase)
  
  let booking: any
  try {
    booking = await bookingService.getBookingById(id)
  } catch (error) {
    notFound()
  }

  if (booking.customer_id !== user!.id) {
    redirect('/dashboard/user/bookings')
  }

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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <BackButton href="/dashboard/user/bookings" label="Back to My Bookings" className="mb-4" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Booking {booking.booking_number}</h1>
            <p className="text-gray-500 mt-1">Requested on {format(new Date(booking.created_at), 'PPP')}</p>
          </div>
          <Badge className={`px-3 py-1 text-sm border-transparent capitalize ${getStatusColor(booking.booking_status)}`}>
            {booking.booking_status}
          </Badge>
        </div>
      </div>

      {booking.booking_status === 'accepted' && booking.payment_status === 'pending' && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-blue-900 font-bold text-lg">Your booking was accepted!</h3>
            <p className="text-blue-700 mt-1">Please complete your payment to confirm the reservation.</p>
          </div>
          <PayNowButton 
            bookingId={booking.id} 
            amount={booking.total_amount} 
            ownerPhone={booking.equipment?.profiles?.phone}
            ownerName={booking.equipment?.profiles?.full_name}
          />
        </div>
      )}

      {booking.booking_status === 'rejected' && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl mb-8 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
          <div>
            <h3 className="text-red-900 font-bold">Booking Rejected</h3>
            <p className="text-red-700 mt-1">The owner has declined your request. Your account has not been charged.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Equipment Details */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gray-400" /> Equipment & Owner
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Equipment</p>
                <Link href={`/equipment/${booking.equipment_id}`} className="font-semibold text-primary hover:underline">
                  {booking.equipment?.title}
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Owner Name</p>
                  <p className="font-medium text-gray-900">{booking.equipment?.profiles?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner Contact</p>
                  <p className="font-medium text-gray-900">{booking.booking_status === 'confirmed' ? booking.equipment?.profiles?.phone : 'Revealed after confirmation'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-gray-400" /> Rental Period
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pick-up</p>
                <p className="font-bold text-gray-900">{format(new Date(booking.start_time), 'PPp')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Return</p>
                <p className="font-bold text-gray-900">{format(new Date(booking.end_time), 'PPp')}</p>
              </div>
            </div>
            {booking.notes && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Your Notes</p>
                <p className="text-gray-900 text-sm">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-400" /> Payment Summary
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Rental Amount</span>
                <span className="font-medium text-gray-900">₹{booking.pricing?.rentalAmount}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Security Deposit</span>
                <span className="font-medium text-gray-900">₹{booking.pricing?.securityDeposit}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-base font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-primary text-xl">₹{booking.total_amount}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Payment Status</p>
              <Badge variant="outline" className="capitalize bg-gray-50">{booking.payment_status}</Badge>
            </div>
          </div>

          {/* Actions */}
          {(booking.booking_status === 'pending' || booking.booking_status === 'accepted') && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Need to cancel?</h3>
              <p className="text-sm text-gray-500 mb-4">You can cancel this booking request without any charges.</p>
              <CancelBookingButton bookingId={booking.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
