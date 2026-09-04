'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BookingForm } from './booking-form'
import { createClient } from '@/lib/supabase/client'
import { LogIn, Lock, MapPin, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export function BookingModal({ equipment, trigger }: { equipment: any; trigger?: React.ReactElement }) {
  const [open, setOpen] = useState(false)
  const [loginRequired, setLoginRequired] = useState(false)
  const router = useRouter()

  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen) {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoginRequired(true)
        setOpen(true)
        return
      }
      setLoginRequired(false)
    }
    setOpen(isOpen)
  }

  const primaryImage = equipment.equipment_images?.find((img: any) => img.is_primary)?.image_url 
                    || equipment.equipment_images?.[0]?.image_url 
                    || 'https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=600'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger || (
            <Button className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
              Request to Rent
            </Button>
          )
        }
      />
      <DialogContent className="w-full max-w-lg max-h-[94vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-2xl">
        {loginRequired ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-5">
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Lock className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Login Required</h2>
              <p className="text-gray-500 text-xs sm:text-sm max-w-sm">
                You need to be logged in to request an equipment booking. Please sign in to continue.
              </p>
            </div>
            <div className="flex gap-3 w-full max-w-xs">
              <Link href={`/login?redirect=${encodeURIComponent(`/equipment/${equipment.id}`)}`} className="flex-1">
                <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm gap-2 rounded-xl">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href={`/signup?redirect=${encodeURIComponent(`/equipment/${equipment.id}`)}`} className="flex-1">
                <Button variant="outline" className="w-full h-11 font-bold text-xs sm:text-sm rounded-xl">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                  <Image 
                    src={primaryImage} 
                    alt={equipment.title} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Instant Request</span>
                  </div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 truncate" title={equipment.title}>
                    Book {equipment.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="font-bold text-gray-900">₹{equipment.daily_price}/day</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                      {equipment.location || equipment.district}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <BookingForm equipment={equipment} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
