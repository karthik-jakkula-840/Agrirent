'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loginSchema } from '@/features/auth/schemas/auth-schemas'
import { login } from '@/features/auth/actions/auth-actions'
import { sendOtpAction, verifyOtpAction, handlePhoneLoginSession } from '@/app/actions/otp'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Eye, EyeOff, Smartphone, Mail } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // OTP State
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'customer'
    }
  })

  const currentRole = watch('role')

  const onEmailSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const result = await login(data)

      if (result?.error) {
        const friendlyMessage = /email not confirmed/i.test(result.error)
          ? 'Please check your inbox and confirm your email before logging in.'
          : result.error
        setErrorMessage(friendlyMessage)
        toast.error(friendlyMessage)
        return
      }

      if (result?.success && result?.redirectUrl) {
        toast.success('Login successful.')
        window.location.href = result.redirectUrl
        return
      }

      const fallbackMessage = 'Login did not complete. Please try again.'
      setErrorMessage(fallbackMessage)
      toast.error(fallbackMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number.')
      return
    }
    setErrorMessage(null)
    setIsLoading(true)
    try {
      const result = await sendOtpAction(phoneNumber)
      if (result.sessionId) {
        setSessionId(result.sessionId)
        toast.success('OTP sent successfully!')
      } else {
        toast.error(result.error || 'Failed to send OTP')
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
      const verifyResult = await verifyOtpAction(sessionId!, otp)
      if (verifyResult.success) {
        toast.success('OTP Verified. Logging you in...')
        const loginResult = await handlePhoneLoginSession(phoneNumber, currentRole)
        
        if (loginResult.success && loginResult.redirectUrl) {
          window.location.href = loginResult.redirectUrl
        } else {
          toast.error(loginResult.error || 'Login failed after verification.')
        }
      } else {
        toast.error(verifyResult.error || 'Invalid OTP')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      <Tabs
        value={currentRole}
        defaultValue="customer"
        onValueChange={(v: string) => setValue('role', v as 'customer' | 'owner')}
        className="w-full mb-4"
      >
        <input type="hidden" value={currentRole || 'customer'} {...register('role')} />
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="owner">Owner</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex justify-center space-x-2 mb-4">
        <Button 
          type="button" 
          variant={loginMethod === 'email' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setLoginMethod('email')}
        >
          <Mail className="w-4 h-4 mr-2" />
          Email Login
        </Button>
        <Button 
          type="button" 
          variant={loginMethod === 'phone' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setLoginMethod('phone')}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Mobile OTP
        </Button>
      </div>

      {loginMethod === 'email' ? (
        <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter your password" 
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : `Login as ${currentRole === 'owner' ? 'Owner' : 'Customer'}`}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          {!sessionId ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="Enter 10-digit mobile number" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <Button type="button" onClick={handleSendOTP} className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="Enter the OTP received" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <Button type="button" onClick={handleVerifyOTP} className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </Button>
              <Button 
                type="button" 
                variant="link" 
                onClick={() => setSessionId(null)} 
                className="w-full" 
                disabled={isLoading}
              >
                Change Mobile Number
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
