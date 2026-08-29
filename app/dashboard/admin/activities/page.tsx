import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/dashboard/back-button'
import { Activity } from 'lucide-react'

export default async function ActivitiesPage() {
  await requireRole('admin')
  
  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const activities = await adminService.getAllActivityLogs()

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-4">
      <div>
        <BackButton href="/dashboard/admin" className="mb-6" />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl shadow-lg shadow-pink-100">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Platform Activities
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Audit log of all user and owner activities.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {!activities || activities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No recent activities found.</div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="divide-y divide-gray-100 md:hidden">
              {activities.map((log: any) => (
                <div key={log.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">{log.action}</span>
                    <span className="text-[11px] text-gray-400">
                      {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium">
                        {log.user ? log.user.full_name : 'System'}
                      </span>
                      {log.user && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-gray-50 capitalize">
                          {log.user.role}
                        </Badge>
                      )}
                    </div>
                    <span className="text-gray-500 font-mono capitalize text-[11px]">
                      {log.entity_type} {log.entity_id && `(${log.entity_id.split('-')[0]}...)`}
                    </span>
                  </div>
                  {log.details && (
                    <div className="bg-gray-50 p-2.5 rounded-xl text-[11px] text-gray-600 font-mono overflow-x-auto">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
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
          </>
        )}
      </div>
    </div>
  )
}
