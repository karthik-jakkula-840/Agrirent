import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export class NotificationService {
  constructor(private supabase: SupabaseClient) {}

  async getUserNotifications(userId: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async markAsRead(notificationId: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      // @ts-ignore: Placeholder types cause update payload to be evaluated as never
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
