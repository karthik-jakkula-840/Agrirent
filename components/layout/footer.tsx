import Link from 'next/link'
import { Tractor, Globe, Camera, MessageCircle, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white mb-6">
              <Tractor className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight">AGRIFORM</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              India's smart agricultural equipment rental marketplace. Connecting farmers with equipment owners for a better harvest.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Globe className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Camera className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors"><MessageCircle className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Video className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              <li><Link href="/equipment" className="hover:text-primary transition-colors">Equipment Rental</Link></li>
              <li><Link href="/signup?type=owner" className="hover:text-primary transition-colors">Equipment Owners</Link></li>
              <li><Link href="/bookings" className="hover:text-primary transition-colors">Booking</Link></li>
              <li><Link href="/payments" className="hover:text-primary transition-colors">Payments</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-3">
              <li><Link href="/categories/tractors" className="hover:text-primary transition-colors">Tractors</Link></li>
              <li><Link href="/categories/harvesters" className="hover:text-primary transition-colors">Harvesters</Link></li>
              <li><Link href="/categories/sprayers" className="hover:text-primary transition-colors">Sprayers</Link></li>
              <li><Link href="/categories/seeders" className="hover:text-primary transition-colors">Seeders</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3 mb-6">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
            </ul>
            <h3 className="text-white font-semibold mb-4">Newsletter</h3>
            <form className="flex flex-col gap-2">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary/90 text-white w-full">Subscribe</Button>
            </form>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; 2026 Agriform. All rights reserved.
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
