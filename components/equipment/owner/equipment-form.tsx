'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { equipmentSchema, EquipmentFormValues } from '@/lib/validations/equipment'
import { useCreateEquipment, useUpdateEquipment } from '@/hooks/use-equipment'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageUploader } from './image-uploader'
import { Loader2 } from 'lucide-react'

export function EquipmentForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const { mutateAsync: createEquipment } = useCreateEquipment()
  const { mutateAsync: updateEquipment } = useUpdateEquipment()
  
  // Use React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: initialData ? {
      ...initialData,
      category: initialData.categories?.name || '',
    } : {
      deposit: 0,
      availability: 'available',
    },
  })

  const [images, setImages] = useState<string[]>(
    initialData?.equipment_images?.map((img: any) => img.image_url) || []
  )

  const onSubmit = async (data: EquipmentFormValues) => {
    setIsSubmitting(true)
    setServerError(null)

    if (images.length === 0) {
      setServerError('Please upload at least one image of the equipment.')
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      
      // Append all form values
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })
      
      // Append image URLs
      const dataWithImages = {
        ...data,
        imageUrls: images
      }

      // Call React Query Mutation
      if (initialData?.id) {
        await updateEquipment({ id: initialData.id, data: dataWithImages })
        toast.success('Equipment Uploaded Successfully!')
      } else {
        await createEquipment(dataWithImages)
        toast.success('Equipment Uploaded Successfully!')
      }

      // Success!
      router.push('/dashboard/owner/equipment')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred')
      setServerError(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {serverError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
          {serverError}
        </div>
      )}

      {/* Section 1: Basic Info */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">1. Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Equipment Title <span className="text-red-500">*</span></Label>
            <Input id="title" {...register('title')} placeholder="e.g. Mahindra 575 DI Tractor" className="bg-gray-50 h-11" />
            {errors.title && <p className="text-sm text-red-500">{String(errors.title.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
            <Input id="category" {...register('category')} placeholder="e.g. Tractors, Harvesters" className="bg-gray-50 h-11" />
            {errors.category && <p className="text-sm text-red-500">{String(errors.category.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand / Manufacturer</Label>
            <Input id="brand" {...register('brand')} placeholder="e.g. Mahindra" className="bg-gray-50 h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" {...register('model')} placeholder="e.g. 575 DI" className="bg-gray-50 h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Manufacturing Year</Label>
            <Input id="year" type="number" {...register('year')} placeholder="e.g. 2021" className="bg-gray-50 h-11" />
            {errors.year && <p className="text-sm text-red-500">{String(errors.year.message)}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
          <Textarea id="description" {...register('description')} rows={5} placeholder="Describe the equipment, its condition, and any special features..." className="bg-gray-50 resize-none" />
          {errors.description && <p className="text-sm text-red-500">{String(errors.description.message)}</p>}
        </div>
      </div>

      {/* Section 2: Pricing */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">2. Pricing & Deposit</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="hourly_price">Hourly Price (₹)</Label>
            <Input id="hourly_price" type="number" {...register('hourly_price')} placeholder="0" className="bg-gray-50 h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily_price">Daily Price (₹) <span className="text-red-500">*</span></Label>
            <Input id="daily_price" type="number" {...register('daily_price')} placeholder="Required" className="bg-gray-50 h-11" />
            {errors.daily_price && <p className="text-sm text-red-500">{String(errors.daily_price.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deposit">Security Deposit (₹)</Label>
            <Input id="deposit" type="number" {...register('deposit')} placeholder="0" className="bg-gray-50 h-11" />
          </div>
        </div>
      </div>

      {/* Section 3: Location */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">3. Location details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Full Address <span className="text-red-500">*</span></Label>
            <Input id="address" {...register('address')} placeholder="Where is the equipment located?" className="bg-gray-50 h-11" />
            {errors.address && <p className="text-sm text-red-500">{String(errors.address.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Village/City/Area <span className="text-red-500">*</span></Label>
            <Input id="location" {...register('location')} className="bg-gray-50 h-11" />
            {errors.location && <p className="text-sm text-red-500">{String(errors.location.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">District <span className="text-red-500">*</span></Label>
            <Input id="district" {...register('district')} className="bg-gray-50 h-11" />
            {errors.district && <p className="text-sm text-red-500">{String(errors.district.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
            <Input id="state" {...register('state')} className="bg-gray-50 h-11" />
            {errors.state && <p className="text-sm text-red-500">{String(errors.state.message)}</p>}
          </div>
        </div>
      </div>

      {/* Section 4: Images */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">4. Equipment Images <span className="text-red-500">*</span></h3>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="h-12 px-6"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="h-12 px-8 bg-primary hover:bg-primary/90 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving Equipment...
            </>
          ) : (
            'Submit for Approval'
          )}
        </Button>
      </div>
    </form>
  )
}
