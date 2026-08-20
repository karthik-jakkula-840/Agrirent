import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function verifyUser(email) {
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('Error listing users:', listError)
    return
  }
  
  const user = usersData.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    console.error('User not found:', email)
    return
  }

  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { email_confirm: true }
  )

  if (error) {
    console.error('Error confirming user:', error)
  } else {
    console.log('Successfully confirmed user:', email)
  }
}

const email = process.argv[2] || 'Kotameena@gmail.com'
verifyUser(email)
