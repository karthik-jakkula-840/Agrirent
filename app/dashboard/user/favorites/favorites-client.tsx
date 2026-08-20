'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Heart, MapPin, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function FavoritesClient({ initialFavorites }: { initialFavorites: any[] }) {
  const [favorites, setFavorites] = useState(initialFavorites)

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user/favorites/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove favorite')
      return id
    },
    onMutate: async (deletedId) => {
      // Optimistic update
      setFavorites(prev => prev.filter(f => f.id !== deletedId))
    },
    onError: () => {
      // On error, we could revert the state by refetching or keeping previous state.
      // For simplicity, we just reload or show error.
      window.location.reload()
    }
  })

  if (favorites.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center">
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No favorite equipment yet</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Save equipment you like to quickly find them later.
        </p>
        <Link href="/equipment">
          <Button className="bg-primary hover:bg-primary/90 text-white">Explore Equipment</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((fav) => {
        const eq = fav.equipment
        const image = eq.equipment_images?.find((i:any)=>i.is_primary)?.image_url 
                   || eq.equipment_images?.[0]?.image_url
                   || 'https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=400'

        return (
          <div key={fav.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="relative h-48 w-full bg-gray-100">
              <Image src={image} alt={eq.title} fill className="object-cover" />
              <button
                onClick={() => removeMutation.mutate(fav.id)}
                disabled={removeMutation.isPending}
                className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-red-50 hover:text-red-600 backdrop-blur-md rounded-full shadow-sm text-gray-500 transition-colors"
                title="Remove favorite"
              >
                {removeMutation.isPending && removeMutation.variables === fav.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{eq.title}</h3>
                <span className="font-bold text-primary shrink-0">₹{eq.daily_price}/day</span>
              </div>
              <p className="text-gray-500 text-sm flex items-center gap-1 mb-6">
                <MapPin className="h-3.5 w-3.5" /> {eq.location}
              </p>
              
              <div className="mt-auto pt-4 border-t border-gray-100">
                <Link href={`/equipment/${eq.id}`}>
                  <Button variant="outline" className="w-full">View Equipment</Button>
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
