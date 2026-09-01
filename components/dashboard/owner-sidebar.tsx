'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { translations, LanguageCode } from '@/lib/translations'
import { 
  LayoutDashboard, 
  Tractor,
  CalendarCheck,
  CalendarDays,
  Users,
  Star,
  CreditCard,
  LineChart,
  Bell, 
  User, 
  Settings, 
  LogOut,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { translationKey: 'dashboard', href: '/dashboard/owner', icon: LayoutDashboard },
  { translationKey: 'myEquipment', href: '/dashboard/owner/equipment', icon: Tractor },
  { translationKey: 'bookings', href: '/dashboard/owner/bookings', icon: CalendarCheck },
  { translationKey: 'calendar', href: '/dashboard/owner/calendar', icon: CalendarDays },
  { translationKey: 'customers', href: '/dashboard/owner/customers', icon: Users },
  { translationKey: 'reviews', href: '/dashboard/owner/reviews', icon: Star },
  { translationKey: 'payments', href: '/dashboard/owner/payments', icon: CreditCard },
  { translationKey: 'analytics', href: '/dashboard/owner/analytics', icon: LineChart },
  { translationKey: 'notifications', href: '/dashboard/owner/notifications', icon: Bell },
  { translationKey: 'profile', href: '/dashboard/owner/profile', icon: User },
  { translationKey: 'settings', href: '/dashboard/owner/settings', icon: Settings },
]

export function OwnerSidebar({ profile, isMobileMenuOpen, setIsMobileMenuOpen, locale = 'en' }: any) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const t = translations[locale as LanguageCode]?.sidebar || translations['en'].sidebar

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
          <span className="bg-primary text-white p-1.5 rounded-lg">A</span>
          Agriform
        </Link>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mt-2">{t.ownerPortal}</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard/owner')
          return (
            <Link
              key={item.translationKey}
              href={item.href}
              onClick={() => setIsMobileMenuOpen?.(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
              {t[item.translationKey as keyof typeof t]}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 pb-safe border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.full_name || 'Owner'} fill sizes="40px" className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-primary/20 text-primary font-bold">
                {profile?.full_name?.charAt(0) || 'O'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name || 'Owner'}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{profile?.role}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t.logout}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              className="absolute top-6 right-4 p-2 text-gray-500 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
