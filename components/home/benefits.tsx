'use client'

import { motion } from 'framer-motion'
import { 
  ShieldCheck, 
  IndianRupee, 
  Zap, 
  Lock, 
  Headphones, 
  MapPin, 
  CheckCircle2,
  Sparkles
} from 'lucide-react'

const benefits = [
  {
    id: 1,
    title: 'Verified Owners',
    badge: '100% Verified',
    description: 'Every equipment owner undergoes strict identity & machinery quality checks before listing.',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    id: 2,
    title: 'Affordable Prices',
    badge: 'Zero Hidden Fees',
    description: 'Transparent hourly & daily rates directly from local owners with no surprise charges.',
    icon: IndianRupee,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    id: 3,
    title: 'Instant Booking',
    badge: 'Fast & Simple',
    description: 'Rent agricultural machinery in under 2 minutes. Pick your dates and confirm seamlessly.',
    icon: Zap,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    id: 4,
    title: 'Secure Payments',
    badge: 'Escrow Protected',
    description: 'Payments are safely held in escrow and released only after equipment inspection.',
    icon: Lock,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    id: 5,
    title: '24/7 Farmer Support',
    badge: 'Always Here',
    description: 'Dedicated agricultural support experts available round the clock in your regional language.',
    icon: Headphones,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    id: 6,
    title: 'GPS Tracking',
    badge: 'Live Location',
    description: 'Track equipment transit and field work in real-time with integrated GPS for full peace of mind.',
    icon: MapPin,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function Benefits() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white via-[#fbfdfc] to-white relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebf8f1] border border-[#c3edd5] text-[#008f4c] text-[11px] sm:text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#009b55]" />
            <span>Why Farmers Trust Us</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-950 tracking-tight leading-tight mb-2.5">
            Why Choose <span className="text-[#009b55]">Agriform</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 leading-relaxed font-normal px-2">
            We are revolutionizing agricultural equipment rentals across India with verified owners, transparent prices, and complete rental security.
          </p>
        </div>

        {/* Benefits Grid: Mobile-optimized horizontal card on mobile, vertical card on desktop */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6 max-w-6xl mx-auto"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.id}
                variants={itemVariants}
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-emerald-200/80 transition-all duration-300 flex items-start sm:flex-col gap-3.5 sm:gap-4 group"
              >
                {/* Icon */}
                <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl ${benefit.bg} ${benefit.border} border flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${benefit.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-[#009b55] transition-colors truncate">
                      {benefit.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 shrink-0">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                      {benefit.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
