import { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Briefcase, MapPin, Clock, DollarSign, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Careers | Agriform',
  description: 'Join the team building India\'s smart agricultural equipment rental marketplace. Explore open positions in engineering, operations, product, and growth.',
}

const openRoles = [
  {
    title: 'Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote / New Delhi',
    type: 'Full-time',
    compensation: 'Competitive Salary',
  },
  {
    title: 'Regional Operations Manager',
    department: 'Operations',
    location: 'Ludhiana, Punjab',
    type: 'Full-time',
    compensation: 'Competitive Salary + Performance Bonus',
  },
  {
    title: 'Customer Success Executive',
    department: 'Support',
    location: 'Remote (Vernacular speaking required)',
    type: 'Full-time',
    compensation: 'Industry Standard',
  },
]

export default function CareersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar />

      <main className="flex-1 w-full pb-20 pt-24">
        {/* Hero Section */}
        <div className="bg-primary/5 py-16 border-b border-primary/10">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Grow Your Career, Empower Indian Farmers
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              We are building the future of shared agricultural economy in India. Join us to make modern mechanization accessible and affordable for every farmer.
            </p>
          </div>
        </div>

        {/* Culture Section */}
        <div className="container mx-auto px-4 md:px-6 pt-16 max-w-4xl">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Work at Agriform?</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              At Agriform, we combine cutting-edge technology with ground-level impact. We value ownership, empathy, and speed. You will have the opportunity to solve real problems that directly improve the livelihoods of millions of farmers across India.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 font-medium">
              <div className="flex items-center gap-2">✓ Flexible work hours & Remote-friendly culture</div>
              <div className="flex items-center gap-2">✓ Comprehensive health insurance & wellness perks</div>
              <div className="flex items-center gap-2">✓ Fast-paced growth and equity options</div>
              <div className="flex items-center gap-2">✓ High autonomy with clear ownership of tasks</div>
            </div>
          </div>

          {/* Open Roles Section */}
          <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Open Opportunities</h2>
          <div className="space-y-6">
            {openRoles.map((role, idx) => (
              <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
                    {role.department}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{role.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {role.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {role.type}</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> {role.compensation}</span>
                  </div>
                </div>
                <a href="mailto:careers@agriform.in" className="shrink-0">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl h-11">
                    Apply Now
                  </Button>
                </a>
              </div>
            ))}
          </div>

          {/* General Inquiries */}
          <div className="mt-16 bg-gray-900 text-white p-8 md:p-12 rounded-3xl text-center space-y-6">
            <Mail className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-2xl font-bold">Don't see the right role?</h3>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              We are always looking for passionate builders, designers, and operation specialists who care about agriculture. Drop us a line at <strong>careers@agriform.in</strong> with your resume.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
