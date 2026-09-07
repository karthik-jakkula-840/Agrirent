import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { NotificationsClient } from '@/app/dashboard/user/notifications/notifications-client'

export const metadata = {
  title: 'Notifications | Owner Portal | AgriRent',
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
        <h1 className="text-[24px] sm:text-[32px] font-black tracking-tight text-gray-950 leading-tight">
          Notifications
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mt-1">
          Stay updated on your booking requests and account activity.
        </p>
      </div>

      <NotificationsClient initialNotifications={notifications || []} />
    </div>
  )
}
