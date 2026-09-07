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
  const adminClient = createAdminClient()

  try {
    console.log('[LOGIN] Starting login for:', values.email)
    console.log('[LOGIN] Selected role tab:', values.role)

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

    // Fetch profile with adminClient to avoid any RLS or stale session issues
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      console.error('[LOGIN] Profile error:', profileError)
      await supabase.auth.signOut()
      return { success: false, error: 'Profile not found for this account. Please contact support.' }
    }

    // Admins always redirect to admin dashboard
    if (profile.role === 'admin') {
      return { success: true, redirectUrl: '/dashboard/admin' }
    }

    // Fetch latest owner request using adminClient (bypasses RLS)
    const { data: ownerRequest } = await adminClient
      .from('owner_requests')
      .select('status')
      .eq('user_id', data.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const isPendingOwner = ownerRequest?.status === 'pending'
    const isRejectedOwner = ownerRequest?.status === 'rejected'
    const isApprovedOwner = ownerRequest?.status === 'approved' || (profile.role === 'owner' && !ownerRequest)

    // RULE 1: If owner registration is PENDING approval:
    // Block login completely (under both Customer and Owner tabs) until an Admin approves!
    if (isPendingOwner) {
      console.log('[LOGIN] Blocked: Owner account is pending admin approval')
      await supabase.auth.signOut()
      return { 
        success: false, 
        error: 'Your equipment owner registration is pending admin approval. You will be able to log in once an administrator approves your account.' 
      }
    }

    // RULE 2: If owner registration was REJECTED:
    if (isRejectedOwner) {
      console.log('[LOGIN] Blocked: Owner account was rejected')
      await supabase.auth.signOut()
      return { 
        success: false, 
        error: 'Your equipment owner registration was rejected by an administrator. Please contact support.' 
      }
    }

    // RULE 3: If user is an APPROVED equipment owner:
    if (isApprovedOwner) {
      if (values.role === 'customer') {
        await supabase.auth.signOut()
        return { 
          success: false, 
          error: 'You are registered as an Equipment Owner. Please select the Equipment Owner tab to log in.' 
        }
      }
      return { success: true, redirectUrl: '/dashboard/owner' }
    }

    // RULE 4: User is a standard CUSTOMER (never applied as owner):
    if (values.role === 'owner') {
      await supabase.auth.signOut()
      return { 
        success: false, 
        error: 'You are not registered as an equipment owner. Please log in as a Customer, or register as an Equipment Owner.' 
      }
    }

    return { success: true, redirectUrl: '/dashboard/user' }
  } catch (error: any) {
    console.error('[LOGIN] Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during login.'
    const friendlyMessage = /email not confirmed/i.test(message)
      ? 'Please check your inbox and confirm your email before logging in.'
      : message
    return { success: false, error: friendlyMessage }
  }
}

export async function uploadAadhaarDocumentAction(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'No file selected' }
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 10MB limit' }
    }

    const adminClient = createAdminClient()

    const { data: buckets } = await adminClient.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === 'documents')
    if (!bucketExists) {
      await adminClient.storage.createBucket('documents', { public: true })
    }

    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `aadhar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `aadhaar/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let bucketName = 'documents'
    const { error: uploadError } = await adminClient.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      bucketName = 'equipment-images'
      const { error: fbErr } = await adminClient.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        })
      if (fbErr) {
        bucketName = 'avatars'
        await adminClient.storage
          .from(bucketName)
          .upload(filePath, buffer, {
            contentType: file.type || 'image/jpeg',
            upsert: true,
          })
      }
    }

    const { data: urlData } = adminClient.storage.from(bucketName).getPublicUrl(filePath)
    return { success: true, url: urlData.publicUrl }
  } catch (err: any) {
    console.error('[Upload Aadhaar Error]:', err)
    return { success: false, error: err?.message || 'Failed to upload document' }
  }
}

