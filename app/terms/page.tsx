import { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Agriform',
  description: 'Review the Agriform Terms and Conditions for equipment owners and renters using our smart rental marketplace.',
}

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 w-full pb-20 pt-24 max-w-4xl mx-auto px-4 md:px-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight border-b border-gray-100 pb-4">
          Terms & Conditions
        </h1>
        <div className="prose prose-gray max-w-none text-gray-600 space-y-6 leading-relaxed">
          <p className="text-sm text-gray-400 font-medium">Last updated: August 18, 2026</p>
          
          <p>
            Welcome to Agriform. By accessing or using our platform, you agree to comply with and be bound by these Terms and Conditions. Please read them carefully.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">1. Account Registration</h2>
          <p>
            You must register for an account to list or rent equipment. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">2. Listings & Accuracy</h2>
          <p>
            Equipment owners are solely responsible for the accuracy of their listings, including prices, availability, locations, and descriptions. Machinery must be in safe, working condition.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">3. Bookings & Payments</h2>
          <p>
            Renters agree to pay all rental charges, security deposits, and taxes associated with a booking. Agriform uses third-party payment gateways to facilitate secure transactions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">4. Liability & Insurance</h2>
          <p>
            Agriform is a marketplace platform and does not own or operate any listed machinery. Renters are responsible for returning equipment in the same condition as received. Owners are encouraged to maintain active commercial insurance.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">5. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent behavior, or disrupt the community guidelines.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
