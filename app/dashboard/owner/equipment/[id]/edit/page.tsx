import { EquipmentForm } from '@/components/equipment/owner/equipment-form'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { EquipmentService } from '@/services/equipment.service'
import { BackButton } from '@/components/dashboard/back-button'
import { notFound, redirect } from 'next/navigation'

export const metadata = {
  title: 'Edit Equipment | Owner Portal | Agriform',
}

export default async function EditEquipmentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const user = await getCurrentUser()
  const supabase = await createClient()
  
  if (!user) {
    redirect('/login')
  }

  const equipmentService = new EquipmentService(supabase)
  
  try {
    const equipment = await equipmentService.getEquipmentById(params.id) as any
    
    // Authorization check
    if (equipment.owner_id !== user.id) {
      redirect('/dashboard/owner/equipment')
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <BackButton href="/dashboard/owner/equipment" label="Back to My Equipment" className="mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Equipment</h1>
          <p className="text-gray-500 mt-1">Update details for {equipment.title}</p>
        </div>

        <EquipmentForm initialData={equipment} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
