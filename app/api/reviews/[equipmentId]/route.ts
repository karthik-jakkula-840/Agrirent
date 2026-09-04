import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ equipmentId: string }> }) {
  try {
    const { equipmentId } = await params
    
    // If equipmentId is not a valid UUID (e.g. mock equipment), return empty reviews array
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(equipmentId)
    if (!isUuid) {
      return successResponse([])
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:customer_id(full_name, avatar_url:profile_image)
      `)
      .eq('equipment_id', equipmentId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return successResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}
