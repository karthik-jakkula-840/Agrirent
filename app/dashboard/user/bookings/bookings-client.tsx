'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { 
  Calendar, 
  ChevronRight, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CreditCard,
  RotateCcw,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BookingsClientProps {
  initialBookings: any[]
}

export function CustomerBookingsClient({ initialBookings }: BookingsClientProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all')
  const [search, setSearch] = useState('')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            <CheckCircle2 className="h-3 w-3 text-blue-600" /> Accepted
          </span>
        )
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 shrink-0">
            <CheckCircle2 className="h-3 w-3 text-green-600" /> Confirmed
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
            <CheckCircle2 className="h-3 w-3 text-gray-500" /> Completed
          </span>
        )
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shrink-0">
            <XCircle className="h-3 w-3 text-red-600" /> {status}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <Clock className="h-3 w-3 text-amber-600" /> Pending
          </span>
        )
    }
  }

  const filteredBookings = initialBookings.filter((b) => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'accepted' ? (b.booking_status === 'accepted' || b.booking_status === 'confirmed') :
      b.booking_status === filter

    const q = search.toLowerCase().trim()
    const matchesSearch = !q || 
      b.equipment?.title?.toLowerCase().includes(q) ||
      b.booking_number?.toLowerCase().includes(q)

    return matchesFilter && matchesSearch
  })

  const counts = {
    all: initialBookings.length,
    pending: initialBookings.filter(b => b.booking_status === 'pending').length,
    accepted: initialBookings.filter(b => b.booking_status === 'accepted' || b.booking_status === 'confirmed').length,
    completed: initialBookings.filter(b => b.booking_status === 'completed').length,
    cancelled: initialBookings.filter(b => b.booking_status === 'cancelled' || b.booking_status === 'rejected').length,
  }

  return (
    <div className="space-y-5 w-full min-w-0">
      {/* Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'all' 
                ? 'bg-[#009b55] text-white shadow-sm' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'pending' 
                ? 'bg-[#009b55] text-white shadow-sm' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            type="button"
            onClick={() => setFilter('accepted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'accepted' 
                ? 'bg-[#009b55] text-white shadow-sm' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Active ({counts.accepted})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'completed' 
                ? 'bg-[#009b55] text-white shadow-sm' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Completed ({counts.completed})
          </button>
          <button
            type="button"
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'cancelled' 
                ? 'bg-[#009b55] text-white shadow-sm' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Cancelled ({counts.cancelled})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-60 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="pl-8.5 pr-3 h-9 text-xs rounded-xl bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-[#009b55]"
          />
        </div>
      </div>

      {/* Bookings Card List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center shadow-sm">
          <div className="h-14 w-14 bg-emerald-50 text-[#009b55] rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No bookings found</h3>
          <p className="text-gray-500 mb-5 max-w-sm mx-auto text-xs sm:text-sm">
            {search || filter !== 'all'
              ? 'No bookings match your current filter criteria. Try clearing your filters.'
              : "You haven't requested any equipment yet. Explore the marketplace to find what you need."}
          </p>
          {search || filter !== 'all' ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => { setFilter('all'); setSearch('') }}
              className="rounded-xl gap-2 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          ) : (
            <Link href="/equipment">
              <Button size="sm" className="bg-[#009b55] hover:bg-[#00874a] text-white rounded-xl text-xs font-semibold">
                Browse Equipment
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking: any) => {
            const primaryImage = booking.equipment?.equipment_images?.find((i: any) => i.is_primary)?.image_url 
                              || booking.equipment?.equipment_images?.[0]?.image_url 
                              || 'https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=300'

            const isPendingPayment = booking.booking_status === 'accepted' && booking.payment_status === 'pending'
            
            return (
              <div 
                key={booking.id} 
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all p-4 sm:p-5 space-y-3.5"
              >
                {/* Top Section: Thumbnail + Title + Status */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative h-18 w-20 sm:h-22 sm:w-28 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100 shadow-inner">
                    <Image 
                      src={primaryImage} 
                      alt={booking.equipment?.title || 'Equipment'} 
                      fill 
                      sizes="(max-width: 640px) 80px, 112px"
                      className="object-cover" 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2">
                        {booking.equipment?.title || 'Agricultural Equipment'}
                      </h3>
                      {getStatusBadge(booking.booking_status)}
                    </div>

                    <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-gray-700">Booking No:</span>{' '}
                      <span className="font-mono text-gray-600">{booking.booking_number}</span>
                    </p>

                    {isPendingPayment && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] sm:text-[11px] font-semibold">
                        <Sparkles className="h-3 w-3 text-blue-500 shrink-0" />
                        <span>Accepted! Complete payment to confirm</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid Box */}
                <div className="bg-gray-50/80 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[10px] sm:text-[11px] font-medium">Period</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5 text-[11px] sm:text-xs">
                      <Calendar className="h-3 w-3 text-gray-400 shrink-0" />
                      <span className="truncate">
                        {format(new Date(booking.start_time), 'MMM d, yy')} - {format(new Date(booking.end_time), 'MMM d, yy')}
                      </span>
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] sm:text-[11px] font-medium">Total Amount</span>
                    <span className="font-black text-gray-900 text-sm mt-0.5 block">
                      ₹{booking.total_amount}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] sm:text-[11px] font-medium">Payment</span>
                    <span className="mt-1 inline-block">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        booking.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {booking.payment_status}
                      </span>
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] sm:text-[11px] font-medium">Daily Rate</span>
                    <span className="font-semibold text-gray-700 mt-0.5 block text-[11px] sm:text-xs">
                      ₹{booking.equipment?.daily_price || '—'} / day
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-[10px] text-gray-400 hidden sm:block font-mono">
                    {format(new Date(booking.created_at || booking.start_time), 'MMM d, yyyy')}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {booking.booking_status === 'completed' && (
                      <Link href={`/equipment/${booking.equipment_id}#reviews`} className="flex-1 sm:flex-initial">
                        <Button variant="outline" size="sm" className="w-full h-8 sm:h-9 text-xs rounded-xl border-green-200 text-green-700 hover:bg-green-50 font-semibold">
                          Leave Review
                        </Button>
                      </Link>
                    )}

                    {isPendingPayment && (
                      <Link href={`/dashboard/user/bookings/${booking.id}`} className="flex-1 sm:flex-initial">
                        <Button size="sm" className="w-full h-8 sm:h-9 text-xs rounded-xl bg-[#009b55] hover:bg-[#00874a] text-white font-bold gap-1 shadow-sm">
                          <CreditCard className="h-3.5 w-3.5" /> Pay Now
                        </Button>
                      </Link>
                    )}

                    <Link href={`/dashboard/user/bookings/${booking.id}`} className={isPendingPayment ? 'flex-1 sm:flex-initial' : 'w-full sm:w-auto'}>
                      <Button variant="outline" size="sm" className="w-full h-8 sm:h-9 text-xs font-semibold rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 gap-1">
                        View Details <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
