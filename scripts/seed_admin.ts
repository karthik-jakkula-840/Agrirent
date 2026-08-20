import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedAdmin() {
  const email = 'admin@agrirent.com'
  const password = 'admin123'

  console.log(`Creating admin user: ${email}`)

  // 1. Create User in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: 'System Admin'
    }
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('Admin user already exists in auth.users')
      
      // Try to find the user to update the profile anyway
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
      if (!listError && users) {
        const existingAdmin = users.find(u => u.email === email)
        if (existingAdmin) {
           await updateProfile(existingAdmin.id)
        }
      }
      return
    }
    console.error('Error creating user:', authError)
    process.exit(1)
  }

  if (authData.user) {
    await updateProfile(authData.user.id)
    console.log('✅ Admin user successfully seeded!')
  }
}

async function updateProfile(userId: string) {
  console.log(`Updating profile role to admin for user ${userId}...`)
  
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      role: 'admin',
      full_name: 'System Admin',
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Error updating profile role:', profileError)
  } else {
    console.log('Profile successfully updated to admin role.')
  }
}

seedAdmin().catch(console.error)
