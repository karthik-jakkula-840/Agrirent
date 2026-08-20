'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cancelBookingAction } from '@/app/actions/booking'
import { Loader2 } from 'lucide-react'

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    setIsCancelling(true)
    setError(null)
    
    try {
      const res = await cancelBookingAction(bookingId)
      if (!res.success) {
        setError(res.error || 'Failed to cancel booking')
      }
    } catch (e) {
      setError('An unexpected error occurred')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div>
      <Button 
        variant="destructive" 
        onClick={handleCancel} 
        disabled={isCancelling}
        className="w-full"
      >
        {isCancelling ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...</> : 'Cancel Booking'}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
