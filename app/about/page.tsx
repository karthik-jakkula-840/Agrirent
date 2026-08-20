import { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Tractor, 
  Users, 
  ShieldCheck, 
  Handshake, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | Agriform',
  description: 'Learn about Agriform, India\'s smart agricultural equipment rental marketplace. Our mission is to empower farmers by giving them affordable access to high-quality machinery.',
}

const stats = [
  { label: 'Farmers Empowered', value: '10,000+' },
  { label: 'Verified Equipments', value: '1,200+' },
  { label: 'Districts Reached', value: '45+' },
  { label: 'Successful Rentals', value: '25,000+' },
]

const values = [
  {
    icon: ShieldCheck,
    title: 'Trust & Safety',
    desc: 'Every owner, customer, and machinery listing is thoroughly verified. Secure payments and transparency form our core.',
  },
  {
    icon: Handshake,
    title: 'Mutual Prosperity',
    desc: 'We create a win-win ecosystem: owners earn income from idle machinery, while renters save on huge capital costs.',
  },
  {
    icon: TrendingUp,
    title: 'Agricultural Growth',
    desc: 'By providing high-quality tools on demand, we help improve crop yields, field efficiency, and farm profitability.',
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 w-full pt-24">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/5 via-white to-secondary/5 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_50%)]" />
          <div className="container mx-auto px-4 md:px-6 relative text-center max-w-4xl">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4" /> About Agriform
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
              Bridging the Gap in <span className="text-primary">Indian Agriculture</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Agriform is India's premier digital rental marketplace for agricultural machinery, connecting machinery owners directly with farmers.
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-12 bg-primary text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">{stat.value}</h3>
                  <p className="text-primary-foreground/80 text-sm md:text-base font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Mechanization is essential to optimize farming yield, but high upfront capital costs keep advanced tools out of reach for over 80% of smallholder farmers in India.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our mission is to democratize access to agricultural equipment. By facilitating direct peer-to-peer sharing, we enable farmers to access state-of-the-art harvesters, seeders, and tillage tools only when they need them—slashing their costs and increasing output.
                </p>
              </div>
              <div className="bg-primary/5 p-8 md:p-12 rounded-3xl border border-primary/10 flex flex-col justify-center items-center text-center">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                  <Tractor className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm">
                  To establish a fully digitized, reliable, and hyper-local agricultural economy where no farm remains idle due to a lack of machinery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-gray-50/50 border-t border-gray-100">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-16 tracking-tight">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((val, index) => {
                const IconComponent = val.icon
                return (
                  <div key={index} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{val.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{val.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary-foreground text-white text-center">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-8">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Join India's Fastest Growing Agricultural Network
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-xl mx-auto">
              Whether you are looking to rent equipment at affordable rates, or want to list your tractor to earn extra income, Agriform is here for you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/equipment">
                <Button className="bg-white text-primary hover:bg-gray-100 h-12 px-8 font-semibold rounded-xl">
                  Rent Equipment
                </Button>
              </Link>
              <Link href="/signup?type=owner">
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 hover:text-white h-12 px-8 font-semibold rounded-xl">
                  Register as Owner
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
