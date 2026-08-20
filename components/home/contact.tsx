'use client'

import { useActionState } from 'react'
import { Phone, Mail, MapPin, Globe, Camera, MessageCircle, Video, Send, Loader2 } from 'lucide-react'
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
    <section className="py-24 bg-gray-50/50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Side: Contact Info */}
            <div className="bg-gray-900 text-white p-10 md:p-16 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-4">Get in touch</h2>
                <p className="text-gray-400 mb-12 max-w-sm">
                  Have questions about renting equipment or listing your machinery? Our team is here to help.
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Phone</h4>
                      <p className="text-gray-400">+91 1800 123 4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email</h4>
                      <p className="text-gray-400">support@agriform.in</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Location</h4>
                      <p className="text-gray-400">123 Agri Business Park,<br />New Delhi, India 110001</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-white/10">
                <p className="font-semibold mb-4">Follow Us</p>
                <div className="flex gap-4">
                  <a href="#" className="h-10 w-10 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors"><Globe className="h-5 w-5" /></a>
                  <a href="#" className="h-10 w-10 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors"><Camera className="h-5 w-5" /></a>
                  <a href="#" className="h-10 w-10 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors"><MessageCircle className="h-5 w-5" /></a>
                  <a href="#" className="h-10 w-10 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors"><Video className="h-5 w-5" /></a>
                </div>
              </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className="p-10 md:p-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Send us a message</h3>
              
              {state.success ? (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-8 text-center flex flex-col items-center">
                  <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <Send className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Message Sent!</h4>
                  <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form action={formAction} className="space-y-6">
                  {state.error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
                      {state.error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="John Doe" required className="bg-gray-50 border-gray-200 focus-visible:ring-primary h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" placeholder="john@example.com" required className="bg-gray-50 border-gray-200 focus-visible:ring-primary h-12" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" placeholder="How can we help you?" required className="bg-gray-50 border-gray-200 focus-visible:ring-primary h-12" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Please describe your inquiry in detail..." 
                      rows={5}
                      required
                      className="bg-gray-50 border-gray-200 focus-visible:ring-primary resize-none"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white text-lg rounded-xl shadow-lg shadow-primary/25"
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
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
