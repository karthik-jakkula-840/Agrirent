import { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { HowItWorks } from '@/components/home/how-it-works'
import { Faq } from '@/components/home/faq'
import { OwnerCta } from '@/components/home/owner-cta'
import { getCurrentUser, getUserRole } from '@/lib/supabase/auth'

export const metadata: Metadata = {
  title: 'How It Works | AgriRent',
  description: 'Learn how AgriRent makes renting and listing agricultural machinery simple, safe, and transparent for farmers across India.',
}

export default async function HowItWorksPage() {
  const user = await getCurrentUser()
  const role = await getUserRole()
  const isAuthenticated = !!user

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 w-full pt-16">
        <HowItWorks />
        <OwnerCta userRole={role as any} isAuthenticated={isAuthenticated} />
        <Faq />
      </main>

      <Footer />
    </div>
  )
}
