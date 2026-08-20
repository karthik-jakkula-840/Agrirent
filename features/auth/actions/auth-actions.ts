'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth-schemas'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  )
}

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = await createClient()

  try {
    console.log('[LOGIN] Starting login')
    console.log('[LOGIN] Selected role:', values.role)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      console.error('[LOGIN] Supabase auth error:', error)
      const authMessage = error.message || 'Login failed. Please try again.'
      const friendlyMessage = /email not confirmed/i.test(authMessage)
        ? 'Please check your inbox and confirm your email before logging in.'
        : authMessage
      return { success: false, error: friendlyMessage }
    }

    if (!data.user || !data.session) {
      console.error('[LOGIN] Unexpected error: No active session returned', { user: data.user, session: data.session })
      return { success: false, error: 'Authentication failed. Please try again.' }
    }

    console.log('[LOGIN] Authenticated user:', data.user.id)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      console.error('[LOGIN] Profile error:', profileError)
      await supabase.auth.signOut()
      return { success: false, error: 'Profile not found for this account. Please contact support.' }
    }

    console.log('[LOGIN] Profile:', profile)
    console.log('[LOGIN] Profile role:', profile.role)

    // We allow any registered user to log in and redirect them to their correct dashboard
    // based on their actual role in the database profile, rather than forcing them to match
    // the tab they logged in with.

    let destination = '/dashboard/user'
    if (profile.role === 'admin') {
      destination = '/dashboard/admin'
    } else if (profile.role === 'owner' || profile.role === 'rental_owner') {
      destination = '/dashboard/owner'
    }

    console.log('[LOGIN] Redirect:', destination)

    return { success: true, redirectUrl: destination }
  } catch (error: any) {
    console.error('[LOGIN] Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during login.'
    const friendlyMessage = /email not confirmed/i.test(message)
      ? 'Please check your inbox and confirm your email before logging in.'
      : message
    return { success: false, error: friendlyMessage }
  }
}

export async function signup(values: z.infer<typeof signupSchema>) {
  const supabase = await createClient()

  console.log('[SIGNUP] Registering user:', values.email, 'Role:', values.role)

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        phone: values.phone,
        role: values.role,
      },
    },
  })

  if (error) {
    console.error('[Signup Error]', error.message)
    return { error: error.message }
  }

  // Auto-confirm user email programmatically using the service role key
  if (data?.user) {
    try {
      console.log('[Signup] Auto-confirming email for user ID:', data.user.id)
      const adminClient = createAdminClient()
      const { error: confirmError } = await adminClient.auth.admin.updateUserById(
        data.user.id,
        { email_confirm: true }
      )
      if (confirmError) {
        console.error('[Signup] Email confirmation failed:', confirmError.message)
      } else {
        console.log('[Signup] Email auto-confirmed successfully')
      }
    } catch (err) {
      console.error('[Signup] Error auto-confirming email:', err)
    }
  }

  if (data?.session) {
    console.log('[Signup] Auto-login detected, signing user out...')
    await supabase.auth.signOut()
  }

  console.log('[Signup] User registered successfully', values.email)
  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPassword(values: z.infer<typeof forgotPasswordSchema>) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(values: z.infer<typeof resetPasswordSchema>) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: values.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}
