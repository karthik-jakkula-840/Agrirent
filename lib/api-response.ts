import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, code: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  )
}

export function handleApiError(error: any) {
  console.error('[API Error]', error)

  if (error instanceof ZodError) {
    const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    return errorResponse(message, 'VALIDATION_ERROR', 400)
  }

  // Handle Supabase/PostgREST error object
  if (error && typeof error === 'object' && 'message' in error) {
    if (error.message === 'EQUIPMENT_UNAVAILABLE') {
      return errorResponse('Equipment is already booked for these dates.', 'CONFLICT', 409)
    }
    return errorResponse(error.message, error.code || 'DATABASE_ERROR', 500)
  }

  if (error instanceof Error) {
    // Check for common Supabase errors if necessary, but don't leak internals
    return errorResponse(error.message, 'INTERNAL_SERVER_ERROR', 500)
  }

  return errorResponse('An unexpected error occurred', 'INTERNAL_SERVER_ERROR', 500)
}
