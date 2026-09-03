'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  MapPin, 
  LocateFixed, 
  Tractor, 
  Droplets, 
  LayoutGrid, 
  ShieldCheck, 
  Award, 
  Headphones,
  X,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

// Custom Implements (Cultivator) Icon
function ImplementsIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4 6h16" />
      <path d="M7 6v10l-2 2" />
      <path d="M12 6v10l-2 2" />
      <path d="M17 6v10l-2 2" />
      <path d="M12 2v4" />
    </svg>
  )
}

// Custom Agricultural Drone Icon
function DroneIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="m4.93 4.93 4.24 4.24" />
      <path d="m14.83 14.83 4.24 4.24" />
      <path d="m14.83 9.17 4.24-4.24" />
      <path d="m4.93 19.07 4.24-4.24" />
      <circle cx="4" cy="4" r="2" />
      <circle cx="20" cy="4" r="2" />
      <circle cx="4" cy="20" r="2" />
      <circle cx="20" cy="20" r="2" />
    </svg>
  )
}

export function MobileLandingView() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [isLocating, setIsLocating] = useState(false)

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.append('search', searchQuery.trim())
    if (location.trim()) params.append('district', location.trim())
    router.push(`/equipment${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocation('Hyderabad, Telangana')
      toast.success('Location set to Hyderabad, Telangana')
      return
    }

    setIsLocating(true)
    toast.info('Detecting your location...')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        setLocation('Telangana, India')
        toast.success('Location set to your current area')
      },
      () => {
        setIsLocating(false)
        setLocation('Telangana, India')
        toast.success('Default location set: Telangana, India')
      },
      { timeout: 5000 }
    )
  }

  const categories = [
    {
      name: 'Tractors',
      href: '/equipment?category=tractors',
      icon: <Tractor className="h-6 w-6 text-[#009b55]" />
    },
    {
      name: 'Implements',
      href: '/equipment?category=tillage-equipment',
      icon: <ImplementsIcon className="h-6 w-6 text-[#009b55]" />
    },
    {
      name: 'Pumps',
      href: '/equipment?category=irrigation',
      icon: <Droplets className="h-6 w-6 text-[#009b55]" />
    },
    {
      name: 'Drones',
      href: '/equipment?category=precision-ag',
      icon: <DroneIcon className="h-6 w-6 text-[#009b55]" />
    },
    {
      name: 'More',
      href: '/categories',
      icon: <LayoutGrid className="h-6 w-6 text-[#009b55]" />
    }
  ]

  const popularEquipment = [
    {
      id: 'mock-1',
      name: 'John Deere 5050D',
      category: 'Tractor',
      price: '₹1,200 / hour',
      distance: '2.4 km away',
      image: '/images/john_deere_5050d.jpg',
      href: '/equipment/mock-1'
    },
    {
      id: 'mock-3',
      name: 'Shaktiman Rotavator',
      category: 'Rotavator',
      price: '₹700 / hour',
      distance: '3.1 km away',
      image: '/images/shaktiman_rotavator.jpg',
      href: '/equipment/mock-3'
    },
    {
      id: 'mock-2',
      name: 'Crompton Water Pump',
      category: 'Water Pump',
      price: '₹500 / hour',
      distance: '1.8 km away',
      image: '/images/crompton_water_pump.jpg',
      href: '/equipment/mock-2'
    }
  ]

  return (
    <div className="md:hidden flex flex-col bg-gradient-to-b from-[#f3faf6] via-[#fafdfb] to-white pt-20 pb-8 px-4 font-sans">
      {/* Hero Section */}
      <div className="pt-2 pb-4">
        {/* Badge Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ebf8f1] border border-[#c3edd5] text-[#008f4c] text-xs sm:text-sm font-bold mb-3 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-[#009b55]" />
          <span>India's Smart Equipment Rental Marketplace</span>
        </div>

        {/* Headline + Tractor Circle Composition */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 pr-1">
            <h1 className="text-[28px] sm:text-[32px] font-black tracking-tight text-gray-950 leading-[1.18] mb-2.5">
              Rent the Right Equipment.<br />
              <span className="text-[#009b55]">Grow More with Agriform.</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
              Affordable, reliable & high-quality equipment rental near you.
            </p>
          </div>

          {/* Right Circular Tractor in Field Illustration */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 -mr-2 shrink-0 self-center">
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-xl border-4 border-white ring-1 ring-black/5">
              <Image 
                src="/images/hero_tractor_field.jpg" 
                alt="Modern Green Tractor in Agricultural Field" 
                fill 
                priority
                sizes="(max-width: 768px) 180px, 220px"
                className="object-cover scale-110"
              />
            </div>
          </div>
        </div>

        {/* Search & Location Card */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-gray-100 space-y-3 mt-5">
          {/* Row 1: Search */}
          <div className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50/70 rounded-2xl border border-gray-100">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search equipment (e.g. Tractor, Rotavator)"
              className="w-full bg-transparent text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Row 2: Location */}
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-gray-50/70 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
              <input 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your location"
                className="w-full bg-transparent text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
              />
              {location && (
                <button 
                  type="button" 
                  onClick={() => setLocation('')}
                  className="text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <button
              type="button"
              onClick={handleDetectLocation}
              title="Detect current location"
              aria-label="Detect current location"
              className={`p-1 text-[#009b55] hover:bg-emerald-50 rounded-lg transition-colors shrink-0 ${isLocating ? 'animate-pulse' : ''}`}
            >
              <LocateFixed className="h-5 w-5" />
            </button>
          </div>

          {/* Row 3: Search Button */}
          <button
            type="button"
            onClick={() => handleSearch()}
            className="w-full py-3.5 bg-[#009b55] hover:bg-[#00874a] active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-sm shadow-emerald-600/25 transition-all text-center flex items-center justify-center gap-2"
          >
            Search Equipment
          </button>
        </div>
      </div>

      {/* Browse by Category Section */}
      <div className="pt-6 pb-2">
        <div className="flex items-center justify-between mb-3.5 px-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-950 tracking-tight">
            Browse by Category
          </h2>
          <Link href="/categories" className="text-sm font-bold text-[#009b55] hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {categories.map((cat) => (
            <Link 
              key={cat.name}
              href={cat.href}
              className="bg-white border border-gray-100 rounded-2xl py-3 px-1 flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-95 transition-all text-center group"
            >
              <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                {cat.icon}
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-800 tracking-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Equipment Section */}
      <div className="pt-6 pb-2">
        <div className="flex items-center justify-between mb-3.5 px-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-950 tracking-tight">
            Popular Equipment
          </h2>
          <Link href="/equipment" className="text-sm font-bold text-[#009b55] hover:underline">
            View all
          </Link>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
          {popularEquipment.map((item) => (
            <Link 
              key={item.name}
              href={item.href}
              className="w-[195px] min-w-[195px] bg-white rounded-3xl border border-gray-100 p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-md active:scale-[0.98] transition-all flex flex-col justify-between snap-start"
            >
              <div>
                <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-white mb-3 flex items-center justify-center">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    sizes="195px" 
                    className="object-contain p-1" 
                  />
                </div>
                <h3 className="font-bold text-gray-950 text-sm sm:text-base truncate">{item.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mb-2">{item.category}</p>
                <p className="text-sm sm:text-base font-black text-[#009b55]">
                  {item.price}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-2.5 pt-2.5 border-t border-gray-100">
                <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>{item.distance}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trust / Feature Banner */}
      <div className="bg-[#eef8f2] rounded-2xl p-3 border border-emerald-100/80 grid grid-cols-3 gap-1.5 mt-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-[#009b55]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-extrabold text-gray-900 leading-tight">Verified Owners</p>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">100% verified</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-[#009b55]">
            <Award className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-extrabold text-gray-900 leading-tight">Quality Gear</p>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Well maintained</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-[#009b55]">
            <Headphones className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-extrabold text-gray-900 leading-tight">24/7 Support</p>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Always here</p>
          </div>
        </div>
      </div>
    </div>
  )
}
