'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, IndianRupee, Zap, Lock, Headphones, Map } from 'lucide-react'

const benefits = [
  {
    id: 1,
    title: 'Verified Owners',
    description: 'Every equipment owner on our platform undergoes a strict verification process to ensure reliability and safety.',
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: 'Affordable Prices',
    description: 'Get the best rates for agricultural machinery with transparent pricing and no hidden fees.',
    icon: IndianRupee,
  },
  {
    id: 3,
    title: 'Easy Booking',
    description: 'Rent the equipment you need in just a few clicks. Choose your dates and confirm instantly.',
    icon: Zap,
  },
  {
    id: 4,
    title: 'Secure Payments',
    description: 'Your transactions are protected with enterprise-grade security and escrow services.',
    icon: Lock,
  },
  {
    id: 5,
    title: '24/7 Support',
    description: 'Our dedicated agricultural support team is always available to help you with your rentals.',
    icon: Headphones,
  },
  {
    id: 6,
    title: 'GPS Tracking',
    description: 'Track your rented equipment in real-time with integrated GPS for peace of mind.',
    icon: Map,
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function Benefits() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Why Choose Agriform
          </h2>
          <p className="text-lg text-gray-600">
            We are revolutionizing agricultural equipment rentals in India. Here is why thousands of farmers trust us.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.id}
              variants={itemVariants}
              className="min-w-[300px] w-[85vw] sm:w-auto sm:min-w-0 snap-start shrink-0 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                <benefit.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
