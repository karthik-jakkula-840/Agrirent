'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireRole, getCurrentUser } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { revalidatePath } from 'next/cache'

export async function updateOwnerRequestAction(requestId: string, status: 'approved' | 'rejected', notes?: string) {
  try {
    await requireRole('admin')
    const admin = await getCurrentUser()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()
    const adminService = new AdminService(supabase)

    await adminService.updateOwnerRequestStatus(requestId, status, admin.id, notes)

    revalidatePath('/dashboard/admin/owners')
    
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update owner request:', error)
    return { success: false, error: error.message || 'Failed to update owner request status' }
  }
}

export async function updateUserAction(
  userId: string,
  data: {
    fullName: string
    email: string
    phone: string
    role: 'customer' | 'owner' | 'admin'
  }
) {
  try {
    await requireRole('admin')
    const adminSupabase = createAdminClient()

    // 1. Update public.profiles
    const { error: profileError } = await (adminSupabase.from('profiles') as any)
      .update({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        role: data.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Failed to update profile:', profileError)
      return { success: false, error: profileError.message }
    }

    // 2. Update auth.users via admin client
    try {
      await adminSupabase.auth.admin.updateUserById(userId, {
        email: data.email,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName,
          phone: data.phone,
          role: data.role
        }
      })
    } catch (authErr: any) {
      console.warn('Could not update auth.users metadata, profile was updated:', authErr?.message)
    }

    revalidatePath('/dashboard/admin/users')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating user:', error)
    return { success: false, error: error.message || 'Failed to update user' }
  }
}
