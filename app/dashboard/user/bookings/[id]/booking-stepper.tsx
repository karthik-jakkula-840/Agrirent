'use client'

import { Check, Clock, CreditCard, Send, Tractor, X } from 'lucide-react'

interface BookingStepperProps {
  bookingStatus: 'pending' | 'accepted' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | string
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed' | string
}

export function BookingStepper({ bookingStatus, paymentStatus }: BookingStepperProps) {
  const isCancelled = bookingStatus === 'cancelled' || bookingStatus === 'rejected'

  const steps = [
    {
      id: 1,
      name: 'Requested',
      description: 'Request submitted',
      icon: Send,
      isDone: true,
      isCurrent: false,
      isFailed: false,
    },
    {
      id: 2,
      name: 'Owner Review',
      description: isCancelled 
        ? (bookingStatus === 'rejected' ? 'Declined by owner' : 'Booking cancelled')
        : bookingStatus === 'pending' ? 'Reviewing request' : 'Request approved',
      icon: Clock,
      isDone: ['accepted', 'confirmed', 'completed'].includes(bookingStatus),
      isCurrent: bookingStatus === 'pending',
      isFailed: isCancelled,
    },
    {
      id: 3,
      name: 'Payment',
      description: ['confirmed', 'completed'].includes(bookingStatus) || paymentStatus === 'paid'
        ? 'Payment verified'
        : bookingStatus === 'accepted' ? 'Payment required' : 'Pending approval',
      icon: CreditCard,
      isDone: ['confirmed', 'completed'].includes(bookingStatus) || paymentStatus === 'paid',
      isCurrent: bookingStatus === 'accepted' && paymentStatus !== 'paid',
      isFailed: isCancelled,
    },
    {
      id: 4,
      name: 'Handover',
      description: bookingStatus === 'completed'
        ? 'Rental completed'
        : bookingStatus === 'confirmed' ? 'Ready for pickup' : 'Upcoming handover',
      icon: Tractor,
      isDone: bookingStatus === 'completed',
      isCurrent: bookingStatus === 'confirmed',
      isFailed: isCancelled,
    },
  ]

  return (
    <div className="w-full py-2">
      {/* Mobile & Desktop Stepper */}
      <div className="relative flex items-center justify-between">
        {/* Connector line behind */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 z-0" />
        
        {steps.map((step, idx) => {
          let nodeClasses = 'bg-white border-2 border-gray-300 text-gray-400'
          let lineStatus = 'bg-gray-200'

          if (step.isFailed && step.isCurrent) {
            nodeClasses = 'bg-red-500 border-red-500 text-white shadow-sm ring-4 ring-red-100'
          } else if (step.isDone) {
            nodeClasses = 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
          } else if (step.isCurrent) {
            nodeClasses = 'bg-amber-500 border-amber-500 text-white shadow-sm ring-4 ring-amber-100 animate-pulse'
          }

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group flex-1">
              <div 
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 ${nodeClasses}`}
              >
                {step.isFailed ? (
                  <X className="w-4 h-4" />
                ) : step.isDone ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <step.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </div>

              <div className="text-center mt-2 px-1">
                <p className={`text-[11px] sm:text-xs font-bold whitespace-nowrap ${
                  step.isFailed ? 'text-red-600' :
                  step.isDone ? 'text-emerald-700' :
                  step.isCurrent ? 'text-amber-700 font-extrabold' : 'text-gray-400'
                }`}>
                  {step.name}
                </p>
                <p className="hidden sm:block text-[10px] text-gray-500 mt-0.5 max-w-[90px] leading-tight">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
