'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, type LucideIcon } from 'lucide-react'

import { ReactNode } from 'react'

interface CategoryCardProps {
  id: string
  name: string
  count: number
  icon: ReactNode
}

export function CategoryCard({ id, name, count, icon }: CategoryCardProps) {
  return (
    <Link href={`/equipment?category=${id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
        
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            {icon}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-500 mb-4">{count} Equipment available</p>
          
          <div className="flex items-center text-sm font-medium text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
            Explore Category <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
