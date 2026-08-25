import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ChevronLeft, User, Mail, Phone, Calendar } from 'lucide-react'

export default async function AdminUsersPage() {
  await requireRole('admin')
  
  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const users = await adminService.getAllUsers()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard/admin" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Total Users</h1>
        <p className="text-gray-500 mt-1">View and manage all registered users on the platform.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {!users || users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No users found on the platform.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                           <User className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="font-medium text-gray-900">{user.full_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center text-gray-600 gap-2">
                         <Mail className="h-3 w-3 text-gray-400" /> {user.email}
                      </div>
                      <div className="flex items-center text-gray-600 gap-2">
                         <Phone className="h-3 w-3 text-gray-400" /> {user.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`capitalize ${
                        user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        user.role === 'owner' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
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
