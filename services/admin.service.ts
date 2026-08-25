import { SupabaseClient } from '@supabase/supabase-js'

export class AdminService {
  constructor(private supabase: SupabaseClient) {}

  async getDashboardStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startOfToday = today.toISOString()

    const [
      { count: totalUsers },
      { count: yesterdayUsers },
      { count: totalCustomers },
      { count: yesterdayCustomers },
      { count: totalOwners },
      { count: yesterdayOwners },
      { count: totalEquipment },
      { count: yesterdayEquipment },
      { count: pendingEquipment },
      { count: yesterdayPendingEquipment },
      { count: totalBookings },
      { count: yesterdayBookings },
      { data: transactions },
      { data: yesterdayTransactions },
      { count: totalReviews },
      { count: yesterdayReviews },
      { count: totalCategories },
      { count: yesterdayCategories },
    ] = await Promise.all([
      this.supabase.from('profiles').select('*', { count: 'exact', head: true }),
      this.supabase.from('profiles').select('*', { count: 'exact', head: true }).lt('created_at', startOfToday),

      this.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      this.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer').lt('created_at', startOfToday),

      this.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'owner'),
      this.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'owner').lt('created_at', startOfToday),

      this.supabase.from('equipment').select('*', { count: 'exact', head: true }),
      this.supabase.from('equipment').select('*', { count: 'exact', head: true }).lt('created_at', startOfToday),

      this.supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      this.supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'pending').lt('created_at', startOfToday),

      this.supabase.from('bookings').select('*', { count: 'exact', head: true }),
      this.supabase.from('bookings').select('*', { count: 'exact', head: true }).lt('created_at', startOfToday),

      this.supabase.from('transactions').select('amount, transaction_type'),
      this.supabase.from('transactions').select('amount, transaction_type').lt('created_at', startOfToday),

      this.supabase.from('reviews').select('*', { count: 'exact', head: true }),
      this.supabase.from('reviews').select('*', { count: 'exact', head: true }).lt('created_at', startOfToday),

      this.supabase.from('categories').select('*', { count: 'exact', head: true }),
      this.supabase.from('categories').select('*', { count: 'exact', head: true }).lt('created_at', startOfToday),
    ])

    let totalRevenue = 0
    let totalPlatformFee = 0 
    transactions?.forEach((tx: any) => {
      if (tx.transaction_type === 'payment') {
        const amount = Number(tx.amount)
        totalRevenue += amount
        totalPlatformFee += (amount * 0.1) 
      }
    })

    let yesterdayTotalRevenue = 0
    let yesterdayPlatformFee = 0 
    yesterdayTransactions?.forEach((tx: any) => {
      if (tx.transaction_type === 'payment') {
        const amount = Number(tx.amount)
        yesterdayTotalRevenue += amount
        yesterdayPlatformFee += (amount * 0.1) 
      }
    })

    return {
      totalUsers: totalUsers || 0,
      yesterdayUsers: yesterdayUsers || 0,
      totalCustomers: totalCustomers || 0,
      yesterdayCustomers: yesterdayCustomers || 0,
      totalOwners: totalOwners || 0,
      yesterdayOwners: yesterdayOwners || 0,
      totalEquipment: totalEquipment || 0,
      yesterdayEquipment: yesterdayEquipment || 0,
      pendingEquipment: pendingEquipment || 0,
      yesterdayPendingEquipment: yesterdayPendingEquipment || 0,
      totalBookings: totalBookings || 0,
      yesterdayBookings: yesterdayBookings || 0,
      totalRevenue: totalRevenue || 0,
      yesterdayRevenue: yesterdayTotalRevenue || 0,
      platformRevenue: totalPlatformFee || 0,
      yesterdayPlatformRevenue: yesterdayPlatformFee || 0,
      totalReviews: totalReviews || 0,
      yesterdayReviews: yesterdayReviews || 0,
      totalCategories: totalCategories || 0,
      yesterdayCategories: yesterdayCategories || 0,
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
