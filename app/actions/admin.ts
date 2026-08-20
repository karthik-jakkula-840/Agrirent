'use server'

import { createClient } from '@/lib/supabase/server'
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
