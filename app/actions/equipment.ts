'use server'

import { createClient } from '@/lib/supabase/server'
import { equipmentSchema } from '@/lib/validations/equipment'
import { EquipmentService } from '@/services/equipment.service'
import { revalidatePath } from 'next/cache'

export async function createEquipmentAction(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = (profile as any)?.role

    if (role !== 'owner' && role !== 'rental_owner') {
      return { success: false, error: 'Forbidden: Only owners can add equipment' }
    }

    // Parse form data to object
    const rawData = Object.fromEntries(formData.entries())
    
    // Check if the user is passing a category_id vs category slug. We expect category_id.
    const validatedData = equipmentSchema.parse(rawData)

    let finalCategoryId = validatedData.category_id

    if (validatedData.category_id === 'other' && validatedData.custom_category) {
      const slug = validatedData.custom_category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      // Try to find if this custom category slug already exists
      const { data: existingCat } = await supabase.from('categories').select('id').eq('slug', slug).single()
      
      if (existingCat) {
        finalCategoryId = existingCat.id
      } else {
        // Insert new category
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert({ name: validatedData.custom_category, slug, is_active: true })
          .select('id')
          .single()
          
        if (catError) {
          console.error("Failed to insert custom category:", catError)
          return { success: false, error: 'Failed to create custom category' }
        } else if (newCat) {
          finalCategoryId = newCat.id
        }
      }
    }

    const equipmentService = new EquipmentService(supabase)
    
    // Omit custom_category before passing to equipmentRecord
    const { custom_category, category_id, ...restValidated } = validatedData
    
    const equipmentRecord = {
      ...restValidated,
      category_id: finalCategoryId,
      owner_id: user.id,
      status: 'pending', // Requires admin approval
      // Ensure numeric fields are correctly typed
      hourly_price: validatedData.hourly_price === '' ? null : validatedData.hourly_price,
      daily_price: validatedData.daily_price,
      weekly_price: validatedData.weekly_price === '' ? null : validatedData.weekly_price,
      monthly_price: validatedData.monthly_price === '' ? null : validatedData.monthly_price,
      horsepower: validatedData.horsepower === '' ? null : validatedData.horsepower,
      working_hours: validatedData.working_hours === '' ? null : validatedData.working_hours,
      year: validatedData.year === '' ? null : validatedData.year,
      latitude: validatedData.latitude === '' ? null : validatedData.latitude,
      longitude: validatedData.longitude === '' ? null : validatedData.longitude,
    }

    const newEquipment = await equipmentService.createEquipment(equipmentRecord as any)

    // @ts-ignore
    const newEquipmentId = newEquipment.id

    // Handle images if we pass them via formData as base64 or paths (in a real app we'd use a separate upload)
    // We will assume the UI handles the upload separately and sends an array of image URLs via a hidden input `imageUrls`
    const imageUrlsRaw = formData.get('imageUrls')
    if (imageUrlsRaw && typeof imageUrlsRaw === 'string') {
      const urls = JSON.parse(imageUrlsRaw) as string[]
      for (let i = 0; i < urls.length; i++) {
        await equipmentService.addEquipmentImageRecord(newEquipmentId, urls[i], i === 0)
      }
    }

    revalidatePath('/dashboard/owner/equipment')
    revalidatePath('/equipment')
    
    return { success: true, equipmentId: newEquipmentId, error: null }
  } catch (error: any) {
    console.error('Failed to create equipment:', error)
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed: ' + error.errors[0].message }
    }
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

