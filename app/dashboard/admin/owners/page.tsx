import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { OwnerActionButtons } from './action-buttons'
import { BackButton } from '@/components/dashboard/back-button'
import { Users } from 'lucide-react'

export default async function OwnerRequestsPage() {
  await requireRole('admin')
  
  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const requests = await adminService.getOwnerRequests()

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-4">
      <div>
        <BackButton href="/dashboard/admin" className="mb-6" />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Owner Verifications
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Review and approve applications for equipment owners.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {!requests || requests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No owner verification requests found.</div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="divide-y divide-gray-100 md:hidden">
              {requests.map((req: any) => (
                <div key={req.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{req.user?.full_name || 'Applicant'}</h4>
                      <p className="text-xs text-gray-500">{req.business_name}</p>
                    </div>
                    <Badge variant="outline" className={`capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      req.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {req.status}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-1 text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                    <div><span className="text-gray-400">Email:</span> {req.user?.email}</div>
                    <div><span className="text-gray-400">Phone:</span> {req.user?.phone || 'N/A'}</div>
                    <div className="truncate"><span className="text-gray-400">Address:</span> {req.business_address}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-3">
                      <a href={req.identity_document_url} target="_blank" rel="noreferrer" className="text-green-700 font-medium hover:underline text-xs">ID Document ↗</a>
                      <a href={req.address_proof_url} target="_blank" rel="noreferrer" className="text-green-700 font-medium hover:underline text-xs">Address Proof ↗</a>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {format(new Date(req.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {req.status === 'pending' && (
                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                      <OwnerActionButtons requestId={req.id} />
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
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Business Details</th>
                    <th className="px-6 py-4">Documents</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req: any) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{req.user?.full_name}</div>
                        <div className="text-xs text-gray-500">{req.user?.email}</div>
                        <div className="text-xs text-gray-500">{req.user?.phone}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        <div className="font-medium text-gray-900">{req.business_name}</div>
                        <div className="text-xs text-gray-500 truncate" title={req.business_address}>{req.business_address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <a href={req.identity_document_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">ID Document</a>
                          <a href={req.address_proof_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">Address Proof</a>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {format(new Date(req.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`capitalize ${
                          req.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'pending' ? (
                          <OwnerActionButtons requestId={req.id} />
                        ) : (
                          <span className="text-gray-400 text-xs italic">Reviewed</span>
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
