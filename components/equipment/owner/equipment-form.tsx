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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
      {serverError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 font-medium text-sm">
          {serverError}
        </div>
      )}

      {/* Section 1: Basic Info */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-gray-150/80 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-[#009b55] text-xs font-black border border-emerald-100 shrink-0">
            01
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Basic Information</h3>
            <p className="text-[11px] sm:text-xs text-gray-500">Provide the title, brand, and key details</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="title" className="text-xs font-semibold text-gray-700">Equipment Title <span className="text-red-500">*</span></Label>
            <Input id="title" {...register('title')} placeholder="e.g. Mahindra 575 DI Tractor" className="bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
            {errors.title && <p className="text-xs text-red-500 font-medium">{String(errors.title.message)}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-semibold text-gray-700">Category <span className="text-red-500">*</span></Label>
            <Input id="category" {...register('category')} placeholder="e.g. Tractors, Harvesters" className="bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
            {errors.category && <p className="text-xs text-red-500 font-medium">{String(errors.category.message)}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand" className="text-xs font-semibold text-gray-700">Brand / Manufacturer</Label>
            <Input id="brand" {...register('brand')} placeholder="e.g. Mahindra" className="bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model" className="text-xs font-semibold text-gray-700">Model</Label>
            <Input id="model" {...register('model')} placeholder="e.g. 575 DI" className="bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year" className="text-xs font-semibold text-gray-700">Manufacturing Year</Label>
            <Input id="year" type="number" {...register('year')} placeholder="e.g. 2021" className="bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
            {errors.year && <p className="text-xs text-red-500 font-medium">{String(errors.year.message)}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-semibold text-gray-700">Description <span className="text-red-500">*</span></Label>
          <Textarea id="description" {...register('description')} rows={4} placeholder="Describe the equipment, its condition, and any special features..." className="bg-gray-50/70 rounded-xl text-sm sm:text-base focus:bg-white resize-none transition-all" />
          {errors.description && <p className="text-xs text-red-500 font-medium">{String(errors.description.message)}</p>}
        </div>
      </div>

      {/* Section 2: Pricing */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-gray-150/80 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-[#009b55] text-xs font-black border border-emerald-100 shrink-0">
            02
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Pricing & Deposit</h3>
            <p className="text-[11px] sm:text-xs text-gray-500">Set competitive daily and hourly rental rates</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="hourly_price" className="text-xs font-semibold text-gray-700">Hourly Price (₹)</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm pointer-events-none">₹</span>
              <Input id="hourly_price" type="number" {...register('hourly_price')} placeholder="0" className="pl-8 bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="daily_price" className="text-xs font-semibold text-gray-700">Daily Price (₹) <span className="text-red-500">*</span></Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm pointer-events-none">₹</span>
              <Input id="daily_price" type="number" {...register('daily_price')} placeholder="Required" className="pl-8 bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
            </div>
            {errors.daily_price && <p className="text-xs text-red-500 font-medium">{String(errors.daily_price.message)}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deposit" className="text-xs font-semibold text-gray-700">Security Deposit (₹)</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm pointer-events-none">₹</span>
              <Input id="deposit" type="number" {...register('deposit')} placeholder="0" className="pl-8 bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Location */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-gray-150/80 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-[#009b55] text-xs font-black border border-emerald-100 shrink-0">
            03
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Location Details</h3>
            <p className="text-[11px] sm:text-xs text-gray-500">Where the equipment is kept for pickup</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="address" className="text-xs font-semibold text-gray-700">Full Address <span className="text-red-500">*</span></Label>
            <Input id="address" {...register('address')} placeholder="Where is the equipment located?" className="bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
            {errors.address && <p className="text-xs text-red-500 font-medium">{String(errors.address.message)}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-semibold text-gray-700">Village / City / Area <span className="text-red-500">*</span></Label>
            <Input id="location" {...register('location')} className="bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
            {errors.location && <p className="text-xs text-red-500 font-medium">{String(errors.location.message)}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="district" className="text-xs font-semibold text-gray-700">District <span className="text-red-500">*</span></Label>
            <Input id="district" {...register('district')} className="bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
            {errors.district && <p className="text-xs text-red-500 font-medium">{String(errors.district.message)}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-xs font-semibold text-gray-700">State <span className="text-red-500">*</span></Label>
            <Input id="state" {...register('state')} className="bg-gray-50/70 h-11 text-sm sm:text-base rounded-xl focus:bg-white transition-all" />
            {errors.state && <p className="text-xs text-red-500 font-medium">{String(errors.state.message)}</p>}
          </div>
        </div>
      </div>

      {/* Section 4: Images */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-gray-150/80 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-[#009b55] text-xs font-black border border-emerald-100 shrink-0">
            04
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Equipment Images <span className="text-red-500">*</span></h3>
            <p className="text-[11px] sm:text-xs text-gray-500">Add up to 5 clear photos to attract renters</p>
          </div>
        </div>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2 sm:pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="h-11 sm:h-12 px-6 rounded-xl text-sm font-semibold border-gray-200 hover:bg-gray-50 active:scale-98 transition-all"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="h-11 sm:h-12 px-8 bg-[#009b55] hover:bg-[#008649] text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-700/15 active:scale-98 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
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
