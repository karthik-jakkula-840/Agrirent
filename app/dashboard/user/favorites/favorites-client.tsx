'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useFavorites, useToggleFavorite } from '@/hooks/use-favorites'
import { Heart, MapPin, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function FavoritesClient({ initialFavorites }: { initialFavorites: any[] }) {
  // Use the global favorites cache seeded from server, stays in sync with equipment card hearts
  const { data: favorites = initialFavorites, isLoading } = useFavorites()
  const { mutate: toggleFavorite, isPending, variables: pendingVars } = useToggleFavorite()

  const handleRemove = (equipmentId: string) => {
    toggleFavorite(
      { equipmentId, isFavorited: true },
      {
        onSuccess: () => toast.success('Removed from favorites'),
        onError: () => toast.error('Failed to remove favorite'),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center flex flex-col items-center shadow-sm">
        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
          <Heart className="h-10 w-10 text-red-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No favorite equipment yet</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Browse equipment and tap the ❤️ icon to save your favorites here.
        </p>
        <Link href="/equipment">
          <Button className="bg-primary hover:bg-primary/90 text-white px-8">Browse Equipment</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((fav: any) => {
        const eq = fav.equipment
        if (!eq) return null

        const image =
          eq.equipment_images?.find((i: any) => i.is_primary)?.image_url ||
          eq.equipment_images?.[0]?.image_url ||
          'https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=400'

        const isRemoving = isPending && pendingVars?.equipmentId === eq.id
        const isAvailable = eq.availability === 'available'

        return (
          <div
            key={fav.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col group"
          >
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
              <Image src={image} alt={eq.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              <div className="absolute top-3 left-3">
                {isAvailable ? (
                  <Badge className="bg-emerald-500 text-white border-transparent shadow-md">Available</Badge>
                ) : (
                  <Badge className="bg-gray-500/80 text-white border-transparent shadow-md backdrop-blur-sm">Rented</Badge>
                )}
              </div>
              <button
                onClick={() => handleRemove(eq.id)}
                disabled={isRemoving}
                aria-label="Remove from favorites"
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                )}
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-3">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">{eq.title}</h3>
                  <span className="font-bold text-primary shrink-0 text-sm">₹{eq.daily_price?.toLocaleString('en-IN')}/day</span>
                </div>
                {eq.category && (
                  <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-100 bg-emerald-50 mb-2">
                    {eq.category}
                  </Badge>
                )}
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{eq.location}</span>
                </p>
              </div>

              {eq.profiles && (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0 border border-white shadow-sm">
                    {eq.profiles.full_name?.charAt(0) || 'O'}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>{eq.profiles.full_name}</span>
                    {eq.profiles.is_verified && <CheckCircle2 className="h-3 w-3 text-primary" />}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
                <Link href={`/equipment/${eq.id}`} className="flex-1">
                  <Button variant="outline" className="w-full h-10 border-gray-200 hover:border-primary hover:text-primary text-sm">
                    Details
                  </Button>
                </Link>
                <Link href={`/equipment/${eq.id}?book=true`} className="flex-[2]">
                  <Button className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold uppercase tracking-wider text-sm shadow-md">
                    Rent Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
