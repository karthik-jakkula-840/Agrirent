import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireRole } from '@/lib/api-auth'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error: authError } = await requireRole(['admin'])
    if (authError) return authError

    const body = await req.json()
    const { status } = statusSchema.parse(body)

    const supabase = await createClient()
    
    // Get the request
    const { data: request, error: reqError } = await supabase
      .from('owner_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (reqError || !request) return errorResponse('Owner request not found', 'NOT_FOUND', 404)

    if (request.status !== 'pending') {
      return errorResponse(`Cannot change status of a ${request.status} request`, 'BAD_REQUEST', 400)
    }

    // Update request status
    const { error: updateError } = await supabase
      .from('owner_requests')
      .update({ status })
      .eq('id', id)

    if (updateError) throw updateError

    // If approved, update user's profile role
    if (status === 'approved') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'owner' })
        .eq('id', request.user_id)
        
      if (profileError) throw profileError
    }

    // Notify user
    await supabase.from('notifications').insert({
      user_id: request.user_id,
      title: `Owner Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your request to become an owner has been ${status}.`,
      notification_type: status === 'approved' ? 'owner_request_approved' : 'owner_request_rejected',
      reference_id: id,
    })

    return successResponse({ status })
  } catch (error) {
    return handleApiError(error)
  }
}
