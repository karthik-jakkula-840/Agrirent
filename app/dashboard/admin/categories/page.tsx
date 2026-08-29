import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/dashboard/back-button'
import { Grid, Plus, Leaf, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    page?: string
    status?: string
    search?: string
  }>
}

export default async function CategoriesPage(props: PageProps) {
  await requireRole('admin')
  
  const searchParams = await props.searchParams
  const currentPage = Math.max(1, Number(searchParams.page) || 1)
  const currentStatus = searchParams.status || 'all'
  const currentSearch = searchParams.search || ''
  const limit = 5

  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const { categories, totalCount, totalPages } = await adminService.getCategoriesPaginated(
    currentPage,
    limit,
    currentSearch,
    currentStatus
  )

  const buildQueryUrl = (newPage: number, newStatus?: string, newSearch?: string) => {
    const params = new URLSearchParams()
    const targetPage = newPage
    const targetStatus = newStatus !== undefined ? newStatus : currentStatus
    const targetSearch = newSearch !== undefined ? newSearch : currentSearch

    if (targetPage > 1) params.set('page', targetPage.toString())
    if (targetStatus && targetStatus !== 'all') params.set('status', targetStatus)
    if (targetSearch) params.set('search', targetSearch)

    const qs = params.toString()
    return `/dashboard/admin/categories${qs ? `?${qs}` : ''}`
  }

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalCount)

  const statusTabs = [
    { label: 'All Categories', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <BackButton href="/dashboard/admin" className="mb-6" />
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg shadow-green-200">
              <Grid className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                  Platform Categories
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                  {totalCount}
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-sm font-medium">Manage and organize the equipment classification hierarchy.</p>
            </div>
          </div>
        </div>
        
        <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 rounded-xl px-6 h-11 group transition-all duration-300 hover:scale-105 w-fit">
          <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
          Create Category
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {statusTabs.map((tab) => {
            const isActive = currentStatus === tab.value
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
        <form action="/dashboard/admin/categories" method="GET" className="relative w-full md:w-72">
          {currentStatus !== 'all' && (
            <input type="hidden" name="status" value={currentStatus} />
          )}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder="Search categories..."
            className="pl-9 pr-4 h-9 text-xs rounded-xl border-gray-200 bg-gray-50/50 focus-visible:bg-white focus-visible:ring-green-500"
          />
        </form>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-green-50/50 blur-3xl pointer-events-none" />
        
        {!categories || categories.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center relative z-10">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Grid className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No categories found</h3>
            <p className="text-gray-500 mt-1 text-sm max-w-sm">
              {currentSearch || currentStatus !== 'all'
                ? 'Try changing your search keywords or filter criteria.'
                : 'Get started by creating a new category for equipment listings.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="divide-y divide-gray-100 md:hidden relative z-10">
              {categories.map((category: any) => (
                <div key={category.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                        <Leaf className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{category.name}</span>
                    </div>
                    <Badge variant="outline" className={`capitalize text-[10px] px-2 py-0.5 rounded-full border ${
                      category.is_active 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-[10px] text-gray-600">
                      {category.slug}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {format(new Date(category.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {category.description && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-xl">
                      {category.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto relative z-10">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/80 backdrop-blur-sm text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5">Category Name</th>
                    <th className="px-6 py-5">Slug</th>
                    <th className="px-6 py-5 hidden md:table-cell">Description</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map((category: any) => (
                    <tr key={category.id} className="hover:bg-green-50/30 transition-all duration-200 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <Leaf className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-gray-900 text-base">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 font-mono">
                          {category.slug}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-gray-500 max-w-xs truncate hidden md:table-cell">
                        {category.description || <span className="text-gray-300 italic">No description provided</span>}
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant="outline" className={`capitalize px-3 py-1 rounded-full border ${
                          category.is_active 
                            ? 'bg-green-50 text-green-700 border-green-200/60 shadow-sm' 
                            : 'bg-red-50 text-red-700 border-red-200/60 shadow-sm'
                        }`}>
                          {category.is_active ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              Active
                            </span>
                          ) : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-gray-400 font-medium whitespace-nowrap text-right">
                        {format(new Date(category.created_at), 'MMM dd, yyyy')}
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
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
              <span className="font-bold text-gray-800">{endItem}</span> of{' '}
              <span className="font-bold text-gray-800">{totalCount}</span> categories
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
