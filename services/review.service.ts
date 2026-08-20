import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export class ReviewService {
  constructor(private supabase: SupabaseClient) {}

  async getEquipmentReviews(equipmentId: string) {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url:profile_image)')
      .eq('equipment_id', equipmentId)

    if (error) throw error
    return data
  }
}
