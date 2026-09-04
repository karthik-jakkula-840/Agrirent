'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Star, Heart, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToggleFavorite, useFavorites } from '@/hooks/use-favorites'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface EquipmentCardProps {
  id: string
  name: string
  ownerName: string
  categoryName: string
  pricePerDay: number
  pricePerHour?: number
  rating: number
  location: string
  imageUrl: string
  isAvailable: boolean
  isVerifiedOwner?: boolean
  priority?: boolean
}

export function EquipmentCard({
  id,
  name,
  ownerName,
  categoryName,
  pricePerDay,
  pricePerHour,
  rating,
  location,
  imageUrl,
  isAvailable,
  isVerifiedOwner = true,
  priority = false,
}: EquipmentCardProps) {
  const { data: favorites } = useFavorites()
  const { mutate: toggleFavorite, isPending } = useToggleFavorite()
  
  const [isFavorited, setIsFavorited] = useState(false)

  // Sync with server state
  useEffect(() => {
    if (favorites) {
      setIsFavorited(favorites.some((fav: any) => fav.equipment_id === id))
    }
  }, [favorites, id])

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check auth before toggling
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Please login to add equipment to favorites')
      return
    }
    
    const newStatus = !isFavorited
    setIsFavorited(newStatus)
    
    toggleFavorite(
      { equipmentId: id, isFavorited: !newStatus }, 
      {
        onError: () => {
          setIsFavorited(!newStatus) // Revert on error
          toast.error('Failed to update favorites')
        }
      }
    )
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-full group"
    >
      <Card className="h-full flex flex-col overflow-hidden rounded-2xl md:rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,155,85,0.12)] hover:border-emerald-200/80 transition-all duration-300 bg-white">
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Subtle gradient overlay at top for badge legibility */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

          <div className="absolute top-2.5 right-2.5 z-10">
            <button 
              onClick={handleFavoriteClick}
              disabled={isPending}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-90 hover:bg-white"
            >
              <Heart className={`h-4 w-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-700 hover:text-red-500'}`} />
            </button>
          </div>

          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5 max-w-[80%]">
            {isAvailable ? (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full border-none shadow-sm flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Available
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                Rented
              </Badge>
            )}
            <Badge variant="outline" className="bg-white/95 backdrop-blur-md text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100 shadow-xs">
              {categoryName}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="p-3.5 pb-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-base md:text-lg text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors" title={name}>
              {name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </CardHeader>
        
        <CardContent className="p-3.5 pt-2 flex-grow">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-800 text-[10px] font-bold uppercase shrink-0 border border-emerald-200">
              {ownerName.charAt(0)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
              <span className="text-gray-400">Owner:</span>
              <span className="font-semibold text-gray-800 truncate">{ownerName}</span>
              {isVerifiedOwner && <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-3.5 pt-2.5 flex flex-col gap-2.5 mt-auto bg-gray-50/60 border-t border-gray-100">
          <div className="flex w-full items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-xl font-black text-gray-900">
                ₹{pricePerDay.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-medium text-gray-500">/day</span>
            </div>
            {pricePerHour && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded-md border border-emerald-100">
                ₹{pricePerHour.toLocaleString('en-IN')}/hr
              </span>
            )}
          </div>
          
          <div className="flex w-full gap-2 pt-0.5">
            <Link href={`/equipment/${id}`} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full h-10 rounded-xl text-xs font-bold text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                Details
              </Button>
            </Link>
            <Link href={`/equipment/${id}?book=true`} className="flex-[1.5]">
              <Button 
                className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                Rent Now
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
