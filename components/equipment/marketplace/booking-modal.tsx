'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BookingForm } from './booking-form'
import { createClient } from '@/lib/supabase/client'
import { LogIn, Lock } from 'lucide-react'
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
        {loginRequired ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
              <p className="text-gray-500 max-w-sm">
                You need to be logged in to request equipment rental. Please sign in to continue.
              </p>
            </div>
            <div className="flex gap-3 w-full max-w-xs">
              <Link href={`/login?redirect=${encodeURIComponent(`/equipment/${equipment.id}`)}`} className="flex-1">
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href={`/signup?redirect=${encodeURIComponent(`/equipment/${equipment.id}`)}`} className="flex-1">
                <Button variant="outline" className="w-full h-12 font-semibold">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4 text-gray-900">Book {equipment.title}</DialogTitle>
            </DialogHeader>
            <BookingForm equipment={equipment} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
