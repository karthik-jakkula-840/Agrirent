import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { CalendarDays, Clock } from 'lucide-react'
import { format } from 'date-fns'

export const metadata = {
  title: 'Calendar | Owner Portal | Agriform',
}

export default async function OwnerCalendarPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  // Fetch upcoming and active bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, start_time, end_time, booking_status,
      equipment:equipment_id(title),
      customer:customer_id(full_name)
    `)
    .eq('owner_id', user!.id)
    .in('booking_status', ['accepted', 'confirmed', 'completed'])
    .order('start_time', { ascending: true })

  const now = new Date()

  // Very simple segmentation instead of a full complex calendar component
  const upcoming = bookings?.filter((b: any) => new Date(b.start_time) > now) || []
  const active = bookings?.filter((b: any) => new Date(b.start_time) <= now && new Date(b.end_time) >= now) || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Availability & Calendar</h1>
        <p className="text-gray-500 mt-1">Overview of your active and upcoming rentals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Active Rentals */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-primary/5 p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              Currently Active Rentals
            </h2>
          </div>
          
          <div className="p-6 flex-1 space-y-4">
            {active.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <CalendarDays className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p>No equipment currently rented out.</p>
              </div>
            ) : (
              active.map((b: any) => (
                <div key={b.id} className="p-4 rounded-xl border border-green-100 bg-green-50/50">
                  <h4 className="font-semibold text-gray-900 mb-1">{b.equipment?.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">Rented by {b.customer?.full_name}</p>
                  <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-lg w-fit">
                    <Clock className="h-3.5 w-3.5" />
                    Ends {format(new Date(b.end_time), 'MMM d, h:mm a')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Rentals */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Upcoming Bookings</h2>
          </div>
          
          <div className="p-6 flex-1 space-y-4">
            {upcoming.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <CalendarDays className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p>No upcoming bookings scheduled.</p>
              </div>
            ) : (
              upcoming.map((b: any) => (
                <div key={b.id} className="p-4 rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-1">{b.equipment?.title}</h4>
                  <p className="text-sm text-gray-500 mb-3">Customer: {b.customer?.full_name}</p>
                  <div className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
                    {format(new Date(b.start_time), 'MMM d')} - {format(new Date(b.end_time), 'MMM d')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
