import { createClient } from './supabase/server'
import { errorResponse } from './api-response'

export type Role = 'customer' | 'owner' | 'admin' | 'rental_owner'

export async function requireAuth(): Promise<{ user: any, profile: any, error: any }> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, profile: null, error: errorResponse('Unauthorized', 'UNAUTHORIZED', 401) }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { user: null, profile: null, error: errorResponse('Profile not found', 'PROFILE_NOT_FOUND', 404) }
  }

  return { user, profile, error: null }
}

export async function requireRole(allowedRoles: Role[]): Promise<{ user: any, profile: any, error: any }> {
  const { user, profile, error } = await requireAuth()

  if (error) return { user: null, profile: null, error }

  // Check if profile.role exists in allowedRoles
  if (!allowedRoles.includes(profile.role as Role) && profile.role !== 'admin') {
    return { user: null, profile: null, error: errorResponse('Forbidden', 'FORBIDDEN', 403) }
  }

  return { user, profile, error: null }
}
