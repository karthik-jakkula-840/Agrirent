import { getCurrentUser, getUserRole } from '@/lib/supabase/auth'
import { NavbarClient } from './navbar-client'

export async function Navbar() {
  const user = await getCurrentUser()
  const role = await getUserRole()

  return <NavbarClient user={user} role={role} />
}
