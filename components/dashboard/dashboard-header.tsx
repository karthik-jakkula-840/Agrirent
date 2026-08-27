'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { LanguageToggle } from '@/components/language-toggle'

export function DashboardHeader({ 
  profile, 
  unreadCount, 
  onMenuClick,
  notificationHref = "/dashboard/user/notifications",
  profileHref = "/dashboard/user/profile"
}: any) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 h-16 flex items-center justify-between lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search bookings, equipment..." 
            className="pl-9 w-64 bg-gray-50 border-transparent focus:bg-white transition-colors rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LanguageToggle />
        <Link href={notificationHref}>
          <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </Button>
        </Link>
        
        <Link href={profileHref} className="relative h-9 w-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-primary text-white font-bold text-sm">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
          )}
        </Link>
      </div>
    </header>
  )
}
