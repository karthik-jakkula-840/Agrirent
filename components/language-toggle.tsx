'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Languages } from 'lucide-react'

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
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-gray-500" />
      <select 
        value={language} 
        onChange={setLanguage}
        aria-label="Select Language"
        className="text-sm bg-white border border-gray-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="te">తెలుగు (Telugu)</option>
      </select>
    </div>
  )
}
