import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testSignup() {
  const email = `test_owner_${Date.now()}@example.com`
  const password = 'Password123'
  const fullName = 'Test Owner'
  const role = 'owner'

  console.log(`[TEST] Creating owner with email: ${email}`)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: '1234567890',
        role: role,
      },
    },
  })

  if (error) {
    console.error('[TEST] Signup failed:', error.message)
    return
  }

  const userId = data.user.id
  console.log(`[TEST] Signup successful. User ID: ${userId}`)

  // Confirm the user's email using admin client
  console.log(`[TEST] Auto-confirming email for User ID: ${userId}`)
  const { error: confirmError } = await supabase.auth.admin.updateUserById(
    userId,
    { email_confirm: true }
  )

  if (confirmError) {
    console.error('[TEST] Confirm failed:', confirmError.message)
  } else {
    console.log('[TEST] Email confirmed successfully')
  }

  // Retrieve the profile from public.profiles table
  console.log('[TEST] Fetching profile from database...')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error('[TEST] Profile fetch failed:', profileError.message)
  } else {
    console.log('[TEST] Profile found:', profile)
  }

  // Cleanup test user
  console.log('[TEST] Cleaning up test user...')
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
  if (deleteError) {
    console.error('[TEST] Cleanup failed:', deleteError.message)
  } else {
    console.log('[TEST] Cleanup complete')
  }
}

testSignup().catch(console.error)
