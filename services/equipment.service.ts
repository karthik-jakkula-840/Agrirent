import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export interface EquipmentFilters {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  district?: string
  status?: 'pending' | 'approved' | 'rejected' | 'maintenance'
}

export interface PaginationOptions {
  page: number
  pageSize: number
}

export class EquipmentService {
  constructor(private supabase: SupabaseClient) {}

  async getEquipmentById(id: string) {
    const { data, error } = await this.supabase
      .from('equipment')
      .select('*, equipment_images(*), profiles!equipment_owner_id_fkey(full_name, role, phone, profile_image), categories!equipment_category_id_fkey(name, slug)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async listEquipment(filters: EquipmentFilters, pagination: PaginationOptions, sort?: string) {
    let query = this.supabase
      .from('equipment')
      .select('*, equipment_images(*), categories!inner(name), profiles!inner(full_name)', { count: 'exact' })

    // Apply filters
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.category) query = query.eq('category_id', filters.category)
    if (filters.minPrice !== undefined) query = query.gte('daily_price', filters.minPrice)
    if (filters.maxPrice !== undefined) query = query.lte('daily_price', filters.maxPrice)
    if (filters.district) query = query.ilike('district', `%${filters.district}%`)
    if (filters.search) query = query.ilike('title', `%${filters.search}%`)

    // Apply sorting
    if (sort === 'price_asc') query = query.order('daily_price', { ascending: true })
    else if (sort === 'price_desc') query = query.order('daily_price', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    // Apply pagination
    const from = (pagination.page - 1) * pagination.pageSize
    const to = from + pagination.pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query
    if (error) throw error
    
    return {
      items: data,
      total: count || 0,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil((count || 0) / pagination.pageSize)
    }
  }

  async getOwnerEquipment(ownerId: string) {
    const { data, error } = await this.supabase
      .from('equipment')
      .select('*, equipment_images(*), categories(name)')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async createEquipment(equipmentData: any) {
    // @ts-ignore Placeholder type mismatch
    const { data, error } = await this.supabase
      .from('equipment')
      // @ts-ignore
      .insert([equipmentData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateEquipment(id: string, updates: any) {
    // @ts-ignore Placeholder type mismatch
    const { data, error } = await this.supabase
      .from('equipment')
      // @ts-ignore
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteEquipment(id: string) {
    // Delete from DB (images in bucket should ideally be cleaned up via trigger or here)
    const { error } = await this.supabase
      .from('equipment')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  async updateAvailability(id: string, availability: 'available' | 'booked' | 'maintenance' | 'unavailable') {
    const { data, error } = await this.supabase
      .from('equipment')
      // @ts-ignore Placeholder type mismatch
      .update({ availability })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // --- IMAGES ---

  async addEquipmentImageRecord(equipmentId: string, imageUrl: string, isPrimary: boolean = false) {
    const { data, error } = await this.supabase
      .from('equipment_images')
      // @ts-ignore Placeholder type mismatch
      .insert([{ equipment_id: equipmentId, image_url: imageUrl, is_primary: isPrimary }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async removeEquipmentImageRecord(imageId: string) {
    const { error } = await this.supabase
      .from('equipment_images')
      .delete()
      .eq('id', imageId)

    if (error) throw error
    return true
  }
}
