'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema } from '@/lib/validations/booking'
import { useCreateBooking } from '@/hooks/use-bookings'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar, 
  Clock, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Shield, 
  Zap,
  ArrowRight
} from 'lucide-react'

export function BookingForm({ equipment }: { equipment: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pricePreview, setPricePreview] = useState<{ rental: number, total: number, duration: number, type: string } | null>(null)
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<number | null>(1)
  
  const { mutateAsync: createBooking } = useCreateBooking()

  const { data: availability } = useQuery({
    queryKey: ['availability', equipment.id],
    queryFn: async () => {
      const res = await fetch(`/api/equipment/${equipment.id}/availability`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
  })

  // Date formatting helpers
  const toYMD = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const now = new Date()
  const todayStr = toYMD(now)

  // Smart initial dates
  const initialStartDate = new Date(now)
  if (now.getHours() >= 17) {
    initialStartDate.setDate(initialStartDate.getDate() + 1)
  }
  const initialEndDate = new Date(initialStartDate)
  initialEndDate.setDate(initialEndDate.getDate() + 1)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      equipment_id: equipment.id,
      start_date: toYMD(initialStartDate),
      start_time: '09:00',
      end_date: toYMD(initialEndDate),
      end_time: '18:00',
      notes: ''
    }
  })

  const startDate = watch('start_date')
  const startTime = watch('start_time')
  const endDate = watch('end_date')
  const endTime = watch('end_time')

  // Apply Quick Duration Presets
  const handlePresetClick = (days: number) => {
    setActivePreset(days)
    const baseStart = startDate ? new Date(startDate) : new Date(initialStartDate)
    const newEnd = new Date(baseStart)
    newEnd.setDate(baseStart.getDate() + days)
    
    setValue('end_date', toYMD(newEnd), { shouldValidate: true })
    setValue('end_time', '18:00', { shouldValidate: true })
  }

  // Dynamic client-side price preview
  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      const start = new Date(`${startDate}T${startTime}`)
      const end = new Date(`${endDate}T${endTime}`)
      
      if (start < end) {
        const diffMs = end.getTime() - start.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        const diffDays = Math.max(1, Math.ceil(diffHours / 24))
        
        let rentalAmount = 0
        let type = 'Days'
        let duration = diffDays
        
        if (diffHours <= 24 && equipment.hourly_price) {
          rentalAmount = equipment.hourly_price * Math.ceil(diffHours)
          type = 'Hours'
          duration = Math.ceil(diffHours)
        } else {
          rentalAmount = equipment.daily_price * duration
        }
        
        setPricePreview({
          rental: rentalAmount,
          total: rentalAmount + (equipment.deposit || 0),
          duration,
          type
        })
        return
      }
    }
    setPricePreview(null)
  }, [startDate, startTime, endDate, endTime, equipment])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Please login to request a booking')
        router.push(`/login?redirect=${encodeURIComponent(`/equipment/${equipment.id}`)}`)
        return
      }

      const bookingData = {
        equipment_id: data.equipment_id,
        start_date: data.start_date,
        start_time: data.start_time,
        end_date: data.end_date,
        end_time: data.end_time,
        notes: data.notes || undefined
      }

      const result = await createBooking(bookingData)
      setSuccessBookingId(result.data.id)
      toast.success('Booking request sent to owner!')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
      toast.error(err.message || 'Failed to request booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successBookingId) {
    return (
      <div className="py-8 text-center flex flex-col items-center">
        <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-600 shadow-inner">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">Booking Requested!</h2>
        <p className="text-gray-500 mb-6 max-w-sm text-xs sm:text-sm leading-relaxed">
          Your rental request for <strong className="text-gray-800">{equipment.title}</strong> has been sent to the owner. You'll receive confirmation shortly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
          <Button 
            onClick={() => router.push(`/dashboard/user/bookings/${successBookingId}`)} 
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            View My Booking
          </Button>
          <Button 
            onClick={() => router.push('/equipment')} 
            variant="outline"
            className="w-full h-11 font-bold text-xs rounded-xl"
          >
            Browse More Equipment
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-red-700 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* 1. Quick Duration Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Quick Duration
          </Label>
          <span className="text-[11px] text-gray-400 font-medium">Tap to auto-fill</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {[
            { label: '1 Day', days: 1 },
            { label: '2 Days', days: 2 },
            { label: '3 Days', days: 3 },
            { label: '1 Week', days: 7 }
          ].map((preset) => (
            <button
              key={preset.days}
              type="button"
              onClick={() => handlePresetClick(preset.days)}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all text-center border active:scale-95 ${
                activePreset === preset.days
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-600/20'
                  : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700 border-gray-200/90'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Compact Mobile-Friendly Start & End Period Cards */}
      <div className="space-y-3">
        {/* Start Card */}
        <div className="bg-gray-50/70 border border-gray-200/80 p-3.5 rounded-2xl space-y-2.5 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Rental Start (Pickup)
            </span>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-7">
              <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                Date
              </Label>
              <Input 
                type="date" 
                {...register('start_date')} 
                min={todayStr} 
                onChange={(e) => {
                  setActivePreset(null)
                  register('start_date').onChange(e)
                }}
                className="bg-white h-10 text-xs font-semibold rounded-xl border-gray-200 shadow-2xs" 
              />
              {errors.start_date && <p className="text-[11px] text-red-500 mt-1 font-medium">{String(errors.start_date.message)}</p>}
            </div>
            <div className="col-span-5">
              <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                Time
              </Label>
              <Input 
                type="time" 
                {...register('start_time')} 
                className="bg-white h-10 text-xs font-semibold rounded-xl border-gray-200 shadow-2xs" 
              />
              {errors.start_time && <p className="text-[11px] text-red-500 mt-1 font-medium">{String(errors.start_time.message)}</p>}
            </div>
          </div>
        </div>

        {/* End Card */}
        <div className="bg-gray-50/70 border border-gray-200/80 p-3.5 rounded-2xl space-y-2.5 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Rental End (Return)
            </span>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-7">
              <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                Date
              </Label>
              <Input 
                type="date" 
                {...register('end_date')} 
                min={startDate || todayStr} 
                onChange={(e) => {
                  setActivePreset(null)
                  register('end_date').onChange(e)
                }}
                className="bg-white h-10 text-xs font-semibold rounded-xl border-gray-200 shadow-2xs" 
              />
              {errors.end_date && <p className="text-[11px] text-red-500 mt-1 font-medium">{String(errors.end_date.message)}</p>}
            </div>
            <div className="col-span-5">
              <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                Time
              </Label>
              <Input 
                type="time" 
                {...register('end_time')} 
                className="bg-white h-10 text-xs font-semibold rounded-xl border-gray-200 shadow-2xs" 
              />
              {errors.end_time && <p className="text-[11px] text-red-500 mt-1 font-medium">{String(errors.end_time.message)}</p>}
            </div>
          </div>
        </div>
      </div>
      
      {/* Validation alert if end is before start */}
      {errors.end_time && !errors.end_date && (
        <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200/70">
          {String(errors.end_time.message)}
        </p>
      )}

      {/* Unavailable Dates Alert */}
      {availability && availability.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs">
          <p className="font-bold mb-1 flex items-center gap-1.5 text-amber-800">
            <AlertCircle className="h-3.5 w-3.5" /> Booked Dates
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-amber-800/90 text-[11px]">
            {availability.map((block: any, idx: number) => (
              <li key={idx}>
                {new Date(block.start_time).toLocaleDateString()} to {new Date(block.end_time).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Notes Field */}
      <div>
        <Label htmlFor="notes" className="text-xs font-bold text-gray-700 mb-1.5 block">
          Additional Notes <span className="font-normal text-gray-400">(Optional)</span>
        </Label>
        <Textarea 
          id="notes" 
          {...register('notes')} 
          placeholder="Delivery directions, field location, or implement requirements..." 
          className="resize-none bg-gray-50/80 text-xs rounded-xl border-gray-200 focus:bg-white focus:border-emerald-500" 
          rows={2} 
        />
        {errors.notes && <p className="text-xs text-red-500 mt-1">{String(errors.notes.message)}</p>}
      </div>

      {/* 4. Sleek Receipt Price Breakdown Card */}
      <div className="bg-gradient-to-br from-emerald-50/50 via-teal-50/20 to-white p-4 rounded-2xl border border-emerald-100 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1">
            <span>Price Summary</span>
          </h4>
          {pricePreview && (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              {pricePreview.duration} {pricePreview.type}
            </span>
          )}
        </div>
        
        {!pricePreview ? (
          <p className="text-xs text-gray-500 italic">Select rental dates to calculate total estimate.</p>
        ) : (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-600">
              <span>Rental Charge</span>
              <span className="font-bold text-gray-900">₹{pricePreview.rental.toLocaleString('en-IN')}</span>
            </div>

            {equipment.deposit > 0 && (
              <div className="flex justify-between items-center text-gray-600">
                <span className="flex items-center gap-1">
                  Security Deposit 
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/80 font-bold px-1 rounded">Refundable</span>
                </span>
                <span className="font-bold text-gray-900">₹{equipment.deposit.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2.5 mt-1 border-t border-emerald-200/60">
              <div className="flex flex-col">
                <span className="font-extrabold text-xs text-gray-900">Estimated Total</span>
                <span className="text-[10px] text-gray-500">Pay directly to owner</span>
              </div>
              <span className="text-emerald-700 text-xl font-black">
                ₹{pricePreview.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Guarantee Pill */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
        <Shield className="h-3.5 w-3.5 text-emerald-600" />
        <span>No immediate payment required • Owner verifies availability first</span>
      </div>

      {/* 5. Thumb-Friendly High-Contrast CTA Button */}
      <Button 
        type="submit" 
        disabled={isSubmitting || !pricePreview} 
        className="w-full h-12 sm:h-13 text-sm font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Sending Request...</>
        ) : (
          <>
            <span>Request Booking</span>
            {pricePreview && (
              <span className="opacity-90 font-bold">• ₹{pricePreview.total.toLocaleString('en-IN')}</span>
            )}
            <ArrowRight className="h-4 w-4 ml-0.5" />
          </>
        )}
      </Button>
    </form>
  )
}
