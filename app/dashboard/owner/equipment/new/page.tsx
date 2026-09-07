import { EquipmentForm } from '@/components/equipment/owner/equipment-form'
import { BackButton } from '@/components/dashboard/back-button'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Add Equipment | Owner Portal | AgriRent',
}

export default async function NewEquipmentPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
      <div className="space-y-3">
        <BackButton href="/dashboard/owner/equipment" label="Back to My Equipment" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950">Add New Equipment</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">List your equipment for rent on AgriRent.</p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-100/80">
            <Sparkles className="w-3.5 h-3.5 text-[#009b55]" />
            <span>Fast Approval</span>
          </div>
        </div>
      </div>

      <EquipmentForm />
    </div>
  )
}

