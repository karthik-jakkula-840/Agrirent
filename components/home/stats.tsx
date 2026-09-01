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
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center text-center p-4 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <stat.icon className="h-6 w-6" />
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
