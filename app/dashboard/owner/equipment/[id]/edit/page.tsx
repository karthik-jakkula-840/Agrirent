import { EquipmentForm } from '@/components/equipment/owner/equipment-form'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { EquipmentService } from '@/services/equipment.service'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
        <div className="flex items-center gap-4">
          <Link href="/dashboard/owner/equipment">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Equipment</h1>
            <p className="text-gray-500 mt-1">Update details for {equipment.title}</p>
          </div>
        </div>

        <EquipmentForm initialData={equipment} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
