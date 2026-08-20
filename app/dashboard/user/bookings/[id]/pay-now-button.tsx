'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { QrCode, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { confirmPaymentAction } from '@/app/actions/booking'

interface PayNowButtonProps {
  bookingId: string
  amount: number
  ownerPhone?: string
  ownerName?: string
}

export function PayNowButton({ bookingId, amount, ownerPhone, ownerName }: PayNowButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  // Generate a mock UPI ID based on phone number or a default
  const upiId = ownerPhone ? `${ownerPhone}@ybl` : 'agrirent@phonepe'
  
  // Create a standard UPI payment URL
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(ownerName || 'Equipment Owner')}&am=${amount}&cu=INR`
  
  // Use a free QR code generation API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`

  const handleSimulatePayment = async () => {
    setIsProcessing(true)
    
    try {
      // Create actual payment transaction and confirm booking
      const res = await confirmPaymentAction(bookingId)
      
      if (!res.success) {
        throw new Error(res.error || 'Failed to confirm payment')
      }
      
      setIsSuccess(true)
      toast.success('Payment successful! Booking confirmed.')
      
      // Refresh the page after a short delay
      setTimeout(() => {
        setIsOpen(false)
        router.refresh()
      }, 1500)
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        render={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            Pay ₹{amount} Now
          </Button>
        } 
      />
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Pay with PhonePe</DialogTitle>
          <DialogDescription className="text-center">
            Scan the QR code to pay the owner directly
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          {!isSuccess ? (
            <>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={qrCodeUrl} 
                  alt="PhonePe Payment QR Code" 
                  className="w-[200px] h-[200px]"
                />
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Paying to</p>
                <p className="font-semibold">{ownerName || 'Equipment Owner'}</p>
                <p className="text-lg font-bold text-blue-600 mt-2">₹{amount}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg w-full">
                <QrCode className="h-5 w-5 shrink-0" />
                <p>Open PhonePe or any UPI app to scan and pay</p>
              </div>

              <Button 
                onClick={handleSimulatePayment} 
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Payment...</>
                ) : (
                  'I have paid'
                )}
              </Button>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in duration-300" />
              <h3 className="text-xl font-bold text-gray-900">Payment Received!</h3>
              <p className="text-gray-500">Your booking is being confirmed...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
