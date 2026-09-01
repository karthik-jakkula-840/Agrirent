'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X, UploadCloud, Loader2, Star } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export function ImageUploader({ value, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (value.length + files.length > maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images.`)
      return
    }

    setIsUploading(true)
    setError(null)

    const newUrls: string[] = []

    try {
      // Get user session to use for path (optional, but good for organization)
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user.id || 'anonymous'

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
          throw new Error(`Invalid file type for ${file.name}. Only JPG, PNG, and WEBP are allowed.`)
        }

        // Validate file size (e.g. 5MB max)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 5MB limit.`)
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `${userId}/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('equipment-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('equipment-images')
          .getPublicUrl(filePath)
        
        newUrls.push(publicUrl)
      }

      onChange([...value, ...newUrls])
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
      console.error(err)
    } finally {
      setIsUploading(false)
      // Reset input
      event.target.value = ''
    }
  }

  const removeImage = (indexToRemove: number) => {
    // Note: This only removes it from the UI form state. 
    // Real cleanup of the bucket should happen on the server when saving if they changed their mind, 
    // or via a cron job/trigger for orphaned files.
    onChange(value.filter((_, index) => index !== indexToRemove))
  }

  const setPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return
    const newUrls = [...value]
    const primary = newUrls.splice(indexToPrimary, 1)[0]
    newUrls.unshift(primary) // Move to start
    onChange(newUrls)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {value.map((url, index) => (
          <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <Image 
              src={url} 
              alt={`Equipment ${index + 1}`} 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                aria-label="Remove image"
                className="h-8 w-8 rounded-full"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              {index !== 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 text-xs font-medium"
                  onClick={() => setPrimary(index)}
                >
                  Make Primary
                </Button>
              )}
            </div>
            
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Star className="h-3 w-3 fill-current" /> Primary
              </div>
            )}
          </div>
        ))}
        
        {value.length < maxImages && (
          <label className="relative aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 group">
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <>
                <div className="h-10 w-10 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <UploadCloud className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs font-medium text-gray-500 group-hover:text-primary transition-colors">
                  Upload Image
                </span>
                <span className="text-[10px] text-gray-400">
                  {value.length} / {maxImages} uploaded
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
      
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
      
      <p className="text-xs text-gray-500">
        First image will be used as the primary display image. Max 5 images. Allowed formats: JPG, PNG, WEBP (Max 5MB).
      </p>
    </div>
  )
}
