'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Star, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Hero() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')

  const heroItems = [
    { src: '/mock_tractor.jpg', alt: 'Modern Tractor in Field', title: 'Mahindra 575 DI', price: '500' },
    { src: '/mock_harvester.jpg', alt: 'Combine Harvester in Action', title: 'John Deere W70', price: '2500' },
    { src: '/mock_rotavator.jpg', alt: 'Heavy Duty Rotavator', title: 'Shaktiman Rotavator', price: '300' },
    { src: '/mock_trailer.jpg', alt: 'Farm Trailer', title: '5 Ton Tipper Trailer', price: '200' },
  ];

  const [activeItem, setActiveItem] = useState(heroItems[0]);

  useEffect(() => {
    const getDayOfYear = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };
    setActiveItem(heroItems[getDayOfYear() % heroItems.length]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    if (location) params.append('district', location)
    if (date) params.append('date', date)
    router.push(`/equipment?${params.toString()}`)
  }
  
  return (
    <section className="relative pt-24 pb-12 md:pt-40 md:pb-28 overflow-hidden bg-background">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div>
              <Badge variant="outline" className="bg-white/60 backdrop-blur-md text-emerald-700 border-white/40 shadow-sm mb-4 px-3 py-1 text-sm font-medium">
                India's Smart Equipment Rental Marketplace
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                Rent the Right Equipment.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Grow More with Agriform.</span>
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-lg">
              Discover and rent high-quality agricultural equipment from verified owners near you. Affordable, reliable, and built for your farm's success.
            </p>
            
            {/* Search Box */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSearch}
              className="bg-white/70 backdrop-blur-lg p-2 rounded-2xl shadow-xl border border-white/50 flex flex-col md:flex-row gap-2 mt-4 max-w-2xl relative z-20"
            >
              <div className="flex-[1.5] min-w-0 flex items-center bg-white/60 hover:bg-white/90 focus-within:bg-white/90 transition-all rounded-xl px-4 py-2 md:py-0 h-12 shadow-sm border border-white/60 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <Search className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
                <Select value={searchQuery} onValueChange={(val) => setSearchQuery(val || '')}>
                  <SelectTrigger className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 px-0 h-full w-full shadow-none whitespace-nowrap overflow-hidden min-w-0">
                    <SelectValue placeholder="What equipment do you need?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tractor">Tractor</SelectItem>
                    <SelectItem value="Harvester">Harvester</SelectItem>
                    <SelectItem value="Rotavator">Rotavator</SelectItem>
                    <SelectItem value="Drone">Agriculture Drone</SelectItem>
                    <SelectItem value="Trailer">Trailer</SelectItem>
                    <SelectItem value="Plough">Plough</SelectItem>
                    <SelectItem value="Seeder">Seeder</SelectItem>
                    <SelectItem value="Sprayer">Sprayer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 min-w-0 flex items-center bg-white/60 hover:bg-white/90 focus-within:bg-white/90 transition-all rounded-xl px-4 py-2 md:py-0 h-12 shadow-sm border border-white/60 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
                <Input 
                  id="hero-search-location"
                  type="text" 
                  placeholder="Location" 
                  aria-label="Location"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-full w-full shadow-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="flex-1 min-w-0 flex items-center bg-white/60 hover:bg-white/90 focus-within:bg-white/90 transition-all rounded-xl px-4 py-2 md:py-0 h-12 shadow-sm border border-white/60 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <Calendar className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
                <Input 
                  id="hero-search-date"
                  type="date" 
                  aria-label="Rental date"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-full w-full shadow-none text-gray-600"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              
              <Button type="submit" size="lg" className="h-14 md:h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg md:text-base px-8 shrink-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                <span className="md:hidden">RENT NOW</span>
                <span className="hidden md:inline">Search</span>
              </Button>
            </motion.form>
            
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-500">Popular: Tractor, Harvester, Drone</span>
            </div>
          </motion.div>
          
          {/* Right Image Composition */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[300px] sm:h-[400px] lg:h-[600px] w-full rounded-3xl mt-4 md:mt-0"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2.5rem] -rotate-3 scale-[1.02] -z-10" />
            
            <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image 
                key={activeItem.src}
                src={activeItem.src}
                alt={activeItem.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating Glass Card 1 */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-10 -left-6 md:-left-12 bg-white/60 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Verified Owner</p>
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-gray-500 ml-1">4.9</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Glass Card 2 - Hidden on small mobile */}
            <motion.div 
              key={activeItem.title}
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="hidden sm:flex absolute bottom-10 -right-4 md:bottom-20 md:-right-12 bg-white/60 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50 flex-col gap-1"
            >
              <Badge className="bg-primary text-white w-fit mb-1 border-transparent">Available Today</Badge>
              <p className="text-sm text-gray-500">{activeItem.title}</p>
              <p className="text-lg font-bold text-gray-900">₹{activeItem.price}<span className="text-xs font-normal text-gray-500">/hour</span></p>
            </motion.div>
          </motion.div>
          
        </div>
      </div>
    </section>
  )
}
