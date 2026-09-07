'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Tractor, Calendar, User, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function BottomNav() {
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            const userRole = (data as any)?.role
            if (userRole) {
              setRole(userRole)
            }
          })
      }
    })
  }, [pathname])

  const isOwner = role === 'owner' || role === 'rental_owner'

  const navItems = isOwner ? [
    { 
      name: 'Dashboard', 
      href: '/dashboard/owner', 
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard/owner'
    },
    { 
      name: 'My Fleet', 
      href: '/dashboard/owner/equipment', 
      icon: Tractor,
      isActive: pathname.startsWith('/dashboard/owner/equipment')
    },
    { 
      name: 'Bookings', 
      href: '/dashboard/owner/bookings', 
      icon: Calendar,
      isActive: pathname.startsWith('/dashboard/owner/bookings')
    },
    { 
      name: 'Profile', 
      href: '/dashboard/owner/profile', 
      icon: User,
      isActive: pathname.startsWith('/dashboard/owner/profile')
    },
  ] : [
    { 
      name: 'Home', 
      href: '/', 
      icon: Home,
      isActive: pathname === '/'
    },
    { 
      name: 'Equipment', 
      href: '/equipment', 
      icon: Tractor,
      isActive: pathname.startsWith('/equipment')
    },
    { 
      name: 'Bookings', 
      href: '/dashboard/user/bookings', 
      icon: Calendar,
      isActive: pathname.includes('/bookings')
    },
    { 
      name: 'Profile', 
      href: '/dashboard/user/profile', 
      icon: User,
      isActive: pathname.includes('/profile') || pathname === '/dashboard/user'
    },
  ]

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-150/90 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pt-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-4 items-center max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const isActive = item.isActive
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex flex-col items-center justify-center py-1 gap-1 transition-all select-none ${
                isActive ? 'text-[#009b55]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`relative px-3 py-0.5 rounded-full transition-all ${
                isActive ? 'bg-emerald-50 text-[#009b55]' : 'text-gray-400 group-hover:text-gray-600'
              }`}>
                <Icon 
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-105 stroke-[#009b55]' : ''
                  }`} 
                  strokeWidth={isActive ? 2.3 : 1.7} 
                />
              </div>
              <span className={`text-[10.5px] tracking-tight truncate max-w-[72px] text-center leading-none ${
                isActive ? 'font-bold text-[#009b55]' : 'font-medium text-gray-500'
              }`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
