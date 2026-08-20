import { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Privacy Policy | Agriform',
  description: 'Read the Agriform Privacy Policy to understand how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 w-full pb-20 pt-24 max-w-4xl mx-auto px-4 md:px-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight border-b border-gray-100 pb-4">
          Privacy Policy
        </h1>
        <div className="prose prose-gray max-w-none text-gray-600 space-y-6 leading-relaxed">
          <p className="text-sm text-gray-400 font-medium">Last updated: August 18, 2026</p>
          
          <p>
            At Agriform, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy describes how we collect, use, and protect your information when you use our platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">1. Information We Collect</h2>
          <p>
            We collect information when you register an account, fill out your profile, list equipment, make bookings, or communicate with us. This includes your name, email, phone number, physical address, and payment transaction details.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">2. How We Use Your Information</h2>
          <p>
            We use your data to facilitate equipment rental transactions, verify user profiles, process payments, send notifications, improve our services, and ensure security and fraud prevention.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">3. Data Sharing</h2>
          <p>
            We share relevant details (such as contact information and equipment location) between owners and renters to facilitate bookings. We do not sell your personal information to third parties.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">4. Security</h2>
          <p>
            We implement standard security measures to protect your data, including secure encryption (SSL/TLS) for data transfers and trusted payment gateway partners.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">5. Your Rights</h2>
          <p>
            You have the right to access, update, or request deletion of your account and personal data at any time via your dashboard settings or by contacting our support team.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
