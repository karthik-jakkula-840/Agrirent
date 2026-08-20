'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageGalleryProps {
  images: { id: string, image_url: string, is_primary: boolean }[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Sort so primary is first, just in case
  const sortedImages = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
  
  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[4/3] sm:aspect-[16/9] w-full bg-gray-100 rounded-3xl overflow-hidden relative border border-gray-200 flex items-center justify-center">
        <Image 
          src="https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=1200" 
          alt="Placeholder" 
          fill 
          className="object-cover opacity-50 grayscale"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10">
          <span className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium shadow-sm">No Images Provided</span>
        </div>
      </div>
    )
  }

  const next = () => setCurrentIndex((prev) => (prev + 1) % sortedImages.length)
  const prev = () => setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 group">
        <Image 
          src={sortedImages[currentIndex].image_url} 
          alt={`${title} - Image ${currentIndex + 1}`} 
          fill 
          className="object-cover transition-transform duration-500"
          priority
        />
        
        {sortedImages.length > 1 && (
          <>
            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg" onClick={prev}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg" onClick={next}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </>
        )}

        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-4 right-4 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg bg-white/90 hover:bg-white"
          onClick={() => setIsFullscreen(true)}
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-5 gap-4">
          {sortedImages.map((img, idx) => (
            <button 
              key={img.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                idx === currentIndex ? 'border-primary shadow-sm' : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <Image 
                src={img.image_url} 
                alt={`Thumbnail ${idx + 1}`} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 10vw"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-6 right-6 text-white hover:bg-white/10 rounded-full"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-8 w-8" />
          </Button>
          
          <div className="relative w-full max-w-5xl aspect-[16/9]">
            <Image 
              src={sortedImages[currentIndex].image_url} 
              alt={`${title} - Fullscreen`} 
              fill 
              className="object-contain"
            />
            {sortedImages.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full shadow-lg" onClick={prev}>
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full shadow-lg" onClick={next}>
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-white/70 mt-6 font-medium">
            {currentIndex + 1} / {sortedImages.length}
          </div>
        </div>
      )}
    </div>
  )
}
