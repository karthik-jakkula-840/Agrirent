import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { OwnerService } from '@/services/owner.service'
import { 
  Tractor, 
  CalendarClock, 
  IndianRupee, 
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RevenueChart } from './revenue-chart'
import { OwnerCalendar } from '@/components/dashboard/owner-calendar'
import { format } from 'date-fns'
import { cookies } from 'next/headers'
import { translations, LanguageCode } from '@/lib/translations'

export const metadata = {
  title: 'Dashboard | Owner Portal | Agriform',
}

export default async function OwnerDashboardPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()
  const ownerService = new OwnerService(supabase)

  const cookieStore = await cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as LanguageCode) || 'en'
  const t = translations[locale]?.dashboard || translations['en'].dashboard

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()
  
  const typedProfile = profile as any

  // Fetch real statistics
  const stats = await ownerService.getDashboardStats(user!.id)
  
  // Fetch recent booking requests (pending)
  const recentRequests = await ownerService.getRecentBookingRequests(user!.id, 5)

  // Fetch chart data (last 30 days)
  const revenueData = await ownerService.getRevenueAnalytics(user!.id, 30)

  // Fetch active bookings for calendar
  const activeBookings = await ownerService.getActiveBookings(user!.id)

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t.welcome}, {typedProfile?.full_name?.split(' ')[0] || 'Owner'}
        </h1>
        <p className="text-gray-500 mt-1">{t.ownerDescription}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title={t.totalEquipment} 
          value={stats.totalEquipment.toString()} 
          subtitle={`${stats.availableEquipment} ${t.currentlyAvailable}`}
          icon={Tractor} 
          color="bg-blue-50 text-blue-600" 
          href="/dashboard/owner/equipment"
        />
        <StatCard 
          title={t.activeBookings} 
          value={stats.activeBookings.toString()} 
          subtitle={`${stats.completedRentals} ${t.completedRentals}`}
          icon={CheckCircle2} 
          color="bg-green-50 text-green-600" 
          href="/dashboard/owner/bookings"
        />
        <StatCard 
          title={t.pendingRequests} 
          value={stats.pendingRequests.toString()} 
          subtitle={t.requiresAction}
          icon={CalendarClock} 
          color="bg-amber-50 text-amber-600" 
          href="/dashboard/owner/bookings"
        />
        <StatCard 
          title={t.totalRevenue} 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          subtitle={t.fromCompleted}
          icon={IndianRupee} 
          color="bg-purple-50 text-purple-600" 
          href="/dashboard/owner/analytics"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t.revenueOverview}</h2>
              <p className="text-sm text-gray-500">{t.last30Days}</p>
            </div>
            <Link href="/dashboard/owner/analytics">
              <Button variant="outline" size="sm">{t.viewFullReport}</Button>
            </Link>
          </div>
          
          <div className="h-[300px] w-full">
            {revenueData.every(d => d.revenue === 0) ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <LineChartIcon className="h-8 w-8 mb-2 opacity-50" />
                <p>{t.noRevenueData}</p>
              </div>
            ) : (
              <RevenueChart data={revenueData} />
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t.recentRequests}</h2>
              <p className="text-sm text-gray-500">{t.pendingApproval}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {recentRequests.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{t.allCaughtUp}</h3>
                <p className="text-sm text-gray-500">{t.noPendingRequests}</p>
              </div>
            ) : (
              recentRequests.map((req: any) => (
                <div key={req.id} className="p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{req.equipment?.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">{t.by} {req.customer?.full_name}</p>
                    </div>
                    <span className="font-semibold text-primary shrink-0">₹{req.total_amount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {format(new Date(req.start_time), 'MMM d')} - {format(new Date(req.end_time), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Link href={`/dashboard/owner/bookings/${req.id}`}>
                    <Button variant="secondary" className="w-full text-sm h-9 bg-primary/10 text-primary hover:bg-primary hover:text-white group-hover:bg-primary group-hover:text-white transition-colors">
                      {t.reviewRequest} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
          
          {recentRequests.length > 0 && (
            <Link href="/dashboard/owner/bookings" className="mt-4 block text-center text-sm font-medium text-primary hover:underline">
              {t.viewAllBookings}
            </Link>
          )}
        </div>

        {/* Calendar Widget */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Equipment Schedule</h2>
              <p className="text-xs sm:text-sm text-gray-500">Overview of active rentals and equipment availability</p>
            </div>
            <Link href="/dashboard/owner/calendar" className="text-xs sm:text-sm font-semibold text-green-700 hover:underline">
              View Detailed Calendar →
            </Link>
          </div>
          <OwnerCalendar bookings={activeBookings} />
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, color, href }: any) {
  const CardContent = (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group h-full">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </div>
        {href && <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {CardContent}
      </Link>
    )
  }

  return CardContent
}

function LineChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}
