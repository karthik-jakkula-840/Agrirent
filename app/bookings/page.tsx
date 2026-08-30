import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function BookingsRedirectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/bookings')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as any)?.role || 'customer'

  if (role === 'admin') {
    redirect('/dashboard/admin')
  } else if (role === 'owner' || role === 'rental_owner') {
    redirect('/dashboard/owner/bookings')
  } else {
    redirect('/dashboard/user/bookings')
  }
}
