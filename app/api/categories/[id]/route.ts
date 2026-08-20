import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireRole } from '@/lib/api-auth'
import { categorySchema } from '@/lib/validations/category'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error: authError } = await requireRole(['admin'])
    if (authError) return authError

    const body = await req.json()
    const validatedData = categorySchema.partial().parse(body)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return successResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error: authError } = await requireRole(['admin'])
    if (authError) return authError

    const supabase = await createClient()
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error

    return successResponse({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
