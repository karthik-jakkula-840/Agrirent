import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
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
    
    const { category, ...restData } = validatedData
    let finalCategoryId = null

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

    const cleanedData = {
      ...restData,
      hourly_price: restData.hourly_price === '' ? null : restData.hourly_price,
      weekly_price: restData.weekly_price === '' ? null : restData.weekly_price,
      monthly_price: restData.monthly_price === '' ? null : restData.monthly_price,
      horsepower: restData.horsepower === '' ? null : restData.horsepower,
      working_hours: restData.working_hours === '' ? null : restData.working_hours,
      year: restData.year === '' ? null : restData.year,
      latitude: restData.latitude === '' ? null : restData.latitude,
      longitude: restData.longitude === '' ? null : restData.longitude,
    }

    const equipmentData = {
      ...cleanedData,
      category_id: finalCategoryId,
      owner_id: user.id, // Strictly use authenticated user's ID
      status: 'pending', // Set to pending to require admin approval
    }

    const newEquipment = await equipmentService.createEquipment(equipmentData as any)
    
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
