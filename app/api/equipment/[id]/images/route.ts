import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EquipmentService } from '@/services/equipment.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/api-auth'
import { z } from 'zod'

const uploadSchema = z.object({
  image_url: z.string().url(),
  is_primary: z.boolean().default(false),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const equipmentService = new EquipmentService(supabase)

    // Verify ownership
    const equipment = await equipmentService.getEquipmentById(id)
    if (!equipment) return errorResponse('Equipment not found', 'NOT_FOUND', 404)

    if (equipment.owner_id !== user.id && profile.role !== 'admin') {
      return errorResponse('Forbidden: You do not own this equipment', 'FORBIDDEN', 403)
    }

    // Usually frontend uploads to Supabase storage directly and sends the URL here
    // Let's assume frontend sends the final Supabase storage URL after uploading
    const body = await req.json()
    const validated = uploadSchema.parse(body)

    const newImage = await equipmentService.addEquipmentImageRecord(id, validated.image_url, validated.is_primary)
    
    return successResponse(newImage, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params // this is equipment ID, but we might want image ID here or query params
    const imageId = req.nextUrl.searchParams.get('imageId')
    
    if (!imageId) return errorResponse('imageId query parameter is required', 'BAD_REQUEST', 400)

    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const equipmentService = new EquipmentService(supabase)

    // Verify ownership
    const equipment = await equipmentService.getEquipmentById(id)
    if (!equipment) return errorResponse('Equipment not found', 'NOT_FOUND', 404)

    if (equipment.owner_id !== user.id && profile.role !== 'admin') {
      return errorResponse('Forbidden: You do not own this equipment', 'FORBIDDEN', 403)
    }

    await equipmentService.removeEquipmentImageRecord(imageId)
    
    return successResponse({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
