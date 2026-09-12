'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export function CopyBookingId({ bookingNumber }: { bookingNumber: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingNumber)
      setCopied(true)
      toast.success(`Booking ID #${bookingNumber} copied to clipboard!`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy Booking ID')
    }
  }

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200/80 active:scale-95 text-gray-700 font-mono text-xs font-semibold transition-all select-none group"
      title="Click to copy booking reference"
      aria-label="Copy booking reference"
    >
      <span>#{bookingNumber}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600 animate-in zoom-in" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-700 transition-colors" />
      )}
    </button>
  )
}
