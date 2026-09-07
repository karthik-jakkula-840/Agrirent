'use server'

import { TwoFactorService } from '@/lib/2factor'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function sendOtpAction(phoneNumber: string, templateName?: string) {
  try {
    const result = await TwoFactorService.sendOTP(phoneNumber, templateName);
    return result;
  } catch (error: any) {
    console.error('Error in sendOtpAction:', error);
    return { error: 'Failed to process OTP request.' };
  }
}

export async function verifyOtpAction(sessionId: string, otp: string) {
  try {
    const result = await TwoFactorService.verifyOTP(sessionId, otp);
    return result;
  } catch (error: any) {
    console.error('Error in verifyOtpAction:', error);
    return { success: false, error: 'Failed to process OTP verification.' };
  }
}

export async function handlePhoneLoginSession(phoneNumber: string, role: string) {
  try {
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    const dummyEmail = `${cleanNumber}@phone.agrirent.app`
    const adminClient = createAdminClient()
    const strongPassword = crypto.randomBytes(32).toString('hex') + 'Aa1!'
    
    let userId: string | undefined = undefined

    // 1. Try to create the user if they don't exist yet (always as customer)
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: dummyEmail,
      password: strongPassword,
      email_confirm: true,
      user_metadata: {
        phone: cleanNumber,
        role: 'customer',
        full_name: `User ${cleanNumber.slice(-4)}`
      }
    })

    if (createError && createError.message.includes('already exists')) {
      // 2. User exists, find their ID
      const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers()
      if (listError) throw listError
      
      const foundUser = usersData.users.find(u => u.email === dummyEmail)
      if (!foundUser) {
        return { success: false, error: 'User lookup failed.' }
      }
      
      userId = foundUser.id
      
      // 3. Update the password to our new strong password so we can log in
      const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
        password: strongPassword
      })
      if (updateError) throw updateError
    } else if (createError) {
      console.error('Error creating user:', createError)
      return { success: false, error: createError.message }
    } else if (newUser?.user) {
      userId = newUser.user.id
    }

    if (userId) {
      await (adminClient.from('profiles') as any)
        .update({ phone: cleanNumber })
        .eq('id', userId)
    }

    // 4. Use the standard client to log in and set cookies
    const supabase = await createClient()
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: strongPassword
    })

    if (loginError) {
      console.error('Login error:', loginError)
      return { success: false, error: loginError.message }
    }

    // Fetch profile and owner requests using adminClient to bypass RLS
    if (loginData.user) {
      const { data: profile } = await (adminClient.from('profiles') as any)
        .select('role')
        .eq('id', loginData.user.id)
        .single()
        
      if (profile?.role === 'admin') {
        return { success: true, redirectUrl: '/dashboard/admin' }
      }

      const { data: ownerRequest } = await (adminClient.from('owner_requests') as any)
        .select('status')
        .eq('user_id', loginData.user.id)
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
    }

    return { success: true, redirectUrl: '/dashboard/user' }

  } catch (error: any) {
    console.error('Error in handlePhoneLoginSession:', error)
    return { success: false, error: 'An unexpected error occurred establishing session.' }
  }
}
