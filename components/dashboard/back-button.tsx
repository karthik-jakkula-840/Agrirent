import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  href: string
  label?: string
  className?: string
}

export function BackButton({ href, label = 'Back to Admin Dashboard', className }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-600 bg-white border border-gray-200/90 shadow-sm hover:text-green-700 hover:border-green-300 hover:bg-green-50/60 hover:shadow transition-all duration-200 group w-fit",
        className
      )}
    >
      <ChevronLeft className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:-translate-x-0.5 transition-all" />
      <span>{label}</span>
    </Link>
  )
}
