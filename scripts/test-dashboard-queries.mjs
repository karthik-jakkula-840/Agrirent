import { createClient } from '@supabase/supabase-js'
import { OwnerService } from '../services/owner.service.ts'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testQueries() {
  const email = 'browser_test_owner_val16@example.com'
  console.log(`[TEST] Looking up user with email: ${email}`)

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('[TEST] Error listing users:', listError)
    return
  }

  const user = usersData.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    console.error('[TEST] User not found!')
    return
  }

  const ownerId = user.id
  console.log(`[TEST] Found User ID: ${ownerId}`)

  const ownerService = new OwnerService(supabase)

  try {
    console.log('[TEST] Calling getDashboardStats...')
    const stats = await ownerService.getDashboardStats(ownerId)
    console.log('[TEST] getDashboardStats result:', stats)
  } catch (err) {
    console.error('[TEST] getDashboardStats failed:', err)
  }

  try {
    console.log('[TEST] Calling getRecentBookingRequests...')
    const requests = await ownerService.getRecentBookingRequests(ownerId)
    console.log('[TEST] getRecentBookingRequests result count:', requests.length)
  } catch (err) {
    console.error('[TEST] getRecentBookingRequests failed:', err)
  }

  try {
    console.log('[TEST] Calling getRevenueAnalytics...')
    const analytics = await ownerService.getRevenueAnalytics(ownerId)
    console.log('[TEST] getRevenueAnalytics result count:', analytics.length)
  } catch (err) {
    console.error('[TEST] getRevenueAnalytics failed:', err)
  }
}

testQueries().catch(console.error)
