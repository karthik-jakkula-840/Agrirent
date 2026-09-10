import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/api-auth'
import { z } from 'zod'

const favoriteSchema = z.object({
  equipment_id: z.string().min(1),
})

export async function GET(req: NextRequest) {
  try {
    const { user, profile, error: authError } = await requireAuth()
    // Return empty array instead of 401 error so guest visitors do not face console errors
    if (authError || !user) {
      return successResponse([])
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        equipment:equipment_id(
          *,
          equipment_images(*),
          profiles:owner_id(full_name, is_verified)
        )
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return successResponse(data || [])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, profile, error: authError } = await requireAuth()
    if (authError || !user) return authError

    const body = await req.json()
    const { equipment_id } = favoriteSchema.parse(body)

    // Handle mock equipment without failing foreign key constraints
    if (equipment_id.startsWith('mock-')) {
      return successResponse(
        {
          id: `mock-fav-${equipment_id}-${user.id}`,
          customer_id: user.id,
          equipment_id,
          created_at: new Date().toISOString()
        },
        201
      )
    }

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
