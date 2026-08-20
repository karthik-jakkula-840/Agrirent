import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { FavoritesClient } from './favorites-client'

export default async function FavoritesPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  // Initial fetch for Server Component
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      id,
      equipment_id,
      equipment (
        id,
        title,
        daily_price,
        location,
        status,
        equipment_images (
          image_url,
          is_primary
        )
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Favorite Equipment</h1>
        <p className="text-gray-500 mt-1">Manage your saved machinery and tools.</p>
      </div>

      <FavoritesClient initialFavorites={favorites || []} />
    </div>
  )
}
