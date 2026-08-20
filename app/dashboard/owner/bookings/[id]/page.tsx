import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { BookingService } from '@/services/booking.service'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, User, Calendar, CreditCard, Clock, Tractor, CheckCircle2, XCircle } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import { acceptBookingAction, rejectBookingAction } from '@/app/actions/booking'

export const metadata = {
  title: 'Booking Details | Owner Portal | Agriform',
}

export default async function OwnerBookingDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const bookingService = new BookingService(supabase)
  
  try {
    const booking = await bookingService.getBookingById(params.id)
    
    if (booking.owner_id !== user.id) {
      redirect('/dashboard/owner/bookings')
    }

    const isPending = booking.booking_status === 'pending'
    const equipmentImage = booking.equipment?.equipment_images?.[0]?.image_url

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/owner/bookings">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Booking Details</h1>
            <p className="text-gray-500 mt-1 font-mono text-sm">ID: {booking.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {/* Customer Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Customer Details
              </h2>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium text-gray-900">{booking.customer?.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Phone Number</p>
                  <p className="font-medium text-gray-900">{booking.customer?.phone || 'Not provided'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 mb-1">Email Address</p>
                  <p className="font-medium text-gray-900">{booking.customer?.email}</p>
                </div>
                {booking.customer?.address && (
                  <div className="col-span-2">
                    <p className="text-gray-500 mb-1">Address</p>
                    <p className="font-medium text-gray-900 flex items-start gap-1">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      {booking.customer.address}, {booking.customer.district}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Equipment Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tractor className="h-5 w-5 text-primary" /> Equipment
              </h2>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="h-32 w-full sm:w-48 bg-gray-100 rounded-xl relative overflow-hidden shrink-0">
                  {equipmentImage ? (
                    <Image src={equipmentImage} alt={booking.equipment.title} fill className="object-cover" />
                  ) : (
                    <Tractor className="h-8 w-8 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{booking.equipment.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{booking.equipment.location}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Daily Rate</p>
                      <p className="font-medium text-gray-900">₹{booking.equipment.daily_price}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Deposit</p>
                      <p className="font-medium text-gray-900">₹{booking.equipment.deposit || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Customer Notes</h2>
                <p className="text-gray-600 text-sm whitespace-pre-line bg-gray-50 p-4 rounded-xl">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Booking Status</p>
                <StatusBadge status={booking.booking_status} />
              </div>

              {isPending && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 text-center">Action required</p>
                  <form action={async () => {
                    'use server'
                    await acceptBookingAction(booking.id)
                  }}>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Accept Request
                    </Button>
                  </form>
                  
                  <form action={async () => {
                    'use server'
                    await rejectBookingAction(booking.id)
                  }}>
                    <Button type="submit" variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                      <XCircle className="mr-2 h-4 w-4" /> Reject Request
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Rental Period */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Rental Period
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Start</span>
                  <span className="font-medium text-gray-900 text-right">
                    {format(new Date(booking.start_time), 'MMM d, yyyy')} <br/>
                    <span className="text-xs text-gray-500 font-normal">{format(new Date(booking.start_time), 'h:mm a')}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">End</span>
                  <span className="font-medium text-gray-900 text-right">
                    {format(new Date(booking.end_time), 'MMM d, yyyy')} <br/>
                    <span className="text-xs text-gray-500 font-normal">{format(new Date(booking.end_time), 'h:mm a')}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Payment Summary
              </h2>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rental Fee</span>
                  <span className="font-medium text-gray-900">₹{booking.pricing_details?.rentalAmount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Security Deposit</span>
                  <span className="font-medium text-gray-900">₹{booking.pricing_details?.securityDeposit || 0}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="font-bold text-lg text-primary">₹{booking.total_amount}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    accepted: 'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="mr-1.5 h-4 w-4" />,
    accepted: <CheckCircle2 className="mr-1.5 h-4 w-4" />,
    confirmed: <CheckCircle2 className="mr-1.5 h-4 w-4" />,
    completed: <CheckCircle2 className="mr-1.5 h-4 w-4" />,
    rejected: <XCircle className="mr-1.5 h-4 w-4" />,
    cancelled: <XCircle className="mr-1.5 h-4 w-4" />,
  }

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold capitalize border ${styles[status] || styles.pending}`}>
      {icons[status]}
      {status}
    </div>
  )
}
