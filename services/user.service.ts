import { SupabaseClient } from '@supabase/supabase-js'

export class UserService {
  constructor(private supabase: SupabaseClient) {}

  async getCustomerDashboardStats(customerId: string) {
    // 1. Active Rentals
    const { count: activeRentals } = await this.supabase
      .from('rentals')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('status', 'active')

    // 2. Completed Rentals
    const { count: completedRentals } = await this.supabase
      .from('rentals')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('status', 'completed')

    // 3. Pending Bookings
    const { count: pendingBookings } = await this.supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('booking_status', 'pending')

    // 4. Cancelled Bookings
    const { count: cancelledBookings } = await this.supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('booking_status', 'cancelled')

    return {
      activeRentals: activeRentals || 0,
      completedRentals: completedRentals || 0,
      pendingBookings: pendingBookings || 0,
      cancelledBookings: cancelledBookings || 0
    }
  }

  async getRecentBookings(customerId: string, limit = 5) {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        equipment:equipment_id(title, equipment_images(image_url, is_primary))
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  async getActiveRentals(customerId: string) {
    const { data, error } = await this.supabase
      .from('rentals')
      .select(`
        *,
        rental_items(
          price,
          start_date,
          end_date,
          equipment:equipment_id(title, profiles(full_name))
        )
      `)
      .eq('customer_id', customerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}
