'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BookingForm } from './booking-form'

export function BookingModal({ equipment }: { equipment: any }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
            Request to Rent
          </Button>
        }
      />
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4 text-gray-900">Book {equipment.title}</DialogTitle>
        </DialogHeader>
        <BookingForm equipment={equipment} />
      </DialogContent>
    </Dialog>
  )
}
