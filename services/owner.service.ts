import { SupabaseClient } from '@supabase/supabase-js'

export class OwnerService {
  constructor(private supabase: SupabaseClient) {}

  async getDashboardStats(ownerId: string) {
    // 1. Total Equipment
    const { count: totalEquipment } = await this.supabase
      .from('equipment')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)

    // 2. Available Equipment
    const { count: availableEquipment } = await this.supabase
      .from('equipment')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
      .eq('availability', 'available')

    // 3. Active Bookings & Pending Requests
    const { data: bookings, error: bookingsError } = await this.supabase
      .from('bookings')
      .select('booking_status, total_amount')
      .eq('owner_id', ownerId)

    if (bookingsError) throw bookingsError

    let activeBookings = 0
    let pendingRequests = 0
    let completedRentals = 0

    bookings?.forEach((b: any) => {
      if (b.booking_status === 'accepted' || b.booking_status === 'confirmed') activeBookings++
      if (b.booking_status === 'pending') pendingRequests++
      if (b.booking_status === 'completed') completedRentals++
    })

    // 4. Total Revenue
    // Calculate total revenue from completed/confirmed bookings
    let totalRevenue = 0
    bookings?.forEach((b: any) => {
      if (b.booking_status === 'completed' || b.booking_status === 'confirmed') {
        totalRevenue += Number(b.total_amount)
      }
    })

    return {
      totalEquipment: totalEquipment || 0,
      availableEquipment: availableEquipment || 0,
      activeBookings,
      pendingRequests,
      completedRentals,
      totalRevenue
    }
  }

  async getRevenueAnalytics(ownerId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: bookings, error } = await this.supabase
      .from('bookings')
      .select('total_amount, created_at')
      .eq('owner_id', ownerId)
      .in('booking_status', ['completed', 'confirmed', 'accepted'])
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Group by day
    const dailyData: Record<string, number> = {}
    
    // Initialize days
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      dailyData[d.toISOString().split('T')[0]] = 0
    }

    bookings?.forEach((b: any) => {
      const dateKey = b.created_at.split('T')[0]
      if (dailyData[dateKey] !== undefined) {
        dailyData[dateKey] += Number(b.total_amount)
      }
    })

    return Object.entries(dailyData).map(([date, revenue]) => ({
      date,
      revenue
    }))
  }

  async getRecentBookingRequests(ownerId: string, limit: number = 5) {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        equipment:equipment_id(title, daily_price, equipment_images(image_url)),
        customer:customer_id(full_name, avatar_url:profile_image)
      `)
      .eq('owner_id', ownerId)
      .eq('booking_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  async getTopEquipment(ownerId: string, limit: number = 5) {
    const { data: equipmentList, error: eqError } = await this.supabase
      .from('equipment')
      .select('id, title, daily_price, status, equipment_images(image_url)')
      .eq('owner_id', ownerId)

    if (eqError) throw eqError

    const { data: bookings, error: bkError } = await this.supabase
      .from('bookings')
      .select('equipment_id, total_amount, booking_status')
      .eq('owner_id', ownerId)
      .in('booking_status', ['completed', 'confirmed', 'accepted'])

    if (bkError) throw bkError

    const stats: Record<string, { revenue: number; bookings: number }> = {}
    
    bookings?.forEach((b: any) => {
      if (!stats[b.equipment_id]) stats[b.equipment_id] = { revenue: 0, bookings: 0 }
      stats[b.equipment_id].bookings++
      stats[b.equipment_id].revenue += Number(b.total_amount)
    })

    const result = equipmentList?.map((eq: any) => ({
      id: eq.id,
      title: eq.title,
      price: eq.daily_price,
      image: eq.equipment_images?.[0]?.image_url || null,
      bookings: stats[eq.id]?.bookings || 0,
      revenue: stats[eq.id]?.revenue || 0,
    })).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, limit)

    return result || []
  }

  async getActiveBookings(ownerId: string) {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('id, start_time, end_time, equipment_id, booking_status')
      .eq('owner_id', ownerId)
      .in('booking_status', ['accepted', 'confirmed'])

    if (error) throw error
    return data || []
  }
}
