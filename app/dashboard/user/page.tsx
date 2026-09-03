import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { UserService } from '@/services/user.service'
import { CalendarClock, CheckCircle2, Clock, XCircle, ChevronRight, Activity, Heart } from 'lucide-react'
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
    { title: t.activeRentals, value: stats.activeRentals, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: t.completed, value: stats.completedRentals, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { title: t.pendingBookings, value: stats.pendingBookings, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { title: t.cancelled, value: stats.cancelledBookings, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ]

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
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t.welcome}, {typedProfile?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-gray-500 mt-1">{t.manageDescription}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {STAT_CARDS.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 w-full">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate" title={stat.title}>{stat.title}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Rentals */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{t.activeRentals}</h2>
            </div>
            {activeRentals.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t.noActiveRentals}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeRentals.map((rental: any) => (
                  <div key={rental.id} className="p-6">
                    {rental.rental_items?.map((item: any) => (
                      <div key={item.id} className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-gray-900">{item.equipment?.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{t.owner}: {item.equipment?.profiles?.full_name}</p>
                          <div className="flex gap-4 text-sm font-medium">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                              {t.started}: {format(new Date(item.start_date), 'MMM dd')}
                            </span>
                            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md">
                              {t.ends}: {format(new Date(item.end_date), 'MMM dd')}
                            </span>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <Button variant="outline" size="sm">{t.viewRental}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{t.recentBookings}</h2>
              <Link href="/dashboard/user/bookings" className="text-sm font-medium text-primary hover:underline">
                {t.viewAll}
              </Link>
            </div>
            {recentBookings.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <CalendarClock className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-500 mb-4">{t.noBookings}</p>
                <Link href="/equipment">
                  <Button className="bg-primary hover:bg-primary/90 text-white">{t.browseEquipment}</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentBookings.map((booking: any) => {
                  const image = booking.equipment?.equipment_images?.find((i:any)=>i.is_primary)?.image_url 
                             || booking.equipment?.equipment_images?.[0]?.image_url
                             || 'https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=200'
                  return (
                    <div key={booking.id} className="p-6 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0">
                        <Image src={image} alt={booking.equipment?.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{booking.equipment?.title}</h3>
                        <p className="text-xs text-gray-500 truncate">{format(new Date(booking.start_time), 'MMM dd')} - {format(new Date(booking.end_time), 'MMM dd, yy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 mb-1">₹{booking.total_amount}</p>
                        <Badge variant="outline" className={`border-transparent capitalize text-xs ${getStatusColor(booking.booking_status)}`}>
                          {booking.booking_status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Favorite Equipment */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" /> Favorite Equipment
              </h2>
              <Link href="/dashboard/user/favorites" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {favorites.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <Heart className="h-10 w-10 text-gray-200 mb-3" />
                <p className="text-gray-500 mb-4">No favorite equipment saved yet.</p>
                <Link href="/equipment">
                  <Button className="bg-primary hover:bg-primary/90 text-white">Browse Equipment</Button>
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
                    <Link key={fav.id} href={`/equipment/${eq?.id}`} className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors block">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <Image src={image} alt={eq?.title || ''} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{eq?.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <span>₹{eq?.daily_price}/day</span>
                          <span className="mx-1">·</span>
                          <span>{eq?.location}</span>
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

        {/* Right Sidebar (Upcoming / Ads / Quick Links) */}
        <div className="space-y-6">
          <WeatherWidget />
          
          <div className="bg-primary p-6 rounded-3xl text-white shadow-lg">
            <h3 className="font-bold text-xl mb-2">{t.needHelp}</h3>
            <p className="text-primary-foreground/80 text-sm mb-6">
              {t.supportText}
            </p>
            <Link href="/contact" className="block w-full">
              <Button className="w-full bg-white text-primary hover:bg-gray-100">
                {t.contactSupport}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
