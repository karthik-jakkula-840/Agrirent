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
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full group"
    >
      <Card className="h-full flex flex-col overflow-hidden border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] group-hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] group-hover:border-emerald-100 transition-all duration-300 bg-white">
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button 
              onClick={handleFavoriteClick}
              disabled={isPending}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all shadow-sm group hover:scale-110 active:scale-95"
            >
              <Heart className={`h-4 w-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 group-hover:text-red-500'}`} />
            </button>
          </div>
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isAvailable ? (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-md">Available</Badge>
            ) : (
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white shadow-md">Rented</Badge>
            )}
            <Badge variant="outline" className="bg-white/90 backdrop-blur-md text-emerald-700 text-xs font-semibold shadow-sm border-white/50">
              {categoryName}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-lg line-clamp-1 text-foreground" title={name}>
              {name}
            </h3>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full shrink-0 shadow-sm">
              <Star className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 pt-2 flex-grow">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 text-xs font-bold uppercase shrink-0 border border-white shadow-sm">
              {ownerName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Owned by</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-foreground">{ownerName}</span>
                {isVerifiedOwner && <CheckCircle2 className="h-3 w-3 text-primary" />}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 flex flex-col gap-3 mt-auto bg-gray-50/50">
          <div className="flex w-full items-center justify-between">
            <div>
              <div className="text-xl md:text-lg font-bold text-gray-900">
                ₹{pricePerDay.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-muted-foreground">/day</span>
              </div>
              {pricePerHour && (
                <div className="text-xs text-muted-foreground">
                  ₹{pricePerHour.toLocaleString('en-IN')}/hr
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full gap-2">
            <Link href={`/equipment/${id}`} className="flex-1">
              <Button variant="outline" className="w-full h-10 border-gray-300">
                Details
              </Button>
            </Link>
            <Link href={`/equipment/${id}?book=true`} className="flex-[2]">
              <Button variant="default" className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all">
                Rent Now
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
