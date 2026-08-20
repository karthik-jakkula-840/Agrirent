import 'server-only'
import { createClient } from './server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = data as any
  if (error || !profile) return null
  return profile
}

export async function getUserRole(): Promise<'customer' | 'owner' | 'admin' | null> {
  const profile = await getCurrentProfile()
  if (!profile) return null
  return profile.role as 'customer' | 'owner' | 'admin'
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(role: 'customer' | 'owner' | 'admin') {
  const userRole = await getUserRole()
  if (userRole !== role) {
    throw new Error('Forbidden')
  }
}
