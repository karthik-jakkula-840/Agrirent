import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  console.log('Testing Profiles RLS...')
  
  // Try to insert a dummy user in auth.users via admin API
  const email = `testuser_${Date.now()}@example.com`
  console.log(`Creating user ${email}`)
  
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { full_name: 'Test User' }
  })
  
  if (userError) {
    console.error('Failed to create user:', userError)
    return
  }
  
  const userId = userData.user.id
  console.log('User created:', userId)
  
  // Wait 1 second for trigger
  await new Promise(r => setTimeout(r, 1000))
  
  // Try to login to get a session
  const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
    email,
    password: 'Password123!'
  })
  
  if (authError) {
    console.error('Login failed:', authError)
  } else {
    console.log('Logged in as user, fetching profile with RLS...')
    const { data: profile, error: profileError } = await supabaseAnon
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (profileError) {
      console.error('Profile not found via RLS!', profileError)
    } else {
      console.log('Profile fetched via RLS successfully:', profile)
    }
  }
  
  // Cleanup
  console.log('Cleaning up user...')
  await supabase.auth.admin.deleteUser(userId)
}

main().catch(console.error)