export async function deleteEquipmentAction(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify ownership
    const { data: existing } = await supabase.from('equipment').select('owner_id').eq('id', id).single()
    // @ts-ignore
    if (!existing || existing.owner_id !== user.id) {
      return { success: false, error: 'Forbidden: You do not own this equipment' }
    }

    // Check for active bookings before deletion
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('equipment_id', id)
      .in('booking_status', ['pending', 'accepted', 'confirmed'])

    // @ts-ignore
    if (count && count > 0) {
      return { success: false, error: 'Cannot delete equipment with active bookings' }
    }

    const equipmentService = new EquipmentService(supabase)
    await equipmentService.deleteEquipment(id)

    revalidatePath('/dashboard/owner/equipment')
    revalidatePath('/equipment')
    
    return { success: true, error: null }
  } catch (error: any) {
    console.error('Failed to delete equipment:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

export async function updateAvailabilityAction(id: string, availability: 'available' | 'booked' | 'maintenance' | 'unavailable') {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Verify ownership
    const { data: existing } = await supabase.from('equipment').select('owner_id').eq('id', id).single()
    // @ts-ignore
    if (!existing || existing.owner_id !== user.id) return { success: false, error: 'Forbidden' }

    const equipmentService = new EquipmentService(supabase)
    await equipmentService.updateAvailability(id, availability)

    revalidatePath('/dashboard/owner/equipment')
    revalidatePath(`/equipment/${id}`)
    
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateEquipmentAction(id: string, prevState: any, formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify ownership
    const { data: existing } = await supabase.from('equipment').select('owner_id').eq('id', id).single()
    // @ts-ignore
    if (!existing || existing.owner_id !== user.id) {
      return { success: false, error: 'Forbidden: You do not own this equipment' }
    }

    // Parse form data to object
    const rawData = Object.fromEntries(formData.entries())
    
    const validatedData = equipmentSchema.parse(rawData)
    const equipmentService = new EquipmentService(supabase)
    
    let finalCategoryId = validatedData.category_id

    if (validatedData.category_id === 'other' && validatedData.custom_category) {
      const slug = validatedData.custom_category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const { data: existingCat } = await supabase.from('categories').select('id').eq('slug', slug).single()
      
      if (existingCat) {
        finalCategoryId = existingCat.id
      } else {
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert({ name: validatedData.custom_category, slug, is_active: true })
          .select('id')
          .single()
          
        if (catError) return { success: false, error: 'Failed to create custom category' }
        if (newCat) finalCategoryId = newCat.id
      }
    }
    
    const { custom_category, category_id, ...restValidated } = validatedData
    
    const equipmentRecord = {
      ...restValidated,
      category_id: finalCategoryId,
      status: 'pending', // Reset to pending after update
      hourly_price: validatedData.hourly_price === '' ? null : validatedData.hourly_price,
      daily_price: validatedData.daily_price,
      weekly_price: validatedData.weekly_price === '' ? null : validatedData.weekly_price,
      monthly_price: validatedData.monthly_price === '' ? null : validatedData.monthly_price,
      horsepower: validatedData.horsepower === '' ? null : validatedData.horsepower,
      working_hours: validatedData.working_hours === '' ? null : validatedData.working_hours,
      year: validatedData.year === '' ? null : validatedData.year,
      latitude: validatedData.latitude === '' ? null : validatedData.latitude,
      longitude: validatedData.longitude === '' ? null : validatedData.longitude,
    }

    await equipmentService.updateEquipment(id, equipmentRecord as any)

    // Handle images
    const imageUrlsRaw = formData.get('imageUrls')
    if (imageUrlsRaw && typeof imageUrlsRaw === 'string') {
      const urls = JSON.parse(imageUrlsRaw) as string[]
      
      // Delete existing images 
      await supabase.from('equipment_images').delete().eq('equipment_id', id)
      
      // Re-insert new images
      for (let i = 0; i < urls.length; i++) {
        await equipmentService.addEquipmentImageRecord(id, urls[i], i === 0)
      }
    }

    revalidatePath('/dashboard/owner/equipment')
    revalidatePath(`/dashboard/owner/equipment/${id}`)
    revalidatePath(`/equipment/${id}`)
    
    return { success: true, equipmentId: id, error: null }
  } catch (error: any) {
    console.error('Failed to update equipment:', error)
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed: ' + error.errors[0].message }
    }
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}
