import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/api-auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ equipmentId: string }> }) {
  try {
    const { equipmentId } = await params
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    // Only delete if it belongs to the current user
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('equipment_id', equipmentId)
      .eq('customer_id', user.id)

    if (error) throw error

    return successResponse({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
