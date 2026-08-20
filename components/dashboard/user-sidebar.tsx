'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CalendarClock, 
  Heart, 
  Bell, 
  CreditCard, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard/user', icon: LayoutDashboard },
  { name: 'My Bookings', href: '/dashboard/user/bookings', icon: CalendarClock },
  { name: 'Favorites', href: '/dashboard/user/favorites', icon: Heart },
  { name: 'Notifications', href: '/dashboard/user/notifications', icon: Bell },
  { name: 'Payments', href: '/dashboard/user/payments', icon: CreditCard },
  { name: 'Profile', href: '/dashboard/user/profile', icon: User },
  { name: 'Settings', href: '/dashboard/user/settings', icon: Settings },
]

export function UserSidebar({ profile, isMobileMenuOpen, setIsMobileMenuOpen }: any) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

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
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard/user')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen?.(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-primary/20 text-primary font-bold">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{profile?.role}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
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
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
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
