import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayoutClient } from './layout-client'
import { cookies } from 'next/headers'
import { LanguageCode } from '@/lib/translations'

export const metadata = {
  title: 'Owner Dashboard | Agriform',
}

export default async function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const typedProfile = profile as any
  if (typedProfile) {
    typedProfile.avatar_url = typedProfile.profile_image
  }
  if (typedProfile?.role === 'customer') redirect('/dashboard/user')
  if (typedProfile?.role === 'admin') redirect('/dashboard/admin')
  if (typedProfile?.role !== 'owner' && typedProfile?.role !== 'rental_owner') redirect('/')

  // Fetch unread notifications count
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  const cookieStore = await cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as LanguageCode) || 'en'

  return (
    <DashboardLayoutClient profile={profile} unreadCount={unreadCount || 0} locale={locale}>
      {children}
    </DashboardLayoutClient>
  )
}
