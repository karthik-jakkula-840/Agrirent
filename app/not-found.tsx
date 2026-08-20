import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tractor } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-[70vh] bg-gray-50/50">
      <main className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="relative mb-8">
          <div className="text-[120px] font-black text-gray-100 leading-none select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Tractor className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          The page or equipment you're looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>
        
        <div className="flex items-center gap-4">
          <Link href="/equipment">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Browse Equipment
            </Button>
          </Link>
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
