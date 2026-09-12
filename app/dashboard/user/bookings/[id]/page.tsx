import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/services/booking.service'
import { getCurrentUser } from '@/lib/supabase/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { BackButton } from '@/components/dashboard/back-button'
import { 
  Receipt, 
  CalendarClock, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MapPin, 
  Phone, 
  MessageCircle, 
  Lock, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  Tractor,
  ArrowRight,
  ShieldAlert,
  Calendar,
  CreditCard
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, differenceInHours, differenceInDays } from 'date-fns'
import { CancelBookingButton } from './cancel-button'
import { PayNowButton } from './pay-now-button'
import { CopyBookingId } from './copy-booking-id'
import { BookingStepper } from './booking-stepper'
import { EquipmentThumbnail } from './equipment-thumbnail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CustomerBookingDetailsPage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const bookingService = new BookingService(supabase)
  
  let booking: any
  try {
    booking = await bookingService.getBookingById(id)
  } catch (error) {
    notFound()
  }

  if (!booking || booking.customer_id !== user.id) {
    redirect('/dashboard/user/bookings')
  }

  const equipment = booking.equipment
  const owner = equipment?.profiles
  const ownerName = owner?.full_name || 'Equipment Owner'
  const ownerPhone = owner?.phone
  const isConfirmed = booking.booking_status === 'confirmed'
  const isPending = booking.booking_status === 'pending'
  const isAccepted = booking.booking_status === 'accepted'
  const isCompleted = booking.booking_status === 'completed'
  const isCancelled = booking.booking_status === 'cancelled' || booking.booking_status === 'rejected'

  // Calculate rental duration
  const startDate = new Date(booking.start_time)
  const endDate = new Date(booking.end_time)
  const totalHours = Math.max(1, differenceInHours(endDate, startDate))
  const totalDays = differenceInDays(endDate, startDate)
  const durationLabel = totalDays >= 1 
    ? `${totalDays} Day${totalDays > 1 ? 's' : ''}` 
    : `${totalHours} Hour${totalHours > 1 ? 's' : ''}`

  // Primary image
  const primaryImage = equipment?.equipment_images?.find((img: any) => img.is_primary)?.image_url 
    || equipment?.equipment_images?.[0]?.image_url

  // Pricing calculations
  const rentalAmount = booking.pricing?.rentalAmount ?? (booking.total_amount - (booking.pricing?.securityDeposit ?? 0))
  const securityDeposit = booking.pricing?.securityDeposit ?? 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/90 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Accepted - Payment Pending
          </span>
        )
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Confirmed & Active
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200/90 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-gray-500" />
            Completed
          </span>
        )
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/90 shadow-2xs">
            <XCircle className="h-3.5 w-3.5 text-red-600" />
            {status === 'rejected' ? 'Declined by Owner' : 'Cancelled'}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            Pending Approval
          </span>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12 sm:pb-8">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <BackButton href="/dashboard/user/bookings" label="Back to My Bookings" />
        <div className="flex items-center gap-2">
          <CopyBookingId bookingNumber={booking.booking_number} />
        </div>
      </div>

      {/* Main Booking Reference Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-150/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
                Booking #{booking.booking_number}
              </h1>
              {getStatusBadge(booking.booking_status)}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Requested on {format(new Date(booking.created_at), 'MMMM do, yyyy • h:mm a')}
            </p>
          </div>

          {/* Quick Pay CTA for accepted on header */}
          {isAccepted && booking.payment_status === 'pending' && (
            <div className="shrink-0">
              <PayNowButton 
                bookingId={booking.id} 
                amount={booking.total_amount} 
                ownerPhone={ownerPhone}
                ownerName={ownerName}
                className="w-full sm:w-auto h-10 px-5 text-sm"
              />
            </div>
          )}
        </div>

        {/* Stepper Progress Bar */}
        <div className="pt-2 pb-1 border-t border-gray-100">
          <BookingStepper 
            bookingStatus={booking.booking_status} 
            paymentStatus={booking.payment_status} 
          />
        </div>
      </div>

      {/* Dynamic Status Callout Alert Banner */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-50 via-amber-50/70 to-yellow-50/50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100/90 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-amber-950">
              Awaiting Owner Confirmation
            </h2>
            <p className="text-xs sm:text-sm text-amber-800/90 mt-0.5 leading-relaxed">
              We notified <span className="font-semibold text-amber-950">{ownerName}</span>. Once they verify machinery availability and approve, you will be invited to confirm with payment. You are not charged yet.
            </p>
          </div>
        </div>
      )}

      {isAccepted && booking.payment_status === 'pending' && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50/40 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-blue-950">
                Booking Request Accepted! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-blue-800/90 mt-0.5 leading-relaxed">
                The owner approved your rental dates. Complete payment of <span className="font-bold text-blue-950">₹{booking.total_amount}</span> to lock in your reservation and unlock owner handover details.
              </p>
            </div>
          </div>
          <PayNowButton 
            bookingId={booking.id} 
            amount={booking.total_amount} 
            ownerPhone={ownerPhone}
            ownerName={ownerName}
            className="w-full sm:w-auto shrink-0 h-10 px-5 text-sm"
          />
        </div>
      )}

      {isConfirmed && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50/40 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-emerald-950">
              Booking Confirmed & Guaranteed! ✅
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800/90 mt-0.5 leading-relaxed">
              Your equipment reservation is secured. Contact details and handover instructions with <span className="font-semibold text-emerald-950">{ownerName}</span> are now unlocked below.
            </p>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50/60 border border-red-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-700 shrink-0 mt-0.5">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-red-950">
              {booking.booking_status === 'rejected' ? 'Booking Declined by Owner' : 'Booking Request Cancelled'}
            </h2>
            <p className="text-xs sm:text-sm text-red-800/90 mt-0.5 leading-relaxed">
              {booking.booking_status === 'rejected'
                ? 'The owner was unable to accommodate this schedule. Your account has not been charged.'
                : 'This reservation has been cancelled. If any payment was captured, your refund is processed.'}
            </p>
          </div>
        </div>
      )}

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left 2 Columns */}
        <div className="md:col-span-2 space-y-5">
          {/* Equipment & Machinery Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-150/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Tractor className="h-5 w-5 text-[#009b55]" />
                Equipment Details
              </h2>
              {equipment?.id && (
                <Link 
                  href={`/equipment/${equipment.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#009b55] hover:text-emerald-700 transition-colors group"
                >
                  <span>View Listing</span>
                  <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            <div className="flex items-start gap-4">
              <EquipmentThumbnail 
                imageUrl={primaryImage} 
                title={equipment?.title || 'Machinery'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0" 
              />
              
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {equipment?.category && (
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                      {equipment.category}
                    </span>
                  )}
                  {equipment?.location && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {equipment.location}
                    </span>
                  )}
                </div>

                <Link 
                  href={`/equipment/${booking.equipment_id}`}
                  className="text-base sm:text-lg font-bold text-gray-900 hover:text-[#009b55] transition-colors line-clamp-2 leading-snug block"
                >
                  {equipment?.title || 'Agricultural Equipment'}
                </Link>

                <div className="flex items-center gap-3 pt-0.5 text-xs text-gray-500">
                  {equipment?.daily_rate && (
                    <span>
                      Rate: <span className="font-bold text-gray-800">₹{equipment.daily_rate}</span>/day
                    </span>
                  )}
                  {equipment?.brand && (
                    <span>
                      Brand: <span className="font-medium text-gray-700">{equipment.brand}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rental Period / Itinerary Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-150/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-[#009b55]" />
                Rental Schedule
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold">
                ⏱️ {durationLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Pick-up Box */}
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-150 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Pick-up / Delivery
                </div>
                <p className="text-base sm:text-lg font-extrabold text-gray-950">
                  {format(startDate, 'EEE, d MMM yyyy')}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  {format(startDate, 'hh:mm a')}
                </p>
              </div>

              {/* Return Box */}
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-150 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  Return / Drop-off
                </div>
                <p className="text-base sm:text-lg font-extrabold text-gray-950">
                  {format(endDate, 'EEE, d MMM yyyy')}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  {format(endDate, 'hh:mm a')}
                </p>
              </div>
            </div>

            {/* Notes if present */}
            {booking.notes && (
              <div className="pt-2">
                <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/60 text-xs sm:text-sm text-gray-700 flex items-start gap-2.5">
                  <FileText className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 block mb-0.5">Your Special Instructions:</span>
                    <p className="text-gray-600 italic">"{booking.notes}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Owner & Handover Contact Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-150/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#009b55]" />
                Equipment Owner & Handover
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                Verified Partner
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-[#009b55] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                {ownerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Owner / Host</p>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 truncate">
                  {ownerName}
                </h3>
                {equipment?.district && (
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    {equipment.district}{equipment.state ? `, ${equipment.state}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Status */}
            {isConfirmed && ownerPhone ? (
              <div className="pt-2 space-y-3">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-emerald-800 font-semibold">Direct Phone Number</p>
                    <p className="text-base font-bold text-gray-950 font-mono mt-0.5">{ownerPhone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={`tel:${ownerPhone}`}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
                      title="Call Owner"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <a 
                      href={`https://wa.me/91${ownerPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all shadow-xs"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Tip: Call or message the owner beforehand to verify pickup location & time.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-start gap-3 text-xs text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-200/80 flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xs sm:text-sm">Owner Contact Protected</p>
                  <p className="text-gray-500 mt-0.5 leading-relaxed">
                    Phone number and exact pickup location unlock automatically once the owner confirms your booking.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-5">
          {/* Payment Breakdown Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-150/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#009b55]" />
                Payment Summary
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                booking.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {booking.payment_status}
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Rental Charge ({durationLabel})</span>
                <span className="font-semibold text-gray-900">₹{rentalAmount}</span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <div>
                  <span>Security Deposit</span>
                  <p className="text-[10px] text-emerald-600 font-medium">100% Refundable on return</p>
                </div>
                <span className="font-semibold text-gray-900">₹{securityDeposit}</span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span>Platform & Insurance Fee</span>
                <span className="font-bold text-emerald-600 uppercase text-xs">FREE</span>
              </div>

              <div className="pt-3.5 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">Total Payable</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-gray-950">₹{booking.total_amount}</span>
                  <p className="text-[10px] text-gray-500">Taxes inclusive</p>
                </div>
              </div>
            </div>

            {/* Action inside Card */}
            {isAccepted && booking.payment_status === 'pending' && (
              <div className="pt-2">
                <PayNowButton 
                  bookingId={booking.id} 
                  amount={booking.total_amount} 
                  ownerPhone={ownerPhone}
                  ownerName={ownerName}
                  className="w-full h-11 text-sm shadow-md"
                  label={`Pay ₹${booking.total_amount} Now`}
                />
              </div>
            )}

            <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-150 flex items-center gap-2 text-[11px] text-gray-500">
              <ShieldCheck className="h-4 w-4 text-[#009b55] shrink-0" />
              <span>Payments held securely by AgriRent Escrow until equipment handover.</span>
            </div>
          </div>

          {/* Cancellation or Modify Section */}
          {(isPending || isAccepted) && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-150/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Need to cancel this booking?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                You can cancel free of charge before confirmation. No cancellation penalties apply.
              </p>
              <CancelBookingButton 
                bookingId={booking.id} 
                bookingNumber={booking.booking_number}
              />
            </div>
          )}

          {/* Help & Support Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent rounded-3xl p-5 border border-emerald-150/80 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#009b55]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">AgriRent Support</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Have questions regarding pickup, equipment condition, or payment? Our agricultural support desk is here for you.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#009b55] hover:underline"
            >
              Contact Support <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Pay Bar if action needed */}
      {isAccepted && booking.payment_status === 'pending' && (
        <div className="sm:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200/80 p-3 px-4 flex items-center justify-between gap-3 shadow-lg">
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Amount Due</p>
            <p className="text-lg font-black text-gray-950">₹{booking.total_amount}</p>
          </div>
          <PayNowButton 
            bookingId={booking.id} 
            amount={booking.total_amount} 
            ownerPhone={ownerPhone}
            ownerName={ownerName}
            className="h-10 px-6 text-sm shadow-md"
            label="Pay Now"
          />
        </div>
      )}
    </div>
  )
}
