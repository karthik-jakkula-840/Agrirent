import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EquipmentService, EquipmentFilters, PaginationOptions } from '@/services/equipment.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { requireRole } from '@/lib/api-auth'
import { equipmentSchema } from '@/lib/validations/equipment'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const supabase = await createClient()
    const equipmentService = new EquipmentService(supabase)

    // Parse filters
    const filters: EquipmentFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      district: searchParams.get('district') || undefined,
      status: (searchParams.get('status') as any) || 'approved', // Public API defaults to approved
    }

    if (searchParams.get('minPrice')) filters.minPrice = Number(searchParams.get('minPrice'))
    if (searchParams.get('maxPrice')) filters.maxPrice = Number(searchParams.get('maxPrice'))

    // Parse Pagination
    const pagination: PaginationOptions = {
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 12,
    }

    // Parse sort
    const sort = searchParams.get('sort') || undefined

    const result = await equipmentService.listEquipment(filters, pagination, sort)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await requireRole(['owner', 'rental_owner', 'admin'])
    if (authError) return authError

    const body = await req.json()
    const validatedData = equipmentSchema.parse(body)

    const supabase = await createClient()
    const equipmentService = new EquipmentService(supabase)
    
    const cleanedData = {
      ...validatedData,
      hourly_price: validatedData.hourly_price === '' ? null : validatedData.hourly_price,
      weekly_price: validatedData.weekly_price === '' ? null : validatedData.weekly_price,
      monthly_price: validatedData.monthly_price === '' ? null : validatedData.monthly_price,
      horsepower: validatedData.horsepower === '' ? null : validatedData.horsepower,
      working_hours: validatedData.working_hours === '' ? null : validatedData.working_hours,
      year: validatedData.year === '' ? null : validatedData.year,
      latitude: validatedData.latitude === '' ? null : validatedData.latitude,
      longitude: validatedData.longitude === '' ? null : validatedData.longitude,
    }

    const equipmentData = {
      ...cleanedData,
      owner_id: user.id, // Strictly use authenticated user's ID
      status: 'approved',
    }

    const newEquipment = await equipmentService.createEquipment(equipmentData)
    
    // Save images to equipment_images table
    const imageUrls = body.imageUrls
    if (imageUrls && Array.isArray(imageUrls)) {
      for (let i = 0; i < imageUrls.length; i++) {
        await equipmentService.addEquipmentImageRecord(newEquipment.id, imageUrls[i], i === 0)
      }
    }
    
    return successResponse(newEquipment, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
