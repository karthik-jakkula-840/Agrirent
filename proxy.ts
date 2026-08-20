import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // Update session handles the SSR cookie refresh and returns the updated response
  // along with the user and supabase client so we can perform route protection.
  const { supabaseResponse, user, supabase } = await updateSession(request)

  const pathname = request.nextUrl.pathname

  // Public routes that authenticated users shouldn't see
  const isAuthRoute = pathname.startsWith('/login') || 
                      pathname.startsWith('/signup') || 
                      pathname.startsWith('/forgot-password') || 
                      pathname.startsWith('/reset-password')

  // Routes that require authentication
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/profile') || 
                           pathname.startsWith('/bookings') || 
                           pathname.startsWith('/favorites')
  
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const profile = data as any
    const role = profile?.role || 'customer'

    if (isAuthRoute) {
      // Redirect logged-in users to their respective dashboards
      const url = request.nextUrl.clone()
      let dashboardPath = role
      if (role === 'customer') dashboardPath = 'user'
      if (role === 'rental_owner' || role === 'owner') dashboardPath = 'owner'
      
      url.pathname = `/dashboard/${dashboardPath}`
      return NextResponse.redirect(url)
    }

    // Strict role-based protection
    if (pathname.startsWith('/dashboard')) {
      if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
        const url = request.nextUrl.clone()
        let dashboardPath = role
        if (role === 'customer') dashboardPath = 'user'
        if (role === 'rental_owner' || role === 'owner') dashboardPath = 'owner'
        
        url.pathname = `/dashboard/${dashboardPath}`
        return NextResponse.redirect(url)
      }
      if (pathname.startsWith('/dashboard/owner') && role !== 'owner' && role !== 'rental_owner') {
        const url = request.nextUrl.clone()
        let dashboardPath = role
        if (role === 'customer') dashboardPath = 'user'
        if (role === 'rental_owner' || role === 'owner') dashboardPath = 'owner'
        
        url.pathname = `/dashboard/${dashboardPath}`
        return NextResponse.redirect(url)
      }
      if (pathname.startsWith('/dashboard/user') && role !== 'customer') {
        const url = request.nextUrl.clone()
        let dashboardPath = role
        if (role === 'rental_owner' || role === 'owner') dashboardPath = 'owner'
        
        url.pathname = `/dashboard/${dashboardPath}`
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
