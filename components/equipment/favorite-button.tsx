'use client'

import React from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { useFavorites, useToggleFavorite } from '@/hooks/use-favorites'
import { cn } from '@/lib/utils'

export interface FavoriteButtonProps {
  equipmentId: string
  equipmentName?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

export function FavoriteButton({
  equipmentId,
  equipmentName,
  size = 'md',
  className,
  showText = false,
}: FavoriteButtonProps) {
  const { data: favorites } = useFavorites()
  const { mutate: toggleFavorite, isPending } = useToggleFavorite()

  const isFavorited = Boolean(favorites?.some((fav: any) => fav.equipment_id === equipmentId))

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite({ equipmentId, isFavorited })
  }

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-11 w-11 text-base',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4.5 w-4.5',
    lg: 'h-5 w-5',
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={
        isFavorited
          ? `Remove ${equipmentName || 'equipment'} from favorites`
          : `Add ${equipmentName || 'equipment'} to favorites`
      }
      className={cn(
        'rounded-full flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90',
        'border border-gray-100/80 bg-white/90 backdrop-blur-md hover:bg-white hover:border-rose-100',
        sizeClasses[size],
        isFavorited && 'bg-rose-50/90 border-rose-200 shadow-rose-100/50',
        className
      )}
    >
      {isPending ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin text-gray-400')} />
      ) : (
        <Heart
          className={cn(
            iconSizes[size],
            'transition-all duration-200',
            isFavorited
              ? 'fill-rose-500 text-rose-500 scale-110 drop-shadow-xs'
              : 'text-gray-600 hover:text-rose-500'
          )}
        />
      )}
      {showText && (
        <span className="ml-1.5 font-semibold text-xs text-gray-700">
          {isFavorited ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  )
}
