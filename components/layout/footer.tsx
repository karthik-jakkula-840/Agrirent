'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { Tractor, Globe, Camera, MessageCircle, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  return (
    <footer className="hidden md:block bg-gray-900 text-gray-300 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          
          {/* Brand & Social - Takes 2 cols on lg */}
          <div className="lg:col-span-2 flex flex-col items-center text-center md:items-start md:text-left">
            <Link href="/" className="flex items-center gap-2 text-white mb-6">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Tractor className="h-7 w-7 text-primary" />
              </div>
              <span className="text-2xl font-black tracking-tight">Agri<span className="text-[#009b55]">Rent</span></span>
            </Link>
            <p className="text-gray-400 mb-8 max-w-sm text-sm leading-relaxed">
              India's smart agricultural equipment rental marketplace. Connecting farmers with equipment owners for a better harvest.
            </p>
            <div className="flex items-center gap-5">
              <Link href="https://agriform.in" target="_blank" rel="noopener noreferrer" aria-label="Website" className="text-gray-400 hover:text-primary transition-colors bg-gray-800 p-2.5 rounded-full"><Globe className="h-4 w-4" /></Link>
              <Link href="https://instagram.com/agriform" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-primary transition-colors bg-gray-800 p-2.5 rounded-full"><Camera className="h-4 w-4" /></Link>
              <Link href="https://wa.me/910000000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-400 hover:text-primary transition-colors bg-gray-800 p-2.5 rounded-full"><MessageCircle className="h-4 w-4" /></Link>
              <Link href="https://youtube.com/@agriform" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-gray-400 hover:text-primary transition-colors bg-gray-800 p-2.5 rounded-full"><Video className="h-4 w-4" /></Link>
            </div>
          </div>

          {/* Links Grid - 2 columns on mobile, 3 on lg */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Services</h3>
              <ul className="space-y-3.5 text-sm">
                <li><Link href="/equipment" className="hover:text-primary transition-colors text-gray-400">Equipment Rental</Link></li>
                <li><Link href="/signup?type=owner" className="hover:text-primary transition-colors text-gray-400">Equipment Owners</Link></li>
                <li><Link href="/dashboard/user/bookings" className="hover:text-primary transition-colors text-gray-400">My Bookings</Link></li>
                <li><Link href="/dashboard/user/payments" className="hover:text-primary transition-colors text-gray-400">Payments</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Categories</h3>
              <ul className="space-y-3.5 text-sm">
                <li><Link href="/equipment?category=tractors" className="hover:text-primary transition-colors text-gray-400">Tractors</Link></li>
                <li><Link href="/equipment?category=harvesters" className="hover:text-primary transition-colors text-gray-400">Harvesters</Link></li>
                <li><Link href="/equipment?category=sprayers" className="hover:text-primary transition-colors text-gray-400">Sprayers</Link></li>
                <li><Link href="/equipment?category=seeders" className="hover:text-primary transition-colors text-gray-400">Seeders</Link></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Company</h3>
              <ul className="space-y-3.5 text-sm">
                <li><Link href="/about" className="hover:text-primary transition-colors text-gray-400">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors text-gray-400">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors text-gray-400">Careers</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter - 1 col on lg */}
          <div className="lg:col-span-1 flex flex-col items-center md:items-start">
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Newsletter</h3>
            <form 
              className="flex flex-col gap-3 w-full max-w-sm"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Successfully subscribed to newsletter!');
                (e.target as HTMLFormElement).reset();
              }}
            >
              <Input 
                type="email" 
                required
                placeholder="Your email address" 
                aria-label="Newsletter email address"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-primary h-11"
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white w-full h-11">Subscribe</Button>
            </form>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AgriRent. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
