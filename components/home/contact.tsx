'use client'

import { useActionState } from 'react'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Camera, 
  MessageCircle, 
  Video, 
  Send, 
  Loader2, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { submitContactMessage } from '@/app/actions/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const initialState = {
  success: false,
  error: null,
}

export function Contact() {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState)

  return (
    <section className="py-10 sm:py-16 md:py-24 bg-gradient-to-b from-white via-gray-50/40 to-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-50/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none -z-10" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Side: Contact Info */}
            <div className="bg-gray-900 text-white p-5 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
              {/* Subtle green ambient accent in corner */}
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-400 text-[11px] sm:text-xs font-bold mb-3 shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>24/7 Farmer Support</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 tracking-tight text-white">
                  Get in touch
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mb-6 sm:mb-10 max-w-md leading-relaxed font-normal">
                  Have questions about renting equipment, custom requirements, or listing machinery? Our team is always ready to assist.
                </p>

                <div className="space-y-4 sm:space-y-6">
                  {/* Phone */}
                  <a 
                    href="tel:+9118001234567" 
                    className="flex items-start gap-3.5 p-2 -ml-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors group"
                  >
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/20 transition-all">
                      <Phone className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-200 mb-0.5">Toll-Free Helpline</h3>
                      <p className="text-xs sm:text-sm text-gray-400 group-hover:text-white transition-colors font-medium">
                        +91 1800 123 4567
                      </p>
                    </div>
                  </a>
                  
                  {/* Email */}
                  <a 
                    href="mailto:support@agriform.in" 
                    className="flex items-start gap-3.5 p-2 -ml-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors group"
                  >
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/20 transition-all">
                      <Mail className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-200 mb-0.5">Email Support</h3>
                      <p className="text-xs sm:text-sm text-gray-400 group-hover:text-white transition-colors font-medium">
                        support@agriform.in
                      </p>
                    </div>
                  </a>

                  {/* Location */}
                  <div className="flex items-start gap-3.5 p-2 -ml-2">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <MapPin className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-200 mb-0.5">Headquarters</h3>
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                        123 Agri Business Park, New Delhi, India 110001
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social & WhatsApp CTA */}
              <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-300 mb-2.5">Connect With Us</p>
                  <div className="flex gap-2.5">
                    <a href="https://agriform.in" target="_blank" rel="noopener noreferrer" aria-label="Website" className="h-9 w-9 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-white text-gray-400 flex items-center justify-center transition-all"><Globe className="h-4 w-4" /></a>
                    <a href="https://instagram.com/agriform" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-9 w-9 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-white text-gray-400 flex items-center justify-center transition-all"><Camera className="h-4 w-4" /></a>
                    <a href="https://wa.me/910000000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="h-9 w-9 rounded-xl bg-white/5 hover:bg-[#25D366] hover:text-white text-gray-400 flex items-center justify-center transition-all"><MessageCircle className="h-4 w-4" /></a>
                    <a href="https://youtube.com/@agriform" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="h-9 w-9 rounded-xl bg-white/5 hover:bg-red-600 hover:text-white text-gray-400 flex items-center justify-center transition-all"><Video className="h-4 w-4" /></a>
                  </div>
                </div>

                <a 
                  href="https://wa.me/910000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-white text-xs font-bold transition-all self-start sm:self-auto"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className="p-5 sm:p-8 md:p-12 lg:p-16 bg-white">
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Send us a message
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Fill out the form below and our agricultural support desk will respond shortly.
                </p>
              </div>
              
              {state.success ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center">
                  <div className="h-14 w-14 bg-emerald-100 text-[#009b55] rounded-full flex items-center justify-center mb-3.5 shadow-xs">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Message Sent Successfully!</h4>
                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-sm">
                    Thank you for reaching out to Agriform. Our regional representative will get in touch with you within 24 hours.
                  </p>
                </div>
              ) : (
                <form action={formAction} className="space-y-4 sm:space-y-5">
                  {state.error && (
                    <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs font-semibold border border-red-100">
                      {state.error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-bold text-gray-700">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="e.g. Ramesh Patel" 
                        required 
                        className="bg-gray-50/80 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#009b55] h-11 text-xs sm:text-sm rounded-xl" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-bold text-gray-700">Email Address</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="ramesh@example.com" 
                        required 
                        className="bg-gray-50/80 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#009b55] h-11 text-xs sm:text-sm rounded-xl" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-bold text-gray-700">Subject</Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      placeholder="e.g. Inquiring about 50HP Tractor rental in Warangal" 
                      required 
                      className="bg-gray-50/80 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#009b55] h-11 text-xs sm:text-sm rounded-xl" 
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs font-bold text-gray-700">Message</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Please describe your inquiry, farm location, or required dates..." 
                      rows={4}
                      required
                      className="bg-gray-50/80 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#009b55] resize-none text-xs sm:text-sm rounded-xl"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 sm:h-12 bg-[#009b55] hover:bg-[#00874a] text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-sm shadow-emerald-600/25 transition-all active:scale-[0.99]"
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
