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
import { Eye, EyeOff, UploadCloud, FileCheck, Loader2, X, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    const result = await signup(data)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Account created successfully. Please check your inbox to verify.')
      router.push('/login')
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={currentRole}
        defaultValue="customer"
        onValueChange={(v: string) => {
          setValue('role', v as 'customer' | 'owner')
          if (v === 'customer') {
            setValue('aadharDocumentUrl', '')
            setAadhaarFileName(null)
          }
        }}
        className="w-full"
      >
        <input type="hidden" value={currentRole || 'customer'} {...register('role')} />
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="owner">Owner</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            id="fullName" 
            placeholder="Enter your full name" 
            {...register('fullName')}
          />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email" 
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            type="tel" 
            placeholder="Enter your phone number" 
            {...register('phone')}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        {/* Aadhaar Upload Field for Owners */}
        {currentRole === 'owner' && (
          <div className="space-y-2 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <div className="flex items-center justify-between">
              <Label htmlFor="aadhaar" className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Upload Aadhaar Card / ID Proof <span className="text-red-500">*</span>
              </Label>
              <span className="text-[10px] text-gray-500 font-medium">JPG, PNG or PDF</span>
            </div>

            {aadharDocumentUrl ? (
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium text-gray-800 truncate">
                    {aadhaarFileName || 'Aadhaar Document Uploaded'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAadhaar}
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
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border border-dashed border-emerald-300 rounded-xl p-3 bg-white text-center hover:bg-emerald-50/50 transition-colors flex items-center justify-center gap-2">
                  {isUploadingAadhaar ? (
                    <>
                      <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
                      <span className="text-xs font-medium text-emerald-700">Uploading Aadhaar document...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium text-gray-700">Click to upload Aadhaar card</span>
                    </>
                  )}
                </div>
              </div>
            )}
            <p className="text-[10px] text-gray-500">
              Required by admins to verify equipment owner registration.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Create a strong password" 
              {...register('password')}
              className="pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input 
              id="confirmPassword" 
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="Confirm your password" 
              {...register('confirmPassword')}
              className="pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading || isUploadingAadhaar}>
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
    </div>
  )
}

