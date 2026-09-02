import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { logout } from '@/features/auth/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { IndianRupee, FileText, Users, ShoppingBag, ShieldAlert, Activity, Grid, Star, LogOut } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  await requireRole('admin')
  
  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const stats = await adminService.getDashboardStats()

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 bg-[#F8FAFC] min-h-screen pb-12 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pt-4 sm:pt-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Agrirent Admin</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Control panel & platform management</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </form>
      </div>

      {/* Top Banner (Onboarding / Action Steps) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 border border-gray-100">
        <div className="flex-1 w-full text-center lg:text-left">
          <h2 className="text-2xl font-bold text-primary mb-2">Platform Operations</h2>
          <p className="text-gray-500 text-sm">Complete the following steps to manage the platform</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Step 1 */}
          <Link href="/dashboard/admin/owners" className="block flex-1 lg:w-64 bg-gradient-to-r from-primary to-green-600 rounded-xl p-4 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">1. Verifications</span>
              <span className="bg-white text-primary text-xs font-bold px-2 py-1 rounded">GO</span>
            </div>
            <p className="text-white/80 text-xs">Verify equipment owners</p>
            {stats.pendingOwnerRequests > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-emerald-500" />
            )}
          </Link>

          {/* Step 2 */}
          <Link href="/dashboard/admin/equipment" className="block flex-1 lg:w-64 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow relative overflow-hidden">
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
          <Link href="/dashboard/admin/transactions" className="block flex-1 lg:w-64 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-4 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow">
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Platform Data</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Revenue (Green) */}
          <Link href="/dashboard/admin/transactions" className="block hover:-translate-y-1 transition-transform h-full">
            <div className="bg-green-50 rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-green-100 shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer">
              <div className="text-gray-500 text-sm mb-4">Platform Revenue</div>
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.platformRevenue.toLocaleString('en-IN')}
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
                  <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-4">Yesterday {stats.yesterdayPlatformRevenue.toLocaleString('en-IN')}</div>
            </div>
          </Link>

          {/* Card 2: Bookings (Blue) */}
          <Link href="/dashboard/admin/transactions" className="block hover:-translate-y-1 transition-transform h-full">
            <div className="bg-blue-50 rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer">
              <div className="text-gray-500 text-sm mb-4">Total Bookings</div>
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.totalBookings.toLocaleString('en-US')}
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-4">Yesterday {stats.yesterdayBookings.toLocaleString('en-US')}</div>
            </div>
          </Link>

          {/* Card 3: Users (Yellow) */}
          <Link href="/dashboard/admin/users" className="block hover:-translate-y-1 transition-transform h-full">
            <div className="bg-yellow-50 rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-yellow-100 shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer">
              <div className="text-gray-500 text-sm mb-4">Total Users</div>
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.totalUsers.toLocaleString('en-US')}
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-yellow-100 flex items-center justify-center shadow-sm">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-4">Yesterday {stats.yesterdayUsers.toLocaleString('en-US')}</div>
            </div>
          </Link>

          {/* Card 4: Pending Equipment (Red) */}
          <Link href="/dashboard/admin/equipment" className="block hover:-translate-y-1 transition-transform h-full">
            <div className="bg-red-50 rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-red-100 shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer">
              <div className="text-gray-500 text-sm mb-4">Pending Equipment</div>
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.pendingEquipment.toLocaleString('en-US')}
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-4">Yesterday {stats.yesterdayPendingEquipment.toLocaleString('en-US')}</div>
            </div>
          </Link>

          {/* Row 2: Plain White Cards */}
          <Link href="/dashboard/admin/equipment" className="block hover:-translate-y-1 transition-transform h-full">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer">
              <div className="text-gray-500 text-sm mb-4">Total Equipment</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{stats.totalEquipment.toLocaleString('en-US')}</div>
              <div className="text-gray-400 text-xs">Yesterday {stats.yesterdayEquipment.toLocaleString('en-US')}</div>
            </div>
          </Link>
          
          <Link href="/dashboard/admin/categories" className="block hover:-translate-y-1 transition-transform h-full">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer">
              <div className="text-gray-500 text-sm mb-4">Total Categories</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{stats.totalCategories.toLocaleString('en-US')}</div>
              <div className="text-gray-400 text-xs">Yesterday {stats.yesterdayCategories.toLocaleString('en-US')}</div>
            </div>
          </Link>

          <Link href="/dashboard/admin/reviews" className="block hover:-translate-y-1 transition-transform h-full">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer">
              <div className="text-gray-500 text-sm mb-4">Total Reviews</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{stats.totalReviews.toLocaleString('en-US')}</div>
              <div className="text-gray-400 text-xs">Yesterday {stats.yesterdayReviews.toLocaleString('en-US')}</div>
            </div>
          </Link>

          <Link href="/dashboard/admin/users" className="block hover:-translate-y-1 transition-transform h-full">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer">
              <div className="text-gray-500 text-sm mb-4">Total Customers</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{stats.totalCustomers.toLocaleString('en-US')}</div>
              <div className="text-gray-400 text-xs">Yesterday {stats.yesterdayCustomers.toLocaleString('en-US')}</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Operations Assistant Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Operations Assistant</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/admin/activities" className="block h-full hover:scale-[1.02] transition-transform">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 h-full">
              <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                <Activity className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Activities Log</h4>
                <p className="text-xs text-gray-400 mt-0.5">Platform audit trail</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/equipment" className="block h-full hover:scale-[1.02] transition-transform">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 h-full">
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

          <Link href="/dashboard/admin/owners" className="block h-full hover:scale-[1.02] transition-transform">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 h-full">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 relative">
                {stats.pendingOwnerRequests > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />}
                <Users className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Owner Verifications</h4>
                <p className="text-xs text-gray-400 mt-0.5">Manage applications</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/transactions" className="block h-full hover:scale-[1.02] transition-transform">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 h-full">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <IndianRupee className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Transactions</h4>
                <p className="text-xs text-gray-400 mt-0.5">Monitor finances</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/categories" className="block h-full hover:scale-[1.02] transition-transform">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 h-full">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Grid className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Categories</h4>
                <p className="text-xs text-gray-400 mt-0.5">Manage hierarchy</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/reviews" className="block h-full hover:scale-[1.02] transition-transform">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 h-full">
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
