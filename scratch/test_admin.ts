import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function test() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  const email = 'test_find@phone.agrirent.app'
  
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: 'Password123!',
    email_confirm: true,
  })

  console.log('Create Error:', createError?.message)
  if (createError?.message.includes('already exists')) {
     // How to find the user?
     // Let's use listUsers
     const { data: users, error: listError } = await adminClient.auth.admin.listUsers()
     const foundUser = users.users.find(u => u.email === email)
     console.log('Found User ID:', foundUser?.id)
  } else {
     console.log('Created User ID:', newUser?.user?.id)
  }
}

test()
