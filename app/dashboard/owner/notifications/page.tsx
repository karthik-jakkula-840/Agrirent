import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { NotificationsClient } from '@/app/dashboard/user/notifications/notifications-client'

export const metadata = {
  title: 'Notifications | Owner Portal | Agriform',
}

export default async function OwnerNotificationsPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1">Stay updated on your booking requests and account activity.</p>
      </div>

      <NotificationsClient initialNotifications={notifications || []} />
    </div>
  )
}