export async function signup(values: z.infer<typeof signupSchema>) {
  const supabase = await createClient()

  console.log('[SIGNUP] Registering user:', values.email, 'Requested Role:', values.role)

  // Force actual role to customer initially if they want to be an owner
  const assignedRole = values.role === 'owner' ? 'customer' : values.role

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        phone: values.phone,
        role: assignedRole,
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

      // Explicitly update profile with phone number and full name (always customer role until approved)
      await adminClient
        .from('profiles')
        .update({
          phone: values.phone,
          full_name: values.fullName,
          role: 'customer',
        })
        .eq('id', data.user.id)

      // If they requested to be an owner, create owner verification request with Aadhaar document
      if (values.role === 'owner') {
        const aadharDocUrl = values.aadharDocumentUrl || '#'
        const { error: reqError } = await adminClient.from('owner_requests').insert([
          {
            user_id: data.user.id,
            business_name: `${values.fullName}'s Farm Equipment`,
            business_address: 'Verified via Aadhaar at signup',
            identity_document_url: aadharDocUrl,
            address_proof_url: aadharDocUrl !== '#' ? aadharDocUrl : '#',
            status: 'pending'
          }
        ])
        if (reqError) {
          console.error('[Signup] Error creating owner request:', reqError)
          return { error: 'Failed to create owner verification request. Please try again.' }
        } else {
          console.log('[Signup] Created owner request for approval with Aadhaar:', aadharDocUrl)
        }
      }

    } catch (err: any) {
      console.error('[Signup] Error in post-signup tasks:', err)
      return { error: err?.message || 'Error completing registration' }
    }
  }

  if (data?.session) {
    console.log('[Signup] Auto-login detected, signing user out...')
    await supabase.auth.signOut()
  }

  console.log('[Signup] User registered successfully', values.email)
  return { success: true, isOwnerPending: values.role === 'owner' }
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

export async function sendEmailOtp(email: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // We assume they must be signed up first, or we can set it to true if we want passwordless signup
    }
  })

  if (error) {
    console.error('[sendEmailOtp] Error:', error.message)
    return { error: error.message }
  }

  return { success: true }
}

export async function verifyEmailOtp(email: string, otp: string, role?: string) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email',
  })

  if (error) {
    console.error('[verifyEmailOtp] Error:', error.message)
    return { success: false, error: error.message }
  }
  
  if (!data.user) {
    return { success: false, error: 'User not found after verification.' }
  }

  // Get user profile using adminClient
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profile?.role === 'admin') {
    return { success: true, redirectUrl: '/dashboard/admin' }
  }

  const { data: ownerRequest } = await adminClient
    .from('owner_requests')
    .select('status')
    .eq('user_id', data.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const isPendingOwner = ownerRequest?.status === 'pending'
  const isRejectedOwner = ownerRequest?.status === 'rejected'
  const isApprovedOwner = ownerRequest?.status === 'approved' || (profile?.role === 'owner' && !ownerRequest)

  // 1. Pending owner request: block login until approved
  if (isPendingOwner) {
    await supabase.auth.signOut()
    return { 
      success: false, 
      error: 'Your equipment owner registration is pending admin approval. You will be able to log in once an administrator approves your account.' 
    }
  }

  // 2. Rejected owner request: block login
  if (isRejectedOwner) {
    await supabase.auth.signOut()
    return { 
      success: false, 
      error: 'Your equipment owner registration was rejected by an administrator. Please contact support.' 
    }
  }

  // 3. Approved owner
  if (isApprovedOwner) {
    if (role === 'customer') {
      await supabase.auth.signOut()
      return { 
        success: false, 
        error: 'You are registered as an Equipment Owner. Please select the Equipment Owner tab to log in.' 
      }
    }
    return { success: true, redirectUrl: '/dashboard/owner' }
  }

  // 4. Standard customer
  if (role === 'owner') {
    await supabase.auth.signOut()
    return { 
      success: false, 
      error: 'You are not registered as an equipment owner. Please log in as a Customer, or register as an Equipment Owner.' 
    }
  }

  return { success: true, redirectUrl: '/dashboard/user' }
}

