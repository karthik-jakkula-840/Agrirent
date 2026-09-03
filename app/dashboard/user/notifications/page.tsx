import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { NotificationsClient } from './notifications-client'

export default async function NotificationsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1">Stay updated on your bookings and account activity.</p>
      </div>

      <NotificationsClient initialNotifications={notifications || []} />
    </div>
  )
}
