import { EquipmentForm } from '@/components/equipment/owner/equipment-form'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Add Equipment | Owner Portal | Agriform',
}

export default async function NewEquipmentPage() {
  const supabase = await createClient()
  
  // Fetch categories for the form
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/owner/equipment">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Equipment</h1>
          <p className="text-gray-500 mt-1">List your equipment for rent on Agriform.</p>
        </div>
      </div>

      <EquipmentForm categories={categories || []} />
    </div>
  )
}
