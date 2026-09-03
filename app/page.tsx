import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Hero } from '@/components/home/hero'
import { Stats } from '@/components/home/stats'
import { CategorySection } from '@/components/home/category-section'
import { FeaturedEquipment } from '@/components/home/featured-equipment'
import { Benefits } from '@/components/home/benefits'
import { HowItWorks } from '@/components/home/how-it-works'
import { OwnerCta } from '@/components/home/owner-cta'
import { Testimonials } from '@/components/home/testimonials'
import { Faq } from '@/components/home/faq'
import { Contact } from '@/components/home/contact'
import { getCurrentUser, getUserRole } from '@/lib/supabase/auth'

export const metadata: Metadata = {
  title: 'AgriRent | India\'s Smart Equipment Rental Marketplace',
  description: 'Discover and rent high-quality agricultural equipment from verified owners near you. Affordable, reliable, and built for your farm\'s success.',
  keywords: 'agriculture, equipment, rental, tractor, harvester, farming, marketplace, India',
  openGraph: {
    title: 'AgriRent | Smart Agricultural Equipment Rental',
    description: 'Discover and rent high-quality agricultural equipment from verified owners.',
    url: 'https://agrirent.in',
    siteName: 'AgriRent',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriRent | Smart Agricultural Equipment Rental',
    description: 'Discover and rent high-quality agricultural equipment from verified owners.',
  },
}

import { MobileLandingView } from '@/components/home/mobile-landing'

export default async function HomePage() {
  // Fetch user data for the CTA logic
  const user = await getCurrentUser()
  const role = await getUserRole()
  
  const isAuthenticated = !!user

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://agrirent.in/#website',
        'url': 'https://agrirent.in',
        'name': 'AgriRent',
        'description': 'Smart Agricultural Equipment Rental Marketplace in India',
        'potentialAction': [{
          '@type': 'SearchAction',
          'target': 'https://agrirent.in/equipment?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }]
      },
      {
        '@type': 'Organization',
        '@id': 'https://agrirent.in/#organization',
        'name': 'AgriRent',
        'url': 'https://agrirent.in',
        'logo': 'https://agrirent.in/logo.png',
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+91-XXXXXXXXXX',
          'contactType': 'customer service',
          'areaServed': 'IN',
          'availableLanguage': ['English', 'Hindi']
        }
      }
    ]
  }

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      
      <main className="flex-1 w-full">
        {/* Mobile View Landing Page (Exact layout as mockup) */}
        <MobileLandingView />

        {/* Desktop Hero & Stats (Hidden on mobile) */}
        <div className="hidden md:block">
          <Hero />
          <Stats />
          <CategorySection />
          <FeaturedEquipment />
        </div>

        <Benefits />
        <HowItWorks />
        <OwnerCta userRole={role} isAuthenticated={isAuthenticated} />
        <Testimonials />
        <Faq />
        <Contact />
      </main>

      <Footer />
    </div>
  )
}
