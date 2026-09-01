'use client'

import { useState } from 'react'
import { UserSidebar } from '@/components/dashboard/user-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export function DashboardLayoutClient({ 
  children, 
  profile, 
  unreadCount,
  locale
}: { 
  children: React.ReactNode
  profile: any
  unreadCount: number
  locale?: string
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans">
      <UserSidebar 
        profile={profile} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        locale={locale} 
      />
      
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <DashboardHeader 
          profile={profile} 
          unreadCount={unreadCount} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
          locale={locale} 
        />
        
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
