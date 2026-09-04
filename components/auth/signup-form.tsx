'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signupSchema } from '@/features/auth/schemas/auth-schemas'
import { signup, uploadAadhaarDocumentAction } from '@/features/auth/actions/auth-actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  Eye, 
  EyeOff, 
  UploadCloud, 
  FileCheck, 
  Loader2, 
  X, 
  Shield, 
  User, 
  Store, 
  Mail, 
  Phone, 
  Lock,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false)
  const [aadhaarFileName, setAadhaarFileName] = useState<string | null>(null)
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'customer',
      aadharDocumentUrl: ''
    }
  })

  const currentRole = watch('role')
  const aadharDocumentUrl = watch('aadharDocumentUrl')

  const handleAadhaarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB')
      return
    }

    setIsUploadingAadhaar(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await uploadAadhaarDocumentAction(formData)
      if (res.success && res.url) {
        setValue('aadharDocumentUrl', res.url)
        setAadhaarFileName(file.name)
        toast.success('Aadhaar document uploaded successfully!')
      } else {
        toast.error(res.error || 'Failed to upload Aadhaar document')
      }
    } catch (err: any) {
      toast.error('Failed to upload document. Please try again.')
    } finally {
      setIsUploadingAadhaar(false)
    }
  }

  const handleRemoveAadhaar = () => {
    setValue('aadharDocumentUrl', '')
    setAadhaarFileName(null)
  }

  const onSubmit = async (data: SignupFormValues) => {
    if (data.role === 'owner' && !data.aadharDocumentUrl) {
      toast.error('Please upload your Aadhaar card for owner verification.')
      return
    }

    setIsLoading(true)
    try {
      const result = await signup(data)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Account created successfully. Please check your inbox to verify.')
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full">
      {/* 1. Sleek Segmented Role Selector */}
      <div className="bg-gray-100/80 p-1 rounded-2xl flex items-center shadow-inner">
        <button
          type="button"
          onClick={() => {
            setValue('role', 'customer')
            setValue('aadharDocumentUrl', '')
            setAadhaarFileName(null)
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentRole === 'customer' 
              ? 'bg-white text-emerald-800 shadow-sm' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Customer</span>
        </button>
        <button
          type="button"
          onClick={() => setValue('role', 'owner')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentRole === 'owner' 
              ? 'bg-white text-emerald-800 shadow-sm' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Equipment Owner</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Full Name */}
        <div className="space-y-1">
          <Label htmlFor="fullName" className="text-xs font-bold text-gray-700">Full Name</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              id="fullName" 
              placeholder="e.g. Ramesh Kumar" 
              className="pl-10 h-11 bg-gray-50/80 border-gray-200/90 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all shadow-2xs"
              {...register('fullName')}
            />
          </div>
          {errors.fullName && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs font-bold text-gray-700">Email Address</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@domain.com" 
              className="pl-10 h-11 bg-gray-50/80 border-gray-200/90 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all shadow-2xs"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.email.message}</p>}
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <Label htmlFor="phone" className="text-xs font-bold text-gray-700">Phone Number</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="10-digit mobile number" 
              className="pl-10 h-11 bg-gray-50/80 border-gray-200/90 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all shadow-2xs"
              {...register('phone')}
            />
          </div>
          {errors.phone && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.phone.message}</p>}
        </div>

        {/* Aadhaar Upload Field for Owners */}
        {currentRole === 'owner' && (
          <div className="space-y-2 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <Label htmlFor="aadhaar" className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                <span>Upload Aadhaar Card / ID Proof</span>
                <span className="text-red-500 font-bold">*</span>
              </Label>
              <span className="text-[10px] text-gray-500 font-medium">PDF, JPG or PNG</span>
            </div>

            {aadharDocumentUrl ? (
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-gray-800 truncate">
                    {aadhaarFileName || 'Aadhaar Document Uploaded'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAadhaar}
                  aria-label="Remove Aadhaar document"
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  id="aadhaar"
                  accept="image/*,.pdf"
                  onChange={handleAadhaarUpload}
                  disabled={isUploadingAadhaar}
                  aria-label="Upload Aadhaar Card or ID Proof"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border border-dashed border-emerald-300 rounded-xl p-3 bg-white text-center hover:bg-emerald-50/50 transition-colors flex items-center justify-center gap-2 shadow-2xs">
                  {isUploadingAadhaar ? (
                    <>
                      <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
                      <span className="text-xs font-bold text-emerald-700">Uploading document...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-700">Tap to upload ID proof</span>
                    </>
                  )}
                </div>
              </div>
            )}
            <p className="text-[10px] text-gray-500">
              Required for government compliance and owner fleet verification.
            </p>
          </div>
        )}

        {/* Passwords (Side-by-side on tablet/desktop, stacked on small mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-bold text-gray-700">Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Min 8 chars (A-z, 0-9)" 
                className="pl-10 pr-9 h-11 bg-gray-50/80 border-gray-200/90 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all shadow-2xs"
                {...register('password')}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="text-xs font-bold text-gray-700">Confirm Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                id="confirmPassword" 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="Confirm password" 
                className="pl-10 pr-9 h-11 bg-gray-50/80 border-gray-200/90 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all shadow-2xs"
                {...register('confirmPassword')}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-3" 
          disabled={isLoading || isUploadingAadhaar}
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
          ) : (
            <>
              <span>Sign Up as {currentRole === 'owner' ? 'Equipment Owner' : 'Customer'}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Footer Login Link */}
      <div className="pt-2 text-center border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-extrabold text-emerald-700 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
