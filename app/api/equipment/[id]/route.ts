import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
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

    const { category, ...restData } = cleanedData
    let finalCategoryId = equipment.category_id

    if (category) {
      const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const { data: existingCat } = await supabase.from('categories').select('id').eq('slug', slug).single()
      
      if (existingCat) {
        finalCategoryId = existingCat.id
      } else {
        const adminSupabase = createAdminClient()
        const { data: newCat, error: catError } = await adminSupabase
          .from('categories')
          .insert({ name: category, slug, is_active: true } as any)
          .select('id')
          .single()
          
        if (!catError && newCat) {
          finalCategoryId = (newCat as any).id
        } else {
          console.error("Failed to create category:", catError)
          return errorResponse('Failed to create category', 'BAD_REQUEST', 400)
        }
      }
    }

    const updatedEquipment = await equipmentService.updateEquipment(id, {
      ...restData,
      category_id: finalCategoryId,
      status: 'pending', // Reset to pending after update to require admin approval
    } as any)
    
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
