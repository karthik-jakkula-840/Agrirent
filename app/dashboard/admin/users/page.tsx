import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/dashboard/back-button'
import { Users, User, Mail, Phone, Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    page?: string
    role?: string
    search?: string
  }>
}

export default async function AdminUsersPage(props: PageProps) {
  await requireRole('admin')
  
  const searchParams = await props.searchParams
  const currentPage = Math.max(1, Number(searchParams.page) || 1)
  const currentRole = searchParams.role || 'all'
  const currentSearch = searchParams.search || ''
  const limit = 5

  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const { users, totalCount, totalPages } = await adminService.getUsersPaginated(
    currentPage,
    limit,
    currentRole,
    currentSearch
  )

  const buildQueryUrl = (newPage: number, newRole?: string, newSearch?: string) => {
    const params = new URLSearchParams()
    const targetPage = newPage
    const targetRole = newRole !== undefined ? newRole : currentRole
    const targetSearch = newSearch !== undefined ? newSearch : currentSearch

    if (targetPage > 1) params.set('page', targetPage.toString())
    if (targetRole && targetRole !== 'all') params.set('role', targetRole)
    if (targetSearch) params.set('search', targetSearch)

    const qs = params.toString()
    return `/dashboard/admin/users${qs ? `?${qs}` : ''}`
  }

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalCount)

  const roles = [
    { label: 'All Users', value: 'all' },
    { label: 'Customers', value: 'customer' },
    { label: 'Owners', value: 'owner' },
    { label: 'Admins', value: 'admin' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-4">
      {/* Header */}
      <div>
        <BackButton href="/dashboard/admin" className="mb-6" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-lg shadow-yellow-100">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                  Total Users
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                  {totalCount}
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-sm font-medium">View and manage all registered users on the platform.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {roles.map((tab) => {
            const isActive = currentRole === tab.value
            return (
              <Link
                key={tab.value}
                href={buildQueryUrl(1, tab.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-green-600 text-white shadow-sm shadow-green-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Search Form */}
        <form action="/dashboard/admin/users" method="GET" className="relative w-full md:w-72">
          {currentRole !== 'all' && (
            <input type="hidden" name="role" value={currentRole} />
          )}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder="Search by name, email, or phone..."
            className="pl-9 pr-4 h-9 text-xs rounded-xl border-gray-200 bg-gray-50/50 focus-visible:bg-white focus-visible:ring-green-500"
          />
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {!users || users.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No users found</h3>
            <p className="text-gray-500 mt-1 text-sm max-w-sm">
              {currentSearch || currentRole !== 'all'
                ? 'Try changing your search keywords or filter criteria.'
                : 'No users have registered on the platform yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="divide-y divide-gray-100 md:hidden">
              {users.map((user: any) => (
                <div key={user.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full border flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                        user.role === 'admin' 
                          ? 'bg-purple-50 border-purple-100 text-purple-600' 
                          : user.role === 'owner' 
                          ? 'bg-blue-50 border-blue-100 text-blue-600' 
                          : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                      }`}>
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{user.full_name || 'Anonymous User'}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{user.id.split('-')[0]}...</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`capitalize font-medium text-xs px-2.5 py-0.5 rounded-full border ${
                      user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      user.role === 'owner' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {user.role}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-1 text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{user.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{user.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                    <span className="text-gray-400">Joined Date</span>
                    <span>{format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/70 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Contact Details</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full border flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                            user.role === 'admin' 
                              ? 'bg-purple-50 border-purple-100 text-purple-600' 
                              : user.role === 'owner' 
                              ? 'bg-blue-50 border-blue-100 text-blue-600' 
                              : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          }`}>
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{user.full_name || 'Anonymous User'}</div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">{user.id.split('-')[0]}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center text-gray-600 text-xs gap-2">
                          <Mail className="h-3.5 w-3.5 text-gray-400" /> {user.email || 'N/A'}
                        </div>
                        <div className="flex items-center text-gray-600 text-xs gap-2">
                          <Phone className="h-3.5 w-3.5 text-gray-400" /> {user.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`capitalize font-medium text-xs px-2.5 py-0.5 rounded-full border ${
                          user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          user.role === 'owner' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-right text-xs">
                        <div className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {format(new Date(user.created_at), 'MMM dd, yyyy')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
              <span className="font-bold text-gray-800">{endItem}</span> of{' '}
              <span className="font-bold text-gray-800">{totalCount}</span> users
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {/* Previous Button */}
                {currentPage > 1 ? (
                  <Link href={buildQueryUrl(currentPage - 1)}>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-lg border-gray-200 text-xs font-medium text-gray-600 hover:bg-white hover:text-green-700">
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="h-8 px-2.5 rounded-lg border-gray-200 text-xs font-medium opacity-40">
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                  </Button>
                )}

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === currentPage
                    return (
                      <Link key={p} href={buildQueryUrl(p)}>
                        <button
                          className={`h-8 min-w-8 px-2 rounded-lg text-xs font-semibold transition-all ${
                            isCurrent
                              ? 'bg-green-600 text-white shadow-sm shadow-green-200'
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {p}
                        </button>
                      </Link>
                    )
                  })}
                </div>

                {/* Next Button */}
                {currentPage < totalPages ? (
                  <Link href={buildQueryUrl(currentPage + 1)}>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-lg border-gray-200 text-xs font-medium text-gray-600 hover:bg-white hover:text-green-700">
                      Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="h-8 px-2.5 rounded-lg border-gray-200 text-xs font-medium opacity-40">
                    Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
