import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LanguageCode } from '@/lib/translations'

interface LanguageState {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'agrirent-language-storage',
    }
  )
)
