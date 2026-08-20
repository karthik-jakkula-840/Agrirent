'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { acceptBookingAction, rejectBookingAction } from '@/app/actions/booking'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export function OwnerBookingActions({ bookingId }: { bookingId: string }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async (action: 'accept' | 'reject') => {
    if (action === 'reject' && !confirm('Are you sure you want to reject this booking request?')) return
    
    setIsProcessing(action)
    setError(null)
    
    try {
      const res = action === 'accept' ? await acceptBookingAction(bookingId) : await rejectBookingAction(bookingId)
      if (!res.success) {
        setError(res.error || `Failed to ${action} booking`)
      }
    } catch (e) {
      setError('An unexpected error occurred')
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <div className="space-y-3">
      <Button 
        onClick={() => handleAction('accept')} 
        disabled={isProcessing !== null}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {isProcessing === 'accept' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
        Accept Request
      </Button>
      <Button 
        variant="outline"
        onClick={() => handleAction('reject')} 
        disabled={isProcessing !== null}
        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
      >
        {isProcessing === 'reject' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
        Reject Request
      </Button>
      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
    </div>
  )
}
