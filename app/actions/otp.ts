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

    // 1. Try to create the user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: dummyEmail,
      password: strongPassword,
      email_confirm: true,
      user_metadata: {
        phone: cleanNumber,
        role: role,
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

    // Determine redirect
    let destination = '/dashboard/user'
    
    // Fetch profile to check role
    if (loginData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', loginData.user.id)
        .single()
        
      if (profile) {
        if (profile.role === 'admin') destination = '/dashboard/admin'
        else if (profile.role === 'owner' || profile.role === 'rental_owner') destination = '/dashboard/owner'
      }
    }

    return { success: true, redirectUrl: destination }

  } catch (error: any) {
    console.error('Error in handlePhoneLoginSession:', error)
    return { success: false, error: 'An unexpected error occurred establishing session.' }
  }
}
