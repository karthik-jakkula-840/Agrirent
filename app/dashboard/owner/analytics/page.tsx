import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { OwnerService } from '@/services/owner.service'
import { RevenueChart } from '../revenue-chart'
import { LineChart, BarChart2, Tractor, CalendarClock } from 'lucide-react'
import Image from 'next/image'

export const metadata = {
  title: 'Analytics | Owner Portal | Agriform',
}

export default async function OwnerAnalyticsPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()
  const ownerService = new OwnerService(supabase)

  // Fetch chart data (last 6 months)
  const revenueData = await ownerService.getRevenueAnalytics(user!.id, 180)
  
  // Aggregate monthly for a simpler view if needed, but the RevenueChart handles it.
  
  // Fetch Top Equipment
  const topEquipment = await ownerService.getTopEquipment(user!.id, 5)

  // Fetch some summary stats
  const stats = await ownerService.getDashboardStats(user!.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Deep dive into your rental business performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <LineChart className="h-5 w-5" />
            <h3 className="font-medium">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <CalendarClock className="h-5 w-5" />
            <h3 className="font-medium">Completed Rentals</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.completedRentals}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <BarChart2 className="h-5 w-5" />
            <h3 className="font-medium">Avg Revenue / Booking</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{stats.completedRentals > 0 ? Math.round(stats.totalRevenue / stats.completedRentals).toLocaleString() : 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart - Last 6 Months */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
            <p className="text-sm text-gray-500">Last 6 months performance</p>
          </div>
          
          <div className="h-[300px] w-full">
            {revenueData.every(d => d.revenue === 0) ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <LineChart className="h-8 w-8 mb-2 opacity-50" />
                <p>Not enough revenue data yet.</p>
              </div>
            ) : (
              <RevenueChart data={revenueData} />
            )}
          </div>
        </div>

        {/* Top Equipment */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Performing Equipment</h2>
            <p className="text-sm text-gray-500">By revenue generated</p>
          </div>

          <div className="flex-1 space-y-4">
            {topEquipment.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-6">
                <Tractor className="h-8 w-8 mb-2 opacity-50" />
                <p>No equipment performance data yet.</p>
              </div>
            ) : (
              topEquipment.map((eq: any, index: number) => (
                <div key={eq.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-gray-400 w-4">{index + 1}</div>
                    <div className="h-12 w-12 rounded-lg bg-gray-200 relative overflow-hidden shrink-0">
                      {eq.image ? (
                        <Image src={eq.image} alt={eq.title} fill className="object-cover" />
                      ) : (
                        <Tractor className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{eq.title}</h4>
                      <p className="text-xs text-gray-500">{eq.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{eq.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
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
