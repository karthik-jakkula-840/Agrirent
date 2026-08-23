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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
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
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-border/50 hover:shadow-xl transition-shadow bg-card">
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button 
              onClick={handleFavoriteClick}
              disabled={isPending}
              className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all shadow-sm group hover:scale-110 active:scale-95"
            >
              <Heart className={`h-4 w-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 group-hover:text-red-500'}`} />
            </button>
          </div>
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isAvailable ? (
              <Badge className="bg-primary hover:bg-primary/90 text-white border-transparent">Available</Badge>
            ) : (
              <Badge variant="secondary" className="bg-white/90 text-gray-700 hover:bg-white">Rented</Badge>
            )}
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs font-semibold">
              {categoryName}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-lg line-clamp-1 text-foreground" title={name}>
              {name}
            </h3>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
              <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
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
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase shrink-0">
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
              <Button variant="default" className="w-full h-10 bg-secondary hover:bg-secondary/90 text-white font-bold uppercase tracking-wider">
                Rent Now
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
