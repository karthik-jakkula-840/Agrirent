export function handleSupabaseError(error: any): { message: string; code: string } {
  console.error('Supabase Error:', error)

  if (error?.code) {
    // Handle specific Postgres/Supabase error codes
    switch (error.code) {
      case '23505':
        return { message: 'A record with this information already exists.', code: 'UNIQUE_VIOLATION' }
      case '23503':
        return { message: 'Related record not found.', code: 'FOREIGN_KEY_VIOLATION' }
      case 'PGRST116':
        return { message: 'Record not found.', code: 'NOT_FOUND' }
      case 'PGRST301':
        return { message: 'You do not have permission to perform this action.', code: 'RLS_VIOLATION' }
      default:
        return { message: 'An unexpected database error occurred.', code: 'DATABASE_ERROR' }
    }
  }

  // Auth errors typically have different structures
  if (error?.message) {
    return { message: error.message, code: 'AUTH_ERROR' }
  }

  return { message: 'An unknown error occurred.', code: 'UNKNOWN_ERROR' }
}
