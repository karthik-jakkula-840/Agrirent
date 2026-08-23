'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Tractor, Calendar, User } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Equipment', href: '/equipment', icon: Tractor },
    { name: 'Bookings', href: '/dashboard/user', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
