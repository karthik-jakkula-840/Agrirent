import { SignupForm } from '@/components/auth/signup-form'
import { Tractor, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-3.5 sm:p-6 bg-gradient-to-b from-emerald-50/80 via-white to-emerald-50/30 relative overflow-hidden">
      {/* Decorative gradient blur orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-100/60 rounded-full filter blur-3xl opacity-60 -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-100/50 rounded-full filter blur-3xl opacity-50 translate-x-1/3 translate-y-1/3 pointer-events-none" />
      
      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-3 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-700 transition-colors p-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgba(0,155,85,0.08)] overflow-hidden z-10 p-5 sm:p-8 border border-gray-100">
        <div className="text-center mb-5">
          <Link href="/" className="inline-flex items-center gap-2 mb-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/25">
              <Tractor className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              Agri<span className="text-emerald-600">Rent</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Create an account</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Join AgriRent to rent or list farm machinery</p>
        </div>
        
        <SignupForm />
      </div>
    </div>
  )
}
