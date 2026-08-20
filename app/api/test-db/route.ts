import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Perform a simple health check query that doesn't expose sensitive data
    // We can query the built-in pg_stat_activity or just a simple auth check
    const { data, error } = await supabase.from('profiles').select('id').limit(1)

    if (error) {
      console.error('Database connection test failed:', error)
      return NextResponse.json(
        { success: false, message: 'Database connection failed' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Successfully connected to database' },
      { status: 200 }
    )
  } catch (err) {
    console.error('Unexpected error during db test:', err)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
