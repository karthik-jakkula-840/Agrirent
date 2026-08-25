'use client'

import { motion } from 'framer-motion'

const steps = [
  { num: '01', title: 'Search Equipment', desc: 'Find exactly what you need.' },
  { num: '02', title: 'Choose Your Equipment', desc: 'Compare verified options.' },
  { num: '03', title: 'Select Rental Dates', desc: 'Pick your required timeframe.' },
  { num: '04', title: 'Send Booking Request', desc: 'Secure your booking instantly.' },
  { num: '05', title: 'Owner Approval', desc: 'Get fast confirmation.' },
  { num: '06', title: 'Pickup & Return', desc: 'Work efficiently and return safely.' },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background overflow-hidden relative">
      {/* Decorative background circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gray-200 rounded-full opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-gray-200 rounded-full opacity-30" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900">
            How Agriform Works
          </h2>
          <p className="text-lg text-gray-600">
            A simple, transparent process to get you the equipment you need, exactly when you need it.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[45px] left-0 right-0 h-0.5 bg-gradient-to-r from-gray-200 via-primary to-gray-200" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-4 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center md:items-start relative"
              >
                {/* Number node */}
                <div className="h-[90px] w-[90px] rounded-full bg-white shadow-sm border-4 border-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400 relative z-10 mb-6 group hover:border-primary transition-colors">
                  <span className="group-hover:text-primary transition-colors">{step.num}</span>
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center md:text-left">{step.title}</h3>
                <p className="text-sm text-gray-600 text-center md:text-left leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
