import 'server-only'

// Validates server-only environment variables to prevent accidental imports in client components
export const env = {
  get SUPABASE_SERVICE_ROLE_KEY() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in the environment.')
    }
    return key
  },
}
