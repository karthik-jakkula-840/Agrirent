'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, Menu, Tractor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { translations, LanguageCode } from '@/lib/translations'
import Image from 'next/image'
import { LanguageToggle } from '@/components/language-toggle'

export function DashboardHeader({ 
  profile, 
  unreadCount, 
  onMenuClick,
  notificationHref = "/dashboard/user/notifications",
  profileHref = "/dashboard/user/profile",
  locale = 'en'
}: any) {
  const t = translations[locale as LanguageCode]?.sidebar || translations['en'].sidebar

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-gray-100/90 px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between lg:px-8 transition-all">
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
          className="lg:hidden p-2 -ml-1.5 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100/70 transition-colors"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Mobile Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 lg:hidden select-none">
          <Tractor className="h-5 w-5 text-[#009b55]" />
          <span className="text-base sm:text-lg font-black tracking-tight text-gray-950">
            Agri<span className="text-[#009b55]">Rent</span>
          </span>
        </Link>

        {/* Desktop Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder={t.searchPlaceholder} 
            aria-label="Search bookings and equipment"
            className="pl-9 w-64 bg-gray-50/80 border-gray-200/60 focus:bg-white transition-colors rounded-full text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3.5">
        <LanguageToggle />
        <Link href={notificationHref}>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative h-9 w-9 text-gray-600 hover:text-[#009b55] hover:bg-[#009b55]/10 rounded-full transition-colors">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </Button>
        </Link>
        
        <Link href={profileHref} aria-label="View profile" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200/90 shadow-2xs hover:scale-105 transition-transform shrink-0">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="Profile" fill sizes="36px" className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-[#009b55] text-white font-bold text-xs sm:text-sm">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
          )}
        </Link>
      </div>
    </header>
  )
}
