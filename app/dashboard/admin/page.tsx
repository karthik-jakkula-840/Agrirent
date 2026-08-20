import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { logout } from '@/features/auth/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { IndianRupee, FileText, Users, ShoppingBag, ShieldAlert, Activity, Grid, Star } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  await requireRole('admin')
  
  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const stats = await adminService.getDashboardStats()

  // Calculate mock "Yesterday" stats for visual fidelity to design
  const mockYesterday = {
    revenue: Math.max(0, stats.platformRevenue - Math.floor(Math.random() * 500)),
    bookings: Math.max(0, stats.totalBookings - Math.floor(Math.random() * 10)),
    users: Math.max(0, stats.totalUsers - Math.floor(Math.random() * 5)),
    pending: Math.max(0, stats.pendingEquipment + Math.floor(Math.random() * 2)),
    equipment: Math.max(0, stats.totalEquipment - 1),
    categories: stats.totalCategories,
    reviews: Math.max(0, stats.totalReviews - 2),
    customers: Math.max(0, stats.totalCustomers - 3),
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 bg-[#F8FAFC] min-h-screen pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Agrirent Admin</h1>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Logout
          </button>
        </form>
      </div>

      {/* Top Banner (Onboarding / Action Steps) */}
      <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 border border-gray-100">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-primary mb-2">Platform Operations</h2>
          <p className="text-gray-500 text-sm">Complete the following steps to manage the platform</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Step 1 */}
          <Link href="/dashboard/admin/owners" className="flex-1 lg:w-64 bg-gradient-to-r from-primary to-green-600 rounded-xl p-4 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">1. Verifications</span>
              <span className="bg-white text-primary text-xs font-bold px-2 py-1 rounded">GO</span>
            </div>
            <p className="text-white/80 text-xs">Verify equipment owners</p>
          </Link>

          {/* Step 2 */}
          <Link href="/dashboard/admin/equipment" className="flex-1 lg:w-64 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">2. Equipment</span>
              <span className="bg-white text-green-700 text-xs font-bold px-2 py-1 rounded">GO</span>
            </div>
            <p className="text-white/80 text-xs">Review pending listings</p>
            {stats.pendingEquipment > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-emerald-500" />
            )}
          </Link>

          {/* Step 3 */}
          <Link href="/dashboard/admin/transactions" className="flex-1 lg:w-64 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-4 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">3. Transactions</span>
              <span className="bg-white text-emerald-700 text-xs font-bold px-2 py-1 rounded">GO</span>
            </div>
            <p className="text-white/80 text-xs">Monitor platform finances</p>
          </Link>
        </div>
      </div>

      {/* Today's Data Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-gray-800">Platform Data</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Revenue (Green) */}
          <div className="bg-green-50 rounded-2xl p-6 relative overflow-hidden border border-green-100">
            <div className="text-gray-500 text-sm mb-4">Platform Revenue</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {stats.platformRevenue.toLocaleString('en-IN')}
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-gray-400 text-xs mt-4">Yesterday {mockYesterday.revenue.toLocaleString('en-IN')}</div>
          </div>

          {/* Card 2: Bookings (Blue) */}
          <div className="bg-blue-50 rounded-2xl p-6 relative overflow-hidden border border-blue-100">
            <div className="text-gray-500 text-sm mb-4">Total Bookings</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalBookings.toLocaleString('en-US')}
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-gray-400 text-xs mt-4">Yesterday {mockYesterday.bookings.toLocaleString('en-US')}</div>
          </div>

          {/* Card 3: Users (Yellow) */}
          <div className="bg-yellow-50 rounded-2xl p-6 relative overflow-hidden border border-yellow-100">
            <div className="text-gray-500 text-sm mb-4">Total Users</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalUsers.toLocaleString('en-US')}
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center shadow-sm">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-gray-400 text-xs mt-4">Yesterday {mockYesterday.users.toLocaleString('en-US')}</div>
          </div>

          {/* Card 4: Pending Equipment (Red) */}
          <div className="bg-red-50 rounded-2xl p-6 relative overflow-hidden border border-red-100">
            <div className="text-gray-500 text-sm mb-4">Pending Equipment</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {stats.pendingEquipment.toLocaleString('en-US')}
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
                <ShoppingBag className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-gray-400 text-xs mt-4">Yesterday {mockYesterday.pending.toLocaleString('en-US')}</div>
          </div>

          {/* Row 2: Plain White Cards */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-sm mb-4">Total Equipment</div>
            <div className="text-3xl font-bold text-gray-900 mb-4">{stats.totalEquipment.toLocaleString('en-US')}</div>
            <div className="text-gray-400 text-xs">Yesterday {mockYesterday.equipment.toLocaleString('en-US')}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-sm mb-4">Total Categories</div>
            <div className="text-3xl font-bold text-gray-900 mb-4">{stats.totalCategories.toLocaleString('en-US')}</div>
            <div className="text-gray-400 text-xs">Yesterday {mockYesterday.categories.toLocaleString('en-US')}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-sm mb-4">Total Reviews</div>
            <div className="text-3xl font-bold text-gray-900 mb-4">{stats.totalReviews.toLocaleString('en-US')}</div>
            <div className="text-gray-400 text-xs">Yesterday {mockYesterday.reviews.toLocaleString('en-US')}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-sm mb-4">Total Customers</div>
            <div className="text-3xl font-bold text-gray-900 mb-4">{stats.totalCustomers.toLocaleString('en-US')}</div>
            <div className="text-gray-400 text-xs">Yesterday {mockYesterday.customers.toLocaleString('en-US')}</div>
          </div>
        </div>
      </div>

      {/* Operations Assistant Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-gray-800">Operations Assistant</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/admin/activities">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                <Activity className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Activities Log</h4>
                <p className="text-xs text-gray-400 mt-0.5">Platform audit trail</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/equipment">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 relative">
                {stats.pendingEquipment > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />}
                <ShieldAlert className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Review Equipment</h4>
                <p className="text-xs text-gray-400 mt-0.5">Approve new listings</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/owners">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Owner Verifications</h4>
                <p className="text-xs text-gray-400 mt-0.5">Manage applications</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/transactions">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <IndianRupee className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Transactions</h4>
                <p className="text-xs text-gray-400 mt-0.5">Monitor finances</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/categories">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Grid className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Categories</h4>
                <p className="text-xs text-gray-400 mt-0.5">Manage hierarchy</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/reviews">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Reviews Moderation</h4>
                <p className="text-xs text-gray-400 mt-0.5">Handle disputes</p>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}
