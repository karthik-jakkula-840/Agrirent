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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="flex justify-around items-center h-14 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = item.isActive
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                isActive ? 'text-[#009b55] font-bold' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'stroke-[#009b55] fill-[#009b55]/15 scale-105' : ''
                }`} 
                strokeWidth={isActive ? 2.4 : 1.8} 
              />
              <span className="text-[10px] font-semibold tracking-tight">{item.name}</span>
            </Link>
          )
        })}
      </div>
      
      {/* iOS Home Indicator Bar */}
      <div className="w-28 h-1 bg-gray-300/80 rounded-full mx-auto mb-1.5" />
    </nav>
  )
}
