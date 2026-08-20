import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/api-auth'
import { z } from 'zod'

const favoriteSchema = z.object({
  equipment_id: z.string().uuid(),
})

export async function GET(req: NextRequest) {
  try {
    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        equipment:equipment_id(*, equipment_images(*))
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return successResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    const body = await req.json()
    const { equipment_id } = favoriteSchema.parse(body)

    const supabase = await createClient()

    // Prevent duplicate favorites (handle unique constraint violation)
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ customer_id: user.id, equipment_id }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return errorResponse('Equipment is already in favorites.', 'CONFLICT', 409)
      }
      throw error
    }

    return successResponse(data, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
