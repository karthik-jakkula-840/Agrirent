import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react'
import { BackButton } from '@/components/dashboard/back-button'
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
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-4">
      <div>
        <BackButton href="/dashboard/admin" className="mb-6" />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg shadow-blue-100">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Equipment Approvals
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Review and approve new equipment listings before they go live on the marketplace.</p>
          </div>
        </div>
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
          <>
            {/* Mobile View */}
            <div className="divide-y divide-gray-100 md:hidden">
              {pendingEquipment.map((item: any) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.categories?.name} · ₹{item.daily_price}/day</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-transparent text-xs">Pending</Badge>
                  </div>

                  <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                    <span className="font-medium text-gray-900">{item.profiles?.full_name}</span>
                    <div className="text-gray-400">{item.profiles?.email}</div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Link href={`/dashboard/admin/equipment/${item.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-8 text-xs">Details</Button>
                    </Link>
                    <form action={approveEquipment} className="flex-1">
                      <input type="hidden" name="id" value={item.id} />
                      <Button type="submit" size="sm" className="w-full h-8 bg-green-600 hover:bg-green-700 text-white text-xs">
                        Approve
                      </Button>
                    </form>
                    <form action={rejectEquipment} className="flex-1">
                      <input type="hidden" name="id" value={item.id} />
                      <Button type="submit" variant="destructive" size="sm" className="w-full h-8 text-xs">
                        Reject
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
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
          </>
        )}
      </div>
    </div>
  )
}
