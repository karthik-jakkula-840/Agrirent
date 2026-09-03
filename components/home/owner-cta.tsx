'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, TrendingUp, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
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
      targetUrl = '/owner-request'
    }
  }

  const benefits = [
    'Guaranteed Payouts',
    'Verified Local Renters',
    'Track Bookings Live',
    'Set Your Own Pricing',
    'Owner Dashboard & Stats',
    'Zero Listing Fees'
  ]

  return (
    <section className="py-10 sm:py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/20 to-white">
      {/* Decorative ambient blur */}
      <div className="absolute top-1/2 right-0 w-[450px] h-[450px] bg-emerald-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 md:p-12 lg:p-16 shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-emerald-100/80 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative overflow-hidden">
          
          {/* Top Green Accent Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-gradient-to-r from-[#009b55] via-emerald-400 to-[#009b55]" />
          
          {/* Left Content */}
          <div className="flex-1 max-w-2xl text-center sm:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebf8f1] border border-[#c3edd5] text-[#008f4c] text-[11px] sm:text-xs font-bold mb-3 shadow-xs">
              <TrendingUp className="h-3.5 w-3.5 text-[#009b55]" />
              <span>For Machinery Owners</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-950 mb-3 tracking-tight leading-tight">
              Turn Your Equipment Into <span className="text-[#009b55]">Extra Income</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed font-medium">
              List your tractors, harvesters, rotavators, or pumps on AgriRent. Connect with verified farmers in your district and earn safely whenever your machinery is idle.
            </p>
            
            {/* Benefits 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 mb-6 sm:mb-8 text-left">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-2.5 bg-gray-50/80 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-gray-100/80">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 text-[#009b55] flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-800 font-bold truncate">{benefit}</span>
                </div>
              ))}
            </div>
            
            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link href={targetUrl} className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-12 sm:h-14 px-8 text-sm sm:text-base font-extrabold rounded-2xl bg-[#009b55] hover:bg-[#00874a] text-white shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Become a Rental Owner</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#009b55]" />
                <span>Free listing • No hidden charges</span>
              </div>
            </div>
          </div>
          
          {/* Right Image Composition */}
          <div className="flex-1 w-full max-w-sm sm:max-w-md flex justify-center relative mt-2 lg:mt-0">
            <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-4 sm:border-8 border-white ring-1 ring-black/5 bg-gray-50">
              <Image 
                src="/mock_tractor.jpg" 
                alt="Agricultural Equipment Owner Tractor" 
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
              />
              
              {/* Floating Earning Pill */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-auto bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-gray-100 shadow-lg flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-[#009b55] flex items-center justify-center font-black text-sm shrink-0">
                  ₹
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-semibold">Average Owner Earnings</p>
                  <p className="text-xs sm:text-sm font-black text-gray-900">₹45,000+ <span className="text-xs font-semibold text-[#009b55]">/ month</span></p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
