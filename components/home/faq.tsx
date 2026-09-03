'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, MessageCircle, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    question: "What is AgriRent?",
    answer: "AgriRent is India's smart agricultural equipment rental marketplace. We connect farmers in need of machinery with verified equipment owners nearby, ensuring affordable, safe, and transparent rentals."
  },
  {
    question: "How do I rent equipment on AgriRent?",
    answer: "Renting is fast and straightforward: search for the machinery you need (by name or location), select your rental dates, and submit a booking request. Once the owner confirms, complete payment securely to lock in your reservation."
  },
  {
    question: "How do I list my equipment as an owner?",
    answer: "Tap 'Become an Owner' to register. Add your machinery specifications, photos, and daily or hourly pricing. Once our verification team reviews your listing, it goes live to thousands of farmers in your district."
  },
  {
    question: "How are equipment owners and machinery verified?",
    answer: "Every equipment owner undergoes strict identity verification (Aadhaar/Govt ID) and machine condition checks before their equipment is approved for booking."
  },
  {
    question: "How are payments handled securely?",
    answer: "All transactions are protected by escrow. Your payment is held safely and released only after you inspect and accept the equipment upon handover."
  },
  {
    question: "Can I cancel or reschedule a booking?",
    answer: "Yes, bookings can be cancelled or modified according to our transparent cancellation policy. Cancellations made prior to the rental date qualify for prompt refunds."
  },
  {
    question: "What happens if equipment breaks down during work?",
    answer: "Owners are responsible for well-maintained machinery. If an unexpected mechanical issue occurs, our 24/7 farmer support team will immediately coordinate replacement machinery or a fair refund."
  },
  {
    question: "How can I contact customer support?",
    answer: "Our support helpline is active 24/7. You can call our toll-free number (+91 1800 123 4567), chat with us on WhatsApp, or send a message through the contact form below."
  }
]

export function Faq() {
  return (
    <section id="faq" className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-white via-[#fbfdfc] to-white relative overflow-hidden">
      {/* Subtle background ambient blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebf8f1] border border-[#c3edd5] text-[#008f4c] text-[11px] sm:text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#009b55]" />
            <span>Got Questions? We Have Answers</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-950 tracking-tight leading-tight mb-2.5">
            Frequently Asked <span className="text-[#009b55]">Questions</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto leading-relaxed font-medium">
            Quick answers to help you rent machinery, list equipment, manage payments, and grow your farm.
          </p>
        </div>

        {/* Accordion Cards */}
        <Accordion className="w-full space-y-3 sm:space-y-3.5">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className="border border-gray-100 bg-white rounded-2xl sm:rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-emerald-200/80 transition-all duration-200 px-4 sm:px-6 py-1 overflow-hidden"
            >
              <AccordionTrigger className="text-left text-[15px] sm:text-lg font-bold text-gray-950 hover:no-underline hover:text-[#009b55] py-4 transition-colors">
                <div className="flex items-center gap-3 pr-2">
                  <div className="h-7 w-7 rounded-xl bg-emerald-50 text-[#009b55] flex items-center justify-center shrink-0 text-xs sm:text-sm font-black border border-emerald-100/60">
                    Q
                  </div>
                  <span className="leading-snug">{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal pt-1.5 pb-4.5 pl-10 pr-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Need More Help Banner */}
        <div className="mt-8 sm:mt-10 p-4 sm:p-6 bg-[#eef8f2] rounded-2xl sm:rounded-3xl border border-emerald-100/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-[#009b55] flex items-center justify-center shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900">Still have questions?</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Our agricultural support desk is here for you 24/7.</p>
            </div>
          </div>

          <a 
            href="#contact" 
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#009b55] hover:bg-[#00874a] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 shrink-0"
          >
            <span>Contact Support</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}
