import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function AdminEquipmentPage() {
  await requireRole('admin')
  
  const supabase = await createClient()
  
  // Fetch pending equipment
  const { data: pendingEquipment, error } = await supabase
    .from('equipment')
    .select('*, profiles(full_name, email), categories(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Inline Server Actions for Approval/Rejection
  async function approveEquipment(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabaseAction = await createClient()
    // @ts-ignore
    await supabaseAction.from('equipment').update({ status: 'approved' }).eq('id', id)
    revalidatePath('/dashboard/admin/equipment')
  }

  async function rejectEquipment(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabaseAction = await createClient()
    // @ts-ignore
    await supabaseAction.from('equipment').update({ status: 'rejected' }).eq('id', id)
    revalidatePath('/dashboard/admin/equipment')
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Equipment Approvals</h1>
        <p className="text-gray-500 mt-1">Review and approve new equipment listings before they go live on the marketplace.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {(!pendingEquipment || pendingEquipment.length === 0) ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              There is no pending equipment waiting for approval.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Equipment</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Category & Pricing</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingEquipment.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Needs Review
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{item.profiles?.full_name}</div>
                      <div className="text-xs text-gray-500">{item.profiles?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{item.categories?.name}</div>
                      <div className="text-xs text-gray-500">₹{item.daily_price} / day</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-yellow-100 text-yellow-800 border-transparent hover:bg-yellow-200">Pending</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/admin/equipment/${item.id}`}>
                          <Button variant="outline" size="sm" className="h-8">View Details</Button>
                        </Link>
                        <form action={approveEquipment}>
                          <input type="hidden" name="id" value={item.id} />
                          <Button type="submit" size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white">
                            Approve
                          </Button>
                        </form>
                        <form action={rejectEquipment}>
                          <input type="hidden" name="id" value={item.id} />
                          <Button type="submit" variant="destructive" size="sm" className="h-8">
                            Reject
                          </Button>
                        </form>
                      </div>
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
