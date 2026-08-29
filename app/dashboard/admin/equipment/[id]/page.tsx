import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { EquipmentService } from '@/services/equipment.service'
import { notFound, redirect } from 'next/navigation'
import { BackButton } from '@/components/dashboard/back-button'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ShieldAlert } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function AdminEquipmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin')
  const { id } = await params
  
  const supabase = await createClient()
  const equipmentService = new EquipmentService(supabase)
  
  let equipment: any
  try {
    equipment = await equipmentService.getEquipmentById(id)
  } catch (error) {
    notFound()
  }

  async function approveEquipment() {
    'use server'
    const supabaseAction = await createClient()
    await supabaseAction.from('equipment').update({ status: 'approved' }).eq('id', id)
    revalidatePath('/dashboard/admin/equipment')
    revalidatePath(`/dashboard/admin/equipment/${id}`)
    redirect('/dashboard/admin/equipment')
  }

  async function rejectEquipment() {
    'use server'
    const supabaseAction = await createClient()
    await supabaseAction.from('equipment').update({ status: 'rejected' }).eq('id', id)
    revalidatePath('/dashboard/admin/equipment')
    revalidatePath(`/dashboard/admin/equipment/${id}`)
    redirect('/dashboard/admin/equipment')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 px-4 sm:px-6 pt-4">
      <div>
        <BackButton href="/dashboard/admin/equipment" label="Back to Equipment Approvals" className="mb-6" />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg shadow-blue-100">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Equipment Details</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Review equipment information for approval.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{equipment.title}</h2>
            <p className="text-gray-600 mb-6">{equipment.description}</p>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Category:</span>
                <p className="font-medium text-gray-900">{equipment.categories?.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Pricing:</span>
                <p className="font-medium text-gray-900">₹{equipment.daily_price} / day</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Location:</span>
                <p className="font-medium text-gray-900">{equipment.location}, {equipment.district}, {equipment.state}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Owner Details</h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
              <p className="font-medium text-gray-900">{equipment.profiles?.full_name}</p>
              <p className="text-sm text-gray-500">{equipment.profiles?.email}</p>
              <p className="text-sm text-gray-500">{equipment.profiles?.phone}</p>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {equipment.brand && (
                <div>
                  <span className="text-xs text-gray-500">Brand</span>
                  <p className="text-sm font-medium">{equipment.brand}</p>
                </div>
              )}
              {equipment.model && (
                <div>
                  <span className="text-xs text-gray-500">Model</span>
                  <p className="text-sm font-medium">{equipment.model}</p>
                </div>
              )}
              {equipment.year && (
                <div>
                  <span className="text-xs text-gray-500">Year</span>
                  <p className="text-sm font-medium">{equipment.year}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {equipment.status === 'pending' && (
          <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-4">
            <form action={approveEquipment}>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                <CheckCircle2 className="h-4 w-4" /> Approve Listing
              </Button>
            </form>
            <form action={rejectEquipment}>
              <Button type="submit" variant="destructive" className="gap-2">
                <XCircle className="h-4 w-4" /> Reject Listing
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
