'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loginSchema } from '@/features/auth/schemas/auth-schemas'
import { login } from '@/features/auth/actions/auth-actions'
import { sendOtpAction, verifyOtpAction, handlePhoneLoginSession } from '@/app/actions/otp'
import { sendEmailOtp, verifyEmailOtp } from '@/features/auth/actions/auth-actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Eye, EyeOff, Smartphone, Mail, User, Store, Lock, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Role & Method State
  const [currentRole, setCurrentRole] = useState<'customer' | 'owner'>('customer')
  const [loginMethod, setLoginMethod] = useState<'email_password' | 'mobile_otp' | 'email_otp'>('email_password')
  
  // OTP State
  const [contactValue, setContactValue] = useState('')
  const [otp, setOtp] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'customer'
    }
  })

  const onEmailSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null)
    setIsLoading(true)
    try {
      const result = await login({...data, role: currentRole})
      if (result?.error) {
        setErrorMessage(result.error)
        toast.error(result.error)
        return
      }
      if (result?.success && result?.redirectUrl) {
        toast.success('Login successful.')
        window.location.href = result.redirectUrl
        return
      }
      toast.error('Login did not complete. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!contactValue) {
      toast.error(`Please enter a valid ${loginMethod === 'mobile_otp' ? 'phone number' : 'email address'}.`)
      return
    }
    setErrorMessage(null)
    setIsLoading(true)
    try {
      if (loginMethod === 'email_otp') {
        const result = await sendEmailOtp(contactValue)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('OTP sent successfully to your email!')
          setEmailOtpSent(true)
        }
      } else {
        const result = await sendOtpAction(contactValue) 
        if (result.sessionId) {
          setSessionId(result.sessionId)
          if (result.sessionId === 'mock-session-id') {
            toast.success('OTP sent! (Mock Mode: Use 123456)')
            setOtp('123456')
          } else {
            toast.success('OTP sent successfully!')
          }
        } else {
          toast.error(result.error || 'Failed to send OTP')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      toast.error('Please enter a valid OTP.')
      return
    }
    setErrorMessage(null)
    setIsLoading(true)
    try {
      if (loginMethod === 'email_otp') {
        const verifyResult = await verifyEmailOtp(contactValue, otp)
        if (verifyResult.success && verifyResult.redirectUrl) {
          toast.success('OTP Verified. Logging you in...')
          window.location.href = verifyResult.redirectUrl
        } else {
          toast.error(verifyResult.error || 'Invalid OTP')
        }
      } else {
        const verifyResult = await verifyOtpAction(sessionId!, otp)
        if (verifyResult.success) {
          toast.success('OTP Verified. Logging you in...')
          const loginResult = await handlePhoneLoginSession(contactValue, currentRole)
          
          if (loginResult.success && loginResult.redirectUrl) {
            window.location.href = loginResult.redirectUrl
          } else {
            toast.error(loginResult.error || 'Login failed after verification.')
          }
        } else {
          toast.error(verifyResult.error || 'Invalid OTP')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 w-full">
      {errorMessage && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{errorMessage}</div>}
      
      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setCurrentRole('customer')}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
            currentRole === 'customer' 
              ? 'border-green-600 bg-green-50 text-green-700' 
              : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
        >
          <User className="h-4 w-4" /> Customer
        </button>
        <button
          type="button"
          onClick={() => setCurrentRole('owner')}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
            currentRole === 'owner' 
              ? 'border-green-600 bg-green-50 text-green-700' 
              : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Store className="h-4 w-4" /> Owner
        </button>
      </div>

      {/* Login Method Selection */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setLoginMethod('email_password')}
          className={`flex items-center justify-center gap-1.5 p-2.5 sm:p-2 rounded-lg border text-sm sm:text-xs font-medium transition-colors ${
            loginMethod === 'email_password' 
              ? 'border-green-600 bg-white text-green-700 shadow-sm' 
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Mail className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> Email & Password
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('mobile_otp')}
          className={`flex items-center justify-center gap-1.5 p-2.5 sm:p-2 rounded-lg border text-sm sm:text-xs font-medium transition-colors ${
            loginMethod === 'mobile_otp' 
              ? 'border-green-600 bg-white text-green-700 shadow-sm' 
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Smartphone className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> Mobile OTP
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('email_otp')}
          className={`flex items-center justify-center gap-1.5 p-2.5 sm:p-2 rounded-lg border text-sm sm:text-xs font-medium transition-colors ${
            loginMethod === 'email_otp' 
              ? 'border-green-600 bg-white text-green-700 shadow-sm' 
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Mail className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> Email OTP
        </button>
      </div>

      {/* Form Fields */}
      {loginMethod === 'email_password' ? (
        <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email address" 
                className="pl-9 h-11 border-gray-200 focus-visible:ring-green-500"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter your password" 
                className="pl-9 pr-10 h-11 border-gray-200 focus-visible:ring-green-500"
                {...register('password')}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full h-11 bg-green-700 hover:bg-green-800 text-white font-medium mt-6" disabled={isLoading}>
            {isLoading ? 'Logging in...' : `Login as ${currentRole === 'owner' ? 'Owner' : 'Customer'}`}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
              {loginMethod === 'mobile_otp' ? 'Mobile Number' : 'Email Address'}
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {loginMethod === 'mobile_otp' ? <Smartphone className="h-4 w-4 text-gray-400" /> : <Mail className="h-4 w-4 text-gray-400" />}
              </div>
              <Input 
                id="contact" 
                type={loginMethod === 'mobile_otp' ? 'tel' : 'email'} 
                placeholder={`Enter your ${loginMethod === 'mobile_otp' ? 'mobile number' : 'email'}`} 
                className="pl-9 h-11 border-gray-200 focus-visible:ring-green-500"
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                disabled={(loginMethod === 'mobile_otp' && sessionId !== null) || (loginMethod === 'email_otp' && emailOtpSent)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-700">Enter OTP</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  className="pl-9 h-11 border-gray-200 focus-visible:ring-green-500"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="h-11 border-green-600 text-green-700 hover:bg-green-50 sm:w-32"
                onClick={handleSendOTP} 
                disabled={isLoading}
              >
                {isLoading ? '...' : ((loginMethod === 'mobile_otp' && sessionId) || (loginMethod === 'email_otp' && emailOtpSent) ? 'Resend' : 'Send OTP')}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              We will send a 6-digit OTP to your registered {loginMethod === 'mobile_otp' ? 'phone' : 'email'}.
            </p>
          </div>

          <Button 
            type="button" 
            onClick={handleVerifyOTP} 
            className="w-full h-11 bg-green-700 hover:bg-green-800 text-white font-medium mt-6" 
            disabled={isLoading || (loginMethod === 'mobile_otp' && !sessionId) || (loginMethod === 'email_otp' && !emailOtpSent)}
          >
            {isLoading ? 'Verifying...' : `Login as ${currentRole === 'owner' ? 'Owner' : 'Customer'}`}
          </Button>
        </div>
      )}

      <div className="flex flex-col items-center space-y-3 pt-2">
        <Link href="/forgot-password" className="text-sm font-medium text-green-700 hover:underline">
          Forgot password?
        </Link>
        <div className="text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-green-700 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
