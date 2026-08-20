'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col min-h-[70vh] bg-gray-50/50">
      <main className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          We apologize for the inconvenience. An unexpected error occurred while processing your request.
        </p>
        <div className="flex items-center gap-4">
          <Button onClick={reset} size="lg" className="bg-primary hover:bg-primary/90 text-white">
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">
              Return Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
