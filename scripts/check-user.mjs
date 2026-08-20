import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  const email = 'Kotameena@gmail.com'
  console.log('Checking Auth User for:', email)
  
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('Error listing users:', listError)
    return
  }
  
  const user = usersData.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    console.log('Auth user NOT found!')
    return
  }
  
  console.log('Auth User Found:', {
    id: user.id,
    email: user.email,
    email_confirmed: user.email_confirmed_at,
    last_sign_in: user.last_sign_in_at
  })
  
  console.log('Checking Profile in Database...')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (profileError) {
    console.error('Profile error:', profileError)
  } else {
    console.log('Profile found:', profile)
  }
}

main().catch(console.error)
