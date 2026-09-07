'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Languages, ChevronDown } from 'lucide-react'

export function LanguageToggle() {
  const router = useRouter()
  const [language, setLanguageState] = useState<string>('en')

  useEffect(() => {
    const saved = Cookies.get('NEXT_LOCALE') || 'en'
    setLanguageState(saved)
  }, [])

  const setLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value
    setLanguageState(lang)
    Cookies.set('NEXT_LOCALE', lang, { expires: 365, path: '/' })
    router.refresh()
  }

  return (
    <div className="relative inline-flex items-center shrink-0">
      <div className="pointer-events-none absolute left-2.5 flex items-center text-gray-500">
        <Languages className="h-3.5 w-3.5 text-[#009b55]" />
      </div>
      <select 
        value={language} 
        onChange={setLanguage}
        aria-label="Select Language"
        className="appearance-none cursor-pointer text-xs font-semibold pl-7 pr-6 py-1.5 bg-gray-50/90 hover:bg-gray-100/90 border border-gray-200/90 rounded-full text-gray-700 outline-none focus:ring-2 focus:ring-[#009b55]/20 focus:border-[#009b55] transition-all"
      >
        <option value="en">EN</option>
        <option value="hi">हिंदी</option>
        <option value="te">తెలుగు</option>
      </select>
      <div className="pointer-events-none absolute right-2 flex items-center text-gray-400">
        <ChevronDown className="h-3 w-3" />
      </div>
    </div>
  )
}

