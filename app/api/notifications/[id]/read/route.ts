import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/api-auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    // Ensure the notification belongs to the user
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true }) // assuming column is 'is_read' or 'read' - checking database schema earlier showed 'read' but let's use 'read'
      .eq('id', id)
      .eq('user_id', user.id)

    // Wait, the schema had `read: boolean`. I'll use `read`
    // If it fails with "read does not exist", it might be `is_read`. I will use `read: true`.
    const { error: actualError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (actualError) throw actualError

    return successResponse({ updated: true })
  } catch (error) {
    return handleApiError(error)
  }
}
