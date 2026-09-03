'use client'

import { motion } from 'framer-motion'
import { 
  Search, 
  CheckCircle2, 
  Calendar, 
  Send, 
  CreditCard, 
  Tractor,
  Sparkles,
  ArrowRight
} from 'lucide-react'

const steps = [
  { 
    num: '01', 
    title: 'Search Equipment', 
    desc: 'Browse tractors, rotavators, harvesters, and tools near your farm location with real-time availability.',
    icon: Search,
    highlight: 'Find nearby'
  },
  { 
    num: '02', 
    title: 'Compare & Choose', 
    desc: 'Review verified owner profiles, machine specifications, customer ratings, and transparent daily rates.',
    icon: CheckCircle2,
    highlight: 'Verified gear'
  },
  { 
    num: '03', 
    title: 'Select Rental Dates', 
    desc: 'Pick your exact start and end dates with upfront pricing and zero hidden fees.',
    icon: Calendar,
    highlight: 'Flexible dates'
  },
  { 
    num: '04', 
    title: 'Send Booking Request', 
    desc: 'Submit your reservation in one click. The owner is notified instantly via SMS and WhatsApp.',
    icon: Send,
    highlight: 'Instant request'
  },
  { 
    num: '05', 
    title: 'Approval & Escrow Pay', 
    desc: 'Once approved, complete payment securely held in escrow until machinery handover.',
    icon: CreditCard,
    highlight: '100% secure'
  },
  { 
    num: '06', 
    title: 'Pickup & Cultivate', 
    desc: 'Inspect equipment, complete field work efficiently, and return safely when your rental ends.',
    icon: Tractor,
    highlight: 'Smooth handover'
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

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-white via-gray-50/40 to-white overflow-hidden relative">
      {/* Subtle Background Glow Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-50/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebf8f1] border border-[#c3edd5] text-[#008f4c] text-[11px] sm:text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#009b55]" />
            <span>Simple 6-Step Process</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-950 tracking-tight leading-tight mb-2.5">
            How <span className="text-[#009b55]">Agriform</span> Works
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 leading-relaxed max-w-xl mx-auto px-2">
            A transparent, reliable rental journey designed for Indian farmers. Get the machinery you need in 6 straightforward steps.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Mobile Vertical Connected Line */}
          <div className="md:hidden absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#009b55] via-emerald-300 to-emerald-100" />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-3.5 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 lg:gap-6"
          >
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.num}
                  variants={itemVariants}
                  className="flex items-start gap-3.5 md:flex-col relative group"
                >
                  {/* Step Node Icon */}
                  <div className="h-10 w-10 sm:h-11 sm:w-11 md:h-14 md:w-14 rounded-2xl bg-[#009b55] text-white flex items-center justify-center font-black text-xs md:text-base shrink-0 shadow-sm shadow-emerald-600/25 ring-4 ring-[#eaf7f0] md:ring-8 md:ring-emerald-50 relative z-10 md:mb-3 group-hover:scale-105 transition-transform">
                    {step.num}
                  </div>

                  {/* Step Card Content */}
                  <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-emerald-200 transition-all duration-300 w-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-xl bg-emerald-50 text-[#009b55] flex items-center justify-center shrink-0 border border-emerald-100/60">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#009b55] transition-colors">
                            {step.title}
                          </h3>
                        </div>

                        <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-100/70">
                          {step.highlight}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-gray-50 flex items-center justify-between sm:hidden">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-100/60">
                        {step.highlight}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-[#009b55] transition-colors" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
