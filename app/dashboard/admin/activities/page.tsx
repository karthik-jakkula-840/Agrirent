import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ChevronLeft, Activity } from 'lucide-react'

export default async function ActivitiesPage() {
  await requireRole('admin')
  
  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const activities = await adminService.getAllActivityLogs()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard/admin" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" /> Platform Activities
        </h1>
        <p className="text-gray-500 mt-1">Audit log of all user and owner activities.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {!activities || activities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No recent activities found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div>
                          <div className="font-medium text-gray-900">{log.user.full_name}</div>
                          <Badge variant="outline" className="mt-1 bg-gray-50">{log.user.role}</Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="capitalize">{log.entity_type}</span>
                      {log.entity_id && <div className="text-xs text-gray-400 font-mono mt-1">{log.entity_id.split('-')[0]}...</div>}
                    </td>
                    <td className="px-6 py-4 max-w-xs text-gray-600 text-xs">
                      {log.details ? (
                        <pre className="whitespace-pre-wrap font-sans">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      ) : (
                        '-'
                      )}
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
