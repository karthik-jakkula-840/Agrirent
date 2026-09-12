'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Tractor } from 'lucide-react'

export function EquipmentThumbnail({ 
  imageUrl, 
  title, 
  className = "w-20 h-20 sm:w-24 sm:h-24" 
}: { 
  imageUrl?: string | null
  title: string
  className?: string 
}) {
  const [hasError, setHasError] = useState(false)
  const isValid = imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '' && !hasError

  if (isValid) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gray-100 border border-gray-150 shrink-0 ${className}`}>
        <Image
          src={imageUrl}
          alt={title || 'Equipment'}
          fill
          sizes="(max-width: 640px) 96px, 120px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setHasError(true)}
        />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-150 flex items-center justify-center text-emerald-600 shrink-0 ${className}`}>
      <Tractor className="h-8 w-8 text-[#009b55] opacity-80" />
    </div>
  )
}
