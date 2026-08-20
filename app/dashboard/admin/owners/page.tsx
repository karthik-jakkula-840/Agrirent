import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { OwnerActionButtons } from './action-buttons'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function OwnerRequestsPage() {
  await requireRole('admin')
  
  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const requests = await adminService.getOwnerRequests()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard/admin" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Owner Verifications</h1>
        <p className="text-gray-500 mt-1">Review and approve applications for equipment owners.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {!requests || requests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No owner verification requests found.</div>
        ) : (
          <div className="overflow-x-auto">
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
        )}
      </div>
    </div>
  )
}
