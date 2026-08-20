import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  console.log('Listing all auth users...')
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('Error listing users:', listError)
    return
  }
  
  console.log(`Total users in auth: ${usersData.users.length}`)
  const sortedUsers = usersData.users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  console.log('\nAll Users in auth.users:')
  sortedUsers.forEach(u => {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Created At: ${u.created_at} | Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'}`)
  })
  
  console.log('\nChecking corresponding profiles in database...')
  const ids = sortedUsers.map(u => u.id)
  if (ids.length > 0) {
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', ids)
      
    if (pError) {
      console.error('Error fetching profiles:', pError)
    } else {
      console.log(`Found ${profiles.length} profiles for these users:`)
      profiles.forEach(p => {
        console.log(`- ID: ${p.id} | Name: ${p.full_name} | Role: ${p.role}`)
      })
    }
  }
}

main().catch(console.error)
