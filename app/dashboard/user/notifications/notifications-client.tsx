'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CalendarClock, CreditCard, Loader2 } from 'lucide-react'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

export function NotificationsClient({ initialNotifications }: { initialNotifications: any[] }) {
  const router = useRouter()
  const { data: notificationsData, isLoading } = useNotifications()
  const { mutate: markAsRead } = useMarkNotificationRead()
  const { mutate: markAllAsRead } = useMarkAllNotificationsRead()

  const notifications = notificationsData || initialNotifications

  const handleNotificationClick = (notif: any) => {
    if (!notif.is_read) markAsRead(notif.id)
    
    if (notif.notification_type.includes('booking') && notif.reference_id) {
      router.push(`/dashboard/user/bookings/${notif.reference_id}`)
    } else if (notif.notification_type.includes('payment')) {
      router.push(`/dashboard/user/payments`)
    }
  }

  const getIcon = (type: string) => {
    if (type.includes('booking')) return <CalendarClock className="h-5 w-5 text-blue-500" />
    if (type.includes('payment')) return <CreditCard className="h-5 w-5 text-green-500" />
    return <Bell className="h-5 w-5 text-gray-500" />
  }

  const unreadCount = notifications.filter((n: any) => !n.is_read).length

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          Inbox {unreadCount > 0 && <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
        </h2>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => markAllAsRead()}
            className="text-primary hover:text-primary/90"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
          <p className="text-gray-500">You don't have any notifications right now.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map((notif: any) => (
            <div 
              key={notif.id} 
              onClick={() => handleNotificationClick(notif)}
              className={`p-6 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
            >
              <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${!notif.is_read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {getIcon(notif.notification_type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold mb-1 ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notif.title}
                </h4>
                <p className={`text-sm mb-2 ${!notif.is_read ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                </p>
              </div>
              {!notif.is_read && (
                <div className="shrink-0 flex items-center">
                  <span className="h-2.5 w-2.5 bg-primary rounded-full"></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
