import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EquipmentService } from '@/services/equipment.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireRole, requireAuth } from '@/lib/api-auth'
import { equipmentSchema } from '@/lib/validations/equipment'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const equipmentService = new EquipmentService(supabase)

    const equipment = await equipmentService.getEquipmentById(id)

    if (!equipment) {
      return errorResponse('Equipment not found', 'NOT_FOUND', 404)
    }

    return successResponse(equipment)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const equipmentService = new EquipmentService(supabase)

    // Check ownership
    const equipment = await equipmentService.getEquipmentById(id)
    if (!equipment) return errorResponse('Equipment not found', 'NOT_FOUND', 404)

    if (equipment.owner_id !== user.id && profile.role !== 'admin') {
      return errorResponse('Forbidden: You do not own this equipment', 'FORBIDDEN', 403)
    }

    const body = await req.json()
    // Partial parse for updates
    const validatedData = equipmentSchema.partial().parse(body)

    const cleanedData: any = { ...validatedData }
    const nullableFields = [
      'hourly_price',
      'weekly_price',
      'monthly_price',
      'horsepower',
      'working_hours',
      'year',
      'latitude',
      'longitude'
    ]

    nullableFields.forEach(field => {
      if (cleanedData[field] === '') {
        cleanedData[field] = null
      }
    })

    const updatedEquipment = await equipmentService.updateEquipment(id, {
      ...cleanedData,
      status: 'approved',
    })
    
    // Update images in equipment_images table
    const imageUrls = body.imageUrls
    if (imageUrls && Array.isArray(imageUrls)) {
      // Delete existing images first
      await supabase.from('equipment_images').delete().eq('equipment_id', id)
      
      // Re-insert new images
      for (let i = 0; i < imageUrls.length; i++) {
        await equipmentService.addEquipmentImageRecord(id, imageUrls[i], i === 0)
      }
    }
    
    return successResponse(updatedEquipment)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, profile, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const equipmentService = new EquipmentService(supabase)

    // Check ownership
    const equipment = await equipmentService.getEquipmentById(id)
    if (!equipment) return errorResponse('Equipment not found', 'NOT_FOUND', 404)

    if (equipment.owner_id !== user.id && profile.role !== 'admin') {
      return errorResponse('Forbidden: You do not own this equipment', 'FORBIDDEN', 403)
    }

    await equipmentService.deleteEquipment(id)
    
    return successResponse({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
