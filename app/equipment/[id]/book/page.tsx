import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EquipmentService } from '@/services/equipment.service'
import { getCurrentUser } from '@/lib/supabase/auth'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BookingForm } from '@/components/equipment/marketplace/booking-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Request Booking | Agriform',
}

export default async function BookEquipmentPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const equipmentService = new EquipmentService(supabase)
  
  const user = await getCurrentUser()
  if (!user) {
    redirect(`/login?redirect=/equipment/${id}/book`)
  }

  let equipment: any
  try {
    equipment = await equipmentService.getEquipmentById(id)
  } catch (error) {
    notFound()
  }

  if (equipment.status !== 'approved' || equipment.owner_id === user.id) {
    redirect(`/equipment/${id}`)
  }

  const primaryImage = equipment.equipment_images?.find((img: any) => img.is_primary)?.image_url 
                       || equipment.equipment_images?.[0]?.image_url 
                       || 'https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=600'

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar />
      
      <main className="flex-1 w-full pb-20 pt-8">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <Link href={`/equipment/${id}`} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Equipment Details
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Form */}
            <div className="lg:col-span-8">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Booking</h1>
                <p className="text-gray-500 mb-8">Select your rental dates and times below.</p>
                
                <BookingForm equipment={equipment} />
              </div>
            </div>

            {/* Right Column: Equipment Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Equipment Summary</h2>
                
                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                    <Image src={primaryImage} alt={equipment.title} fill sizes="80px" className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-base">{equipment.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{equipment.location}</p>
                    <div className="flex items-center gap-1 mt-1 text-sm font-medium">
                      <StarIcon className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span>4.8</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Daily Rate</span>
                    <span className="font-medium text-gray-900">₹{equipment.daily_price}</span>
                  </div>
                  {equipment.hourly_price && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hourly Rate</span>
                      <span className="font-medium text-gray-900">₹{equipment.hourly_price}</span>
                    </div>
                  )}
                  {equipment.deposit > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Security Deposit</span>
                      <span className="font-medium text-gray-900">₹{equipment.deposit}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    You won't be charged until the owner accepts your request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function StarIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}
