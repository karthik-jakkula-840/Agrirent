import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  href: string
  label?: string
  className?: string
}

export function BackButton({ href, label = 'Back', className }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 bg-white border border-gray-200/90 shadow-2xs hover:text-[#009b55] hover:border-[#009b55]/40 hover:bg-emerald-50/50 active:scale-95 transition-all duration-200 group w-fit select-none",
        className
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#009b55] group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </Link>
  )
}

