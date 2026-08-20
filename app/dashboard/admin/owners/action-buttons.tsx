'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { updateOwnerRequestAction } from '@/app/actions/admin'
import { Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function OwnerActionButtons({ requestId }: { requestId: string }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to mark this request as ${status}?`)) return
    
    setIsProcessing(status)
    try {
      const res = await updateOwnerRequestAction(requestId, status)
      if (!res.success) {
        toast.error(res.error || `Failed to ${status} request`)
      } else {
        toast.success(`Owner request ${status} successfully`)
      }
    } catch (e) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={() => handleAction('approved')}
        disabled={!!isProcessing}
      >
        {isProcessing === 'approved' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
        Approve
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => handleAction('rejected')}
        disabled={!!isProcessing}
      >
        {isProcessing === 'rejected' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
        Reject
      </Button>
    </div>
  )
}
