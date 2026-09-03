import { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Contact } from '@/components/home/contact'

export const metadata: Metadata = {
  title: 'Contact Us | AgriRent',
  description: 'Get in touch with AgriRent. Contact our support team for any queries about renting or listing agricultural machinery.',
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 w-full pt-16">
        <Contact />
      </main>

      <Footer />
    </div>
  )
}
