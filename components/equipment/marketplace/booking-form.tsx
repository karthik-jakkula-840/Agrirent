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
import { Calendar, Clock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export function BookingForm({ equipment }: { equipment: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pricePreview, setPricePreview] = useState<{ rental: number, total: number, duration: number, type: string } | null>(null)
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null)
  
  const { mutateAsync: createBooking } = useCreateBooking()

  const { data: availability, isLoading: isAvailabilityLoading } = useQuery({
    queryKey: ['availability', equipment.id],
    queryFn: async () => {
      const res = await fetch(`/api/equipment/${equipment.id}/availability`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      equipment_id: equipment.id,
      start_date: '',
      start_time: '09:00',
      end_date: '',
      end_time: '17:00',
      notes: ''
    }
  })

  const startDate = watch('start_date')
  const startTime = watch('start_time')
  const endDate = watch('end_date')
  const endTime = watch('end_time')

  // Dynamic client-side price preview
  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      const start = new Date(`${startDate}T${startTime}`)
      const end = new Date(`${endDate}T${endTime}`)
      
      if (start < end && start >= new Date()) {
        const diffMs = end.getTime() - start.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        const diffDays = Math.ceil(diffHours / 24)
        
        let rentalAmount = 0
        let type = 'Daily'
        let duration = diffDays > 0 ? diffDays : 1
        
        if (diffHours <= 24 && equipment.hourly_price) {
          rentalAmount = equipment.hourly_price * Math.ceil(diffHours)
          type = 'Hourly'
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
      toast.success('Booking requested successfully!')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
      toast.error(err.message || 'Failed to request booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successBookingId) {
    return (
      <div className="py-12 text-center flex flex-col items-center">
        <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Requested Successfully!</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Your request has been sent to the owner. You will be notified once they review and accept your booking.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => router.push(`/dashboard/user/bookings/${successBookingId}`)} className="bg-primary hover:bg-primary/90 text-white border-transparent">
            View Booking Status
          </Button>
          <Button onClick={() => router.push('/equipment')} variant="outline">
            Browse More
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700 text-sm font-medium">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Date & Time Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Calendar className="h-4 w-4 text-primary" /> Start Period
          </h3>
          <div className="space-y-3">
            <div>
              <Label>Start Date</Label>
              <Input type="date" {...register('start_date')} min={new Date().toISOString().split('T')[0]} className="mt-1 bg-gray-50 h-11" />
              {errors.start_date && <p className="text-xs text-red-500 mt-1">{String(errors.start_date.message)}</p>}
            </div>
            <div>
              <Label>Start Time</Label>
              <Input type="time" {...register('start_time')} className="mt-1 bg-gray-50 h-11" />
              {errors.start_time && <p className="text-xs text-red-500 mt-1">{String(errors.start_time.message)}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Clock className="h-4 w-4 text-primary" /> End Period
          </h3>
          <div className="space-y-3">
            <div>
              <Label>End Date</Label>
              <Input type="date" {...register('end_date')} min={startDate || new Date().toISOString().split('T')[0]} className="mt-1 bg-gray-50 h-11" />
              {errors.end_date && <p className="text-xs text-red-500 mt-1">{String(errors.end_date.message)}</p>}
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" {...register('end_time')} className="mt-1 bg-gray-50 h-11" />
              {errors.end_time && <p className="text-xs text-red-500 mt-1">{String(errors.end_time.message)}</p>}
            </div>
          </div>
        </div>
      </div>
      
      {/* Show cross-field validation error explicitly set on 'end_time' via refine path, or root errors */}
      {errors.end_time && !errors.end_date && (
        <p className="text-sm text-red-500">{String(errors.end_time.message)}</p>
      )}

      {/* Unavailable Dates Notification (Client-side visual cue) */}
      {availability && availability.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-sm">
          <p className="font-semibold mb-1 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> Unavailable Dates</p>
          <ul className="list-disc pl-5 opacity-80">
            {availability.map((block: any, idx: number) => (
              <li key={idx}>
                {new Date(block.start_time).toLocaleDateString()} to {new Date(block.end_time).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea 
          id="notes" 
          {...register('notes')} 
          placeholder="Any special requests or details about your rental needs..." 
          className="resize-none bg-gray-50" 
          rows={3} 
        />
        {errors.notes && <p className="text-xs text-red-500">{String(errors.notes.message)}</p>}
      </div>

      {/* Live Price Preview */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Price Estimate</h3>
        
        {!pricePreview ? (
          <p className="text-sm text-gray-500">Select valid start and end dates to see the estimated price.</p>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center text-gray-600">
              <span>Rental ({pricePreview.duration} {pricePreview.type})</span>
              <span className="font-medium text-gray-900">₹{pricePreview.rental}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Security Deposit (Refundable)</span>
              <span className="font-medium text-gray-900">₹{equipment.deposit || 0}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 text-base font-bold text-gray-900">
              <span>Total Estimated Amount</span>
              <span className="text-primary text-xl font-bold">₹{pricePreview.total}</span>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting || !pricePreview} className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg">
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting Request...</>
        ) : (
          'Request Booking'
        )}
      </Button>
    </form>
  )
}
