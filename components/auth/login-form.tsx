'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loginSchema } from '@/features/auth/schemas/auth-schemas'
import { login } from '@/features/auth/actions/auth-actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'customer'
    }
  })

  const currentRole = watch('role')

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const result = await login(data)

      if (result?.error) {
        const friendlyMessage = /email not confirmed/i.test(result.error)
          ? 'Please check your inbox and confirm your email before logging in.'
          : result.error

        console.error('[Login Error]', result)
        setErrorMessage(friendlyMessage)
        toast.error(friendlyMessage)
        return
      }

      if (result?.success && result?.redirectUrl) {
        toast.success('Login successful.')
        window.location.href = result.redirectUrl
        return
      }

      console.error('[Login Error] Unexpected login result', result)
      const fallbackMessage = 'Login did not complete. Please try again.'
      setErrorMessage(fallbackMessage)
      toast.error(fallbackMessage)
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
    </div>
  )
}
