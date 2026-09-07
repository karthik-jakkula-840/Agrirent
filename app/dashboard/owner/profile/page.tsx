import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { ProfileForm } from '@/app/dashboard/user/profile/profile-form'

export const metadata = {
  title: 'Profile Settings | Owner Portal | AgriRent',
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
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-[24px] sm:text-[32px] font-black tracking-tight text-gray-950 leading-tight">
          Owner Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mt-1">
          Manage your personal information and contact details.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <ProfileForm initialProfile={profile} />
      </div>
    </div>
  )
}
