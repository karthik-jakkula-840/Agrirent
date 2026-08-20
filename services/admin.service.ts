import { SupabaseClient } from '@supabase/supabase-js'

export class AdminService {
  constructor(private supabase: SupabaseClient) {}

  async getDashboardStats() {
    // Note: In a production app with millions of rows, you would use a materialized view
    // or RPC function for these counts. For now, doing simple exact counts.
    
    // 1. Total Users (all profiles)
    const { count: totalUsers } = await this.supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // 2. Customers
    const { count: totalCustomers } = await this.supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')

    // 3. Owners
    const { count: totalOwners } = await this.supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'owner')

    // 4. Equipment
    const { count: totalEquipment } = await this.supabase
      .from('equipment')
      .select('*', { count: 'exact', head: true })
      
    // 5. Pending Equipment
    const { count: pendingEquipment } = await this.supabase
      .from('equipment')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // 6. Bookings
    const { count: totalBookings } = await this.supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })

    // 7. Revenue (sum of all completed payment transactions)
    // Note: We use Postgres RPC or simply sum it up locally since we lack a pre-built RPC in this schema context.
    const { data: transactions } = await this.supabase
      .from('transactions')
      .select('amount, transaction_type')
      
    let totalRevenue = 0
    let totalPlatformFee = 0 // Assuming 10% platform fee logic could be inferred here
    
    transactions?.forEach((tx: any) => {
      if (tx.transaction_type === 'payment') {
        const amount = Number(tx.amount)
        totalRevenue += amount
        totalPlatformFee += (amount * 0.1) // 10% mock platform fee calculation
      }
    })

    // 8. Reviews
    const { count: totalReviews } = await this.supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })

    // 9. Categories
    const { count: totalCategories } = await this.supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    return {
      totalUsers: totalUsers || 0,
      totalCustomers: totalCustomers || 0,
      totalOwners: totalOwners || 0,
      totalEquipment: totalEquipment || 0,
      pendingEquipment: pendingEquipment || 0,
      totalBookings: totalBookings || 0,
      totalRevenue: totalRevenue || 0,
      platformRevenue: totalPlatformFee || 0,
      totalReviews: totalReviews || 0,
      totalCategories: totalCategories || 0,
    }
  }

  async getOwnerRequests() {
    const { data, error } = await this.supabase
      .from('owner_requests')
      .select('*, user:user_id(full_name, email, phone)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async updateOwnerRequestStatus(requestId: string, status: 'approved' | 'rejected', adminId: string, notes?: string) {
    const { error } = await this.supabase
      .from('owner_requests')
      .update({
        status,
        admin_notes: notes,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (error) throw error

    // If approved, update the user profile to 'owner'
    if (status === 'approved') {
      const { data: request } = await this.supabase.from('owner_requests').select('user_id').eq('id', requestId).single()
      if (request) {
        await this.supabase.from('profiles').update({ role: 'owner' }).eq('id', request.user_id)
      }
    }

    return true
  }

  async getAllTransactions() {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*, user:user_id(full_name, email), booking:booking_id(booking_number, equipment:equipment_id(title))')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getAllActivityLogs() {
    const { data, error } = await this.supabase
      .from('activity_logs')
      .select('*, user:user_id(full_name, email, role)')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) throw error
    return data
  }

  async getAllCategories() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  async getAllReviews() {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*, customer:customer_id(full_name), equipment:equipment_id(title)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}
