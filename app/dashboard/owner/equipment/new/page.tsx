import { EquipmentForm } from '@/components/equipment/owner/equipment-form'
import { BackButton } from '@/components/dashboard/back-button'

export const metadata = {
  title: 'Add Equipment | Owner Portal | Agriform',
}

export default async function NewEquipmentPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <BackButton href="/dashboard/owner/equipment" label="Back to My Equipment" className="mb-4" />
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Equipment</h1>
        <p className="text-gray-500 mt-1">List your equipment for rent on Agriform.</p>
      </div>

      <EquipmentForm />
    </div>
  )
}
