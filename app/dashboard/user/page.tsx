import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { UserService } from '@/services/user.service'
import { 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronRight, 
  Activity, 
  Heart, 
  Sparkles, 
  Tractor, 
  CreditCard, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { WeatherWidget } from '@/components/dashboard/weather-widget'
import { cookies } from 'next/headers'
import { translations, LanguageCode } from '@/lib/translations'

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  
  const cookieStore = await cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as LanguageCode) || 'en'
  const t = translations[locale]?.dashboard || translations['en'].dashboard

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  const typedProfile = profile as any
  
  const userService = new UserService(supabase)
  
  const [stats, recentBookings, activeRentals, favoritesResult] = await Promise.all([
    userService.getCustomerDashboardStats(user.id),
    userService.getRecentBookings(user.id, 5),
    userService.getActiveRentals(user.id),
    supabase
      .from('favorites')
      .select(`id, equipment_id, equipment (id, title, daily_price, location, equipment_images (image_url, is_primary))`)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)
  ])

  const favorites = favoritesResult.data || []

  const STAT_CARDS = [
    { 
      title: t.activeRentals, 
      value: stats.activeRentals, 
      icon: Activity, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 border-blue-100',
      href: '/dashboard/user/bookings'
    },
    { 
      title: t.completed, 
      value: stats.completedRentals, 
      icon: CheckCircle2, 
      color: 'text-[#009b55]', 
      bg: 'bg-emerald-50 border-emerald-100',
      href: '/dashboard/user/bookings'
    },
    { 
      title: t.pendingBookings, 
      value: stats.pendingBookings, 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 border-amber-100',
      href: '/dashboard/user/bookings'
    },
    { 
      title: t.cancelled, 
      value: stats.cancelledBookings, 
      icon: XCircle, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50 border-rose-100',
      href: '/dashboard/user/bookings'
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'rejected': 
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200'
      default: return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebf8f1] border border-[#c3edd5] text-[#008f4c] text-xs font-bold mb-2.5 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#009b55]" />
            <span>Customer Dashboard</span>
          </div>
          <h1 className="text-[24px] sm:text-[32px] font-black tracking-tight text-gray-950 leading-tight">
            {t.welcome}, <span className="text-[#009b55]">{typedProfile?.full_name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mt-1">
            {t.manageDescription}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <Link href="/equipment">
            <Button className="bg-[#009b55] hover:bg-[#008f4c] text-white font-bold rounded-2xl shadow-xs text-xs sm:text-sm px-4 py-2.5 h-auto transition-all active:scale-[0.98]">
              <Tractor className="h-4 w-4 mr-1.5" /> Browse Fleet
            </Button>
          </Link>
          <Link href="/dashboard/user/bookings">
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-2xl text-xs sm:text-sm px-4 py-2.5 h-auto transition-all active:scale-[0.98]">
              My Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Quick Action Pill Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:hidden">
        <Link 
          href="/equipment?category=tractors"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs shrink-0 active:bg-gray-50"
        >
          <Tractor className="h-3.5 w-3.5 text-[#009b55]" />
          <span>Tractors</span>
        </Link>
        <Link 
          href="/dashboard/user/bookings"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs shrink-0 active:bg-gray-50"
        >
          <Clock className="h-3.5 w-3.5 text-blue-600" />
          <span>Track Bookings</span>
        </Link>
        <Link 
          href="/dashboard/user/favorites"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs shrink-0 active:bg-gray-50"
        >
          <Heart className="h-3.5 w-3.5 text-rose-500" />
          <span>Saved</span>
        </Link>
        <Link 
          href="/dashboard/user/payments"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs shrink-0 active:bg-gray-50"
        >
          <CreditCard className="h-3.5 w-3.5 text-purple-600" />
          <span>Payments</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {STAT_CARDS.map((stat, idx) => (
          <Link 
            key={idx} 
            href={stat.href}
            className="group bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-200/60 transition-all flex flex-col justify-between gap-3 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border flex items-center justify-center shrink-0 ${stat.bg} ${stat.color} transition-transform group-hover:scale-105`}>
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-none mb-1">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-500 truncate tracking-tight" title={stat.title}>
                {stat.title}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid: Left Column + Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Active Rentals */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100/80 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-gray-950 tracking-tight flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#009b55]"></span>
                {t.activeRentals}
              </h2>
              {activeRentals.length > 0 && (
                <Link href="/dashboard/user/bookings" className="text-xs sm:text-sm font-bold text-[#009b55] hover:text-[#008f4c] flex items-center gap-1">
                  View Details <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
            {activeRentals.length === 0 ? (
              <div className="p-8 sm:p-10 text-center">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-[#009b55] mx-auto flex items-center justify-center mb-3">
                  <Activity className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">{t.noActiveRentals}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">Book farm equipment anytime for your upcoming tasks.</p>
                <Link href="/equipment">
                  <Button className="bg-[#009b55] hover:bg-[#008f4c] text-white font-bold rounded-2xl text-xs sm:text-sm px-4 py-2">
                    Rent Equipment Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeRentals.map((rental: any) => (
                  <div key={rental.id} className="p-4 sm:p-6 hover:bg-gray-50/40 transition-colors">
                    {rental.rental_items?.map((item: any) => (
                      <div key={item.id} className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-gray-950">{item.equipment?.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 font-medium mb-2.5">
                            {t.owner}: <span className="font-semibold text-gray-700">{item.equipment?.profiles?.full_name}</span>
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">
                              {t.started}: {format(new Date(item.start_date), 'MMM dd')}
                            </span>
                            <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100">
                              {t.ends}: {format(new Date(item.end_date), 'MMM dd')}
                            </span>
                          </div>
                        </div>
                        <div className="sm:text-right self-start sm:self-center">
                          <Link href={`/dashboard/user/bookings`}>
                            <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs border-gray-200">
                              {t.viewRental}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100/80 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">{t.recentBookings}</h2>
              <Link href="/dashboard/user/bookings" className="text-xs sm:text-sm font-bold text-[#009b55] hover:text-[#008f4c] flex items-center gap-1 transition-colors">
                {t.viewAll} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentBookings.length === 0 ? (
              <div className="p-8 sm:p-10 text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl bg-gray-50 text-gray-400 mx-auto flex items-center justify-center mb-3">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">{t.noBookings}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">Start renting verified tractors, harvesters and tools.</p>
                <Link href="/equipment">
                  <Button className="bg-[#009b55] hover:bg-[#008f4c] text-white font-bold rounded-2xl text-xs sm:text-sm px-4 py-2">
                    {t.browseEquipment}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentBookings.map((booking: any) => {
                  const image = booking.equipment?.equipment_images?.find((i:any)=>i.is_primary)?.image_url 
                             || booking.equipment?.equipment_images?.[0]?.image_url
                             || 'https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=200'
                  return (
                    <Link 
                      key={booking.id} 
                      href="/dashboard/user/bookings"
                      className="p-3.5 sm:p-5 flex items-center gap-3.5 hover:bg-gray-50/50 transition-colors block"
                    >
                      <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                        <Image src={image} alt={booking.equipment?.title || 'Equipment'} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-950 truncate">{booking.equipment?.title}</h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate mt-0.5">
                          {format(new Date(booking.start_time), 'MMM dd')} - {format(new Date(booking.end_time), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-gray-950 text-xs sm:text-sm mb-1">₹{booking.total_amount}</p>
                        <Badge variant="outline" className={`capitalize text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(booking.booking_status)}`}>
                          {booking.booking_status}
                        </Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Favorite Equipment */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100/80 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-gray-950 tracking-tight flex items-center gap-2">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 fill-rose-500" /> Favorite Equipment
              </h2>
              <Link href="/dashboard/user/favorites" className="text-xs sm:text-sm font-bold text-[#009b55] hover:text-[#008f4c] flex items-center gap-1 transition-colors">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {favorites.length === 0 ? (
              <div className="p-8 sm:p-10 text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-400 mx-auto flex items-center justify-center mb-3">
                  <Heart className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">No favorite equipment saved yet</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">Click the heart icon on any equipment to save it here for fast booking.</p>
                <Link href="/equipment">
                  <Button className="bg-[#009b55] hover:bg-[#008f4c] text-white font-bold rounded-2xl text-xs sm:text-sm px-4 py-2">
                    Browse Equipment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {favorites.map((fav: any) => {
                  const eq = fav.equipment
                  const image = eq?.equipment_images?.find((i: any) => i.is_primary)?.image_url
                            || eq?.equipment_images?.[0]?.image_url
                            || 'https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=200'
                  return (
                    <Link key={fav.id} href={`/equipment/${eq?.id}`} className="p-3.5 sm:p-5 flex items-center gap-3.5 hover:bg-gray-50/50 transition-colors block">
                      <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                        <Image src={image} alt={eq?.title || ''} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-950 truncate">{eq?.title}</h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5 truncate">
                          <span className="font-bold text-[#009b55]">₹{eq?.daily_price}/day</span>
                          <span className="text-gray-300">·</span>
                          <span className="truncate">{eq?.location}</span>
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Local Weather & Need Help Support */}
        <div className="space-y-6">
          <WeatherWidget />
          
          <div className="bg-gradient-to-br from-[#009b55] to-[#007f46] p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-white shadow-lg border border-emerald-600/30">
            <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-3">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight mb-1.5">{t.needHelp}</h3>
            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed mb-5">
              {t.supportText}
            </p>
            <Link href="/contact" className="block w-full">
              <Button className="w-full bg-white text-[#009b55] hover:bg-white/95 font-bold rounded-2xl text-xs sm:text-sm py-2.5 h-auto shadow-xs active:scale-[0.98] transition-all">
                {t.contactSupport}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
