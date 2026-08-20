import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

interface OwnerCtaProps {
  userRole: 'customer' | 'owner' | 'admin' | null
  isAuthenticated: boolean
}

export function OwnerCta({ userRole, isAuthenticated }: OwnerCtaProps) {
  let targetUrl = '/signup?type=owner'
  
  if (isAuthenticated) {
    if (userRole === 'owner' || userRole === 'admin') {
      targetUrl = `/dashboard/${userRole}`
    } else {
      targetUrl = '/owner-request' // Future owner request flow
    }
  }

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-primary/10 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
          
          <div className="flex-1 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Turn Your Equipment Into Extra Income
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              List your agricultural equipment on Agriform and connect with farmers who need it. Earn securely while your machinery isn't in use.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                'Earn Extra Income',
                'Manage Your Equipment',
                'Track Bookings',
                'Secure Payments',
                'Owner Dashboard',
                'Verified Renters'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
            
            <Link href={targetUrl}>
              <Button size="lg" className="h-14 px-8 text-lg rounded-2xl bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/25">
                Become a Rental Owner
              </Button>
            </Link>
          </div>
          
          <div className="flex-1 w-full lg:w-auto flex justify-center relative">
            <div className="relative w-full max-w-md aspect-square rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-8 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-full shadow-2xl flex items-center justify-center p-8 overflow-hidden relative border-8 border-white">
                <Image 
                  src="https://images.unsplash.com/photo-1586771107445-d3afcb8da016?q=80&w=800&auto=format&fit=crop" 
                  alt="Happy Farmer" 
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
