import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { Users, Mail, Phone, CalendarClock, MapPin } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'

export const metadata = {
  title: 'Customers | Owner Portal | Agriform',
}

export default async function OwnerCustomersPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  // Find all unique customers who have booked this owner's equipment
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      customer:customer_id (id, full_name, email, phone, avatar_url:profile_image, district),
      total_amount,
      booking_status,
      created_at
    `)
    .eq('owner_id', user!.id)

  const customerMap = new Map<string, any>()

  bookings?.forEach((b: any) => {
    const c = b.customer
    if (!c) return
    
    if (!customerMap.has(c.id)) {
      customerMap.set(c.id, {
        ...c,
        bookingCount: 0,
        totalSpent: 0,
        lastBooking: b.created_at
      })
    }
    
    const customerData = customerMap.get(c.id)
    customerData.bookingCount++
    if (['completed', 'confirmed', 'accepted'].includes(b.booking_status)) {
      customerData.totalSpent += Number(b.total_amount)
    }
    if (new Date(b.created_at) > new Date(customerData.lastBooking)) {
      customerData.lastBooking = b.created_at
    }
  })

  const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Your Customers</h1>
        <p className="text-gray-500 mt-1">Farmers who have rented your equipment</p>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Once a farmer books your equipment, their details will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c: any) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  {c.avatar_url ? (
                    <Image src={c.avatar_url} alt={c.full_name || 'Customer'} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-bold text-xl">
                      {c.full_name?.charAt(0) || 'C'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{c.full_name}</h3>
                  <p className="text-sm text-gray-500 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {c.district || 'Unknown Location'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{c.phone || 'No phone provided'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 bg-gray-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Spent</p>
                  <p className="text-lg font-bold text-primary">₹{c.totalSpent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Bookings</p>
                  <p className="text-lg font-bold text-gray-900">{c.bookingCount}</p>
                </div>
                <div className="col-span-2 mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Last booked on {format(new Date(c.lastBooking), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
