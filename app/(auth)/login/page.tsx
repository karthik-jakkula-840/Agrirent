import { LoginForm } from '@/components/auth/login-form'
import { Tractor } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#f4f9f4] relative overflow-hidden">
      {/* Background Decorative Elements (Mocking the leaf pattern) */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/4 translate-y-1/4"></div>
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden z-10 p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-6">
            <Tractor className="h-8 w-8 text-green-700" />
            <span className="text-2xl font-bold text-green-800 tracking-tight">AgriRent</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-500">Login to your AgriRent account</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  )
}
