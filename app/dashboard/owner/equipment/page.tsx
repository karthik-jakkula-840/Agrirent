import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { EquipmentService } from '@/services/equipment.service'
import { Plus, Edit, Trash2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export const metadata = {
  title: 'My Equipment | Owner Portal | Agriform',
}

export default async function OwnerEquipmentPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()
  const equipmentService = new EquipmentService(supabase)
  
  const equipment = await equipmentService.getOwnerEquipment(user!.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Equipment</h1>
          <p className="text-gray-500 mt-1">Manage your fleet and pricing</p>
        </div>
        <Link href="/dashboard/owner/equipment/new">
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Equipment
          </Button>
        </Link>
      </div>

      {equipment.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No equipment yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            You haven't added any equipment to your fleet. Start by adding your first tractor or implement.
          </p>
          <Link href="/dashboard/owner/equipment/new">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Your First Equipment
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Equipment</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Pricing (Daily)</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {equipment.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
                          {item.equipment_images?.[0] ? (
                            <Image 
                              src={item.equipment_images[0].image_url} 
                              alt={item.title} 
                              fill 
                              className="object-cover" 
                            />
                          ) : (
                            <Calendar className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{item.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.categories?.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'}
                      `}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹{item.daily_price}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/dashboard/owner/equipment/${item.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
