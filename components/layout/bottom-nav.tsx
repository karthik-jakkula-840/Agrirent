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
      href: '/bookings', 
      icon: Calendar,
      isActive: pathname.startsWith('/bookings') || pathname.includes('/bookings') || (pathname.startsWith('/dashboard') && !pathname.includes('/profile'))
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: User,
      isActive: pathname.includes('/profile')
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 pb-safe shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.isActive
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary font-semibold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-primary/20 scale-105 transition-transform' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px]">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
