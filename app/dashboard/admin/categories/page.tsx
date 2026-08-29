import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, Grid, Plus, Leaf } from 'lucide-react'

export default async function CategoriesPage() {
  await requireRole('admin')
  
  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const categories = await adminService.getAllCategories()

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/dashboard/admin" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-green-600 mb-6 transition-colors bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Admin Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg shadow-green-200">
              <Grid className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                Platform Categories
              </h1>
              <p className="text-gray-500 mt-1 text-sm font-medium">Manage and organize the equipment classification hierarchy.</p>
            </div>
          </div>
        </div>
        
        <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 rounded-xl px-6 h-11 group transition-all duration-300 hover:scale-105">
          <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
          Create Category
        </Button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-green-50/50 blur-3xl pointer-events-none" />
        
        {!categories || categories.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Grid className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
            <p className="text-gray-500 mt-1 max-w-sm">Get started by creating a new category for equipment listings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
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
        )}
      </div>
    </div>
  )
}
