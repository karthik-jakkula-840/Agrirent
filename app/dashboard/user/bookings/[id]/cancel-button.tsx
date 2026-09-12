'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cancelBookingAction } from '@/app/actions/booking'
import { Loader2, AlertTriangle, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CancelBookingButton({ 
  bookingId, 
  bookingNumber,
  className 
}: { 
  bookingId: string
  bookingNumber?: string
  className?: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleConfirmCancel = async () => {
    setIsCancelling(true)
    setError(null)
    
    try {
      const res = await cancelBookingAction(bookingId)
      if (!res.success) {
        setError(res.error || 'Failed to cancel booking')
        toast.error(res.error || 'Failed to cancel booking')
      } else {
        toast.success('Booking request cancelled')
        setIsOpen(false)
        router.refresh()
      }
    } catch (e) {
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button 
            variant="outline" 
            className={`w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-semibold text-xs sm:text-sm h-10 sm:h-11 rounded-xl transition-all shadow-2xs ${className || ''}`}
          >
            Cancel Booking Request
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md p-5 sm:p-6 rounded-2xl">
        <DialogHeader className="text-left space-y-2">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-1">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
            Cancel Booking Request?
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            {bookingNumber ? (
              <>Are you sure you want to cancel booking <span className="font-semibold text-gray-800">#{bookingNumber}</span>? This action cannot be reversed.</>
            ) : (
              'Are you sure you want to cancel this booking request? The equipment will be released and this cannot be undone.'
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isCancelling}
            className="w-full rounded-xl text-gray-700 border-gray-200 hover:bg-gray-50 h-10 sm:h-11 text-xs sm:text-sm font-semibold order-2 sm:order-1"
          >
            Keep Booking
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmCancel}
            disabled={isCancelling}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 sm:h-11 text-xs sm:text-sm font-semibold order-1 sm:order-2 shadow-xs"
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Yes, Cancel Booking'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
