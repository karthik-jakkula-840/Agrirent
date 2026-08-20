'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const updates = {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      district: formData.get('district') as string,
      state: formData.get('state') as string,
      profile_image: formData.get('avatar_url') as string || undefined,
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('profiles')
      // @ts-ignore
      .update(updates)
      .eq('id', user.id)

    if (error) throw error

    revalidatePath('/dashboard/user/profile')
    revalidatePath('/dashboard/user', 'layout')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}
