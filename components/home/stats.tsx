'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Tractor, MapPin, ShieldCheck } from 'lucide-react'

const stats = [
  { id: 1, name: 'Farmers', value: '5000+', icon: Users },
  { id: 2, name: 'Equipment Brands', value: '200+', icon: Tractor },
  { id: 3, name: 'Cities', value: '50+', icon: MapPin },
  { id: 4, name: 'Rental Owners', value: '1000+', icon: ShieldCheck },
]

export function Stats() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] hover:-translate-y-1.5 transition-all duration-300 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                <stat.icon className="h-7 w-7" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </p>
              <p className="text-sm md:text-base font-medium text-gray-500">
                {stat.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
