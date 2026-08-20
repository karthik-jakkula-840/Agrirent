import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { ProfileForm } from '@/app/dashboard/user/profile/profile-form'

export const metadata = {
  title: 'Profile Settings | Owner Portal | Agriform',
}

export default async function OwnerProfilePage() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Owner Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and contact details.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <ProfileForm initialProfile={profile} />
      </div>
    </div>
  )
}
