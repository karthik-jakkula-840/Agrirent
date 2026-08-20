import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { ownerRequestSchema } from '@/lib/validations/owner-request'

export async function GET(req: NextRequest) {
  try {
    const { error: authError } = await requireRole(['admin'])
    if (authError) return authError

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('owner_requests')
      .select('*, profiles(full_name, email)')
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

    if (profile.role === 'owner' || profile.role === 'rental_owner') {
      return errorResponse('You are already an owner.', 'BAD_REQUEST', 400)
    }

    const body = await req.json()
    const validatedData = ownerRequestSchema.parse(body)

    const supabase = await createClient()

    // Create owner request
    const { data, error } = await supabase
      .from('owner_requests')
      .insert([
        {
          user_id: user.id,
          ...validatedData,
          status: 'pending',
        }
      ])
      .select()
      .single()

    if (error) throw error

    return successResponse(data, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
