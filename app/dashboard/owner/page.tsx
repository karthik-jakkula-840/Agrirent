import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { OwnerService } from '@/services/owner.service'
import { 
  Tractor, 
  CalendarClock, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles,
  Plus,
  CalendarDays,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RevenueChart } from './revenue-chart'
import { OwnerCalendar } from '@/components/dashboard/owner-calendar'
import { format } from 'date-fns'
import { cookies } from 'next/headers'
import { translations, LanguageCode } from '@/lib/translations'

export const metadata = {
  title: 'Dashboard | Owner Portal | AgriRent',
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
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebf8f1] border border-[#c3edd5] text-[#008f4c] text-xs font-bold mb-2.5 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#009b55]" />
            <span>Owner Portal</span>
          </div>
          <h1 className="text-[24px] sm:text-[32px] font-black tracking-tight text-gray-950 leading-tight">
            {t.welcome}, <span className="text-[#009b55]">{typedProfile?.full_name?.split(' ')[0] || 'Owner'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mt-1">
            {t.ownerDescription}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <Link href="/dashboard/owner/equipment/new">
            <Button className="bg-[#009b55] hover:bg-[#008f4c] text-white font-bold rounded-2xl shadow-xs text-xs sm:text-sm px-4 py-2.5 h-auto transition-all active:scale-[0.98]">
              <Plus className="h-4 w-4 mr-1.5" /> Add Equipment
            </Button>
          </Link>
          <Link href="/dashboard/owner/equipment">
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-2xl text-xs sm:text-sm px-4 py-2.5 h-auto transition-all active:scale-[0.98]">
              My Fleet
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Quick Action Pill Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:hidden">
        <Link 
          href="/dashboard/owner/equipment/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs shrink-0 active:bg-gray-50"
        >
          <Plus className="h-3.5 w-3.5 text-[#009b55]" />
          <span>Add Equipment</span>
        </Link>
        <Link 
          href="/dashboard/owner/bookings"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs shrink-0 active:bg-gray-50"
        >
          <CalendarClock className="h-3.5 w-3.5 text-blue-600" />
          <span>Bookings</span>
        </Link>
        <Link 
          href="/dashboard/owner/calendar"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs shrink-0 active:bg-gray-50"
        >
          <CalendarDays className="h-3.5 w-3.5 text-amber-600" />
          <span>Calendar</span>
        </Link>
        <Link 
          href="/dashboard/owner/analytics"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs shrink-0 active:bg-gray-50"
        >
          <LineChartIcon className="h-3.5 w-3.5 text-purple-600" />
          <span>Analytics</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard 
          title={t.totalEquipment} 
          value={stats.totalEquipment.toString()} 
          subtitle={`${stats.availableEquipment} ${t.currentlyAvailable}`}
          icon={Tractor} 
          color="text-blue-600" 
          bg="bg-blue-50 border-blue-100"
          href="/dashboard/owner/equipment"
        />
        <StatCard 
          title={t.activeBookings} 
          value={stats.activeBookings.toString()} 
          subtitle={`${stats.completedRentals} ${t.completedRentals}`}
          icon={CheckCircle2} 
          color="text-[#009b55]" 
          bg="bg-emerald-50 border-emerald-100"
          href="/dashboard/owner/bookings"
        />
        <StatCard 
          title={t.pendingRequests} 
          value={stats.pendingRequests.toString()} 
          subtitle={t.requiresAction}
          icon={CalendarClock} 
          color="text-amber-600" 
          bg="bg-amber-50 border-amber-100"
          href="/dashboard/owner/bookings"
        />
        <StatCard 
          title={t.totalRevenue} 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          subtitle={t.fromCompleted}
          icon={IndianRupee} 
          color="text-purple-600" 
          bg="bg-purple-50 border-purple-100"
          href="/dashboard/owner/analytics"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">{t.revenueOverview}</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{t.last30Days}</p>
            </div>
            <Link href="/dashboard/owner/analytics">
              <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs border-gray-200">
                {t.viewFullReport}
              </Button>
            </Link>
          </div>
          
          <div className="h-[280px] sm:h-[300px] w-full">
            {revenueData.every(d => d.revenue === 0) ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <LineChartIcon className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs sm:text-sm font-medium">{t.noRevenueData}</p>
              </div>
            ) : (
              <RevenueChart data={revenueData} />
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">{t.recentRequests}</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{t.pendingApproval}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {recentRequests.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{t.allCaughtUp}</h3>
                <p className="text-xs text-gray-500 font-medium">{t.noPendingRequests}</p>
              </div>
            ) : (
              recentRequests.map((req: any) => (
                <div key={req.id} className="p-3.5 sm:p-4 rounded-2xl border border-gray-100/90 hover:border-emerald-200 hover:shadow-sm transition-all group bg-white">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <h4 className="font-bold text-gray-950 text-xs sm:text-sm line-clamp-1">{req.equipment?.title}</h4>
                      <p className="text-[11px] sm:text-xs text-gray-500 font-medium line-clamp-1 mt-0.5">
                        {t.by} <span className="text-gray-700 font-semibold">{req.customer?.full_name}</span>
                      </p>
                    </div>
                    <span className="font-black text-[#009b55] text-xs sm:text-sm shrink-0">₹{req.total_amount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-3 font-medium">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(new Date(req.start_time), 'MMM d')} - {format(new Date(req.end_time), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Link href={`/dashboard/owner/bookings/${req.id}`}>
                    <Button variant="secondary" className="w-full text-xs font-bold h-8 rounded-xl bg-emerald-50 text-[#008f4c] hover:bg-[#009b55] hover:text-white transition-colors">
                      {t.reviewRequest} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
          
          {recentRequests.length > 0 && (
            <Link href="/dashboard/owner/bookings" className="mt-4 block text-center text-xs sm:text-sm font-bold text-[#009b55] hover:underline">
              {t.viewAllBookings}
            </Link>
          )}
        </div>

        {/* Calendar Widget */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">Equipment Schedule</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Overview of active rentals and equipment availability</p>
            </div>
            <Link href="/dashboard/owner/calendar" className="text-xs sm:text-sm font-bold text-[#009b55] hover:text-[#008f4c]">
              View Detailed Calendar →
            </Link>
          </div>
          <OwnerCalendar bookings={activeBookings} />
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, color, bg, href }: any) {
  const CardContent = (
    <div className="group bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-200/60 transition-all flex flex-col justify-between gap-3 h-full active:scale-[0.99]">
      <div className="flex items-center justify-between gap-2">
        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border flex items-center justify-center shrink-0 ${bg} ${color} transition-transform group-hover:scale-105`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-none mb-1">
          {value}
        </p>
        <p className="text-xs sm:text-sm font-semibold text-gray-500 truncate tracking-tight mb-0.5" title={title}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-gray-400 font-medium truncate">
            {subtitle}
          </p>
        )}
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
