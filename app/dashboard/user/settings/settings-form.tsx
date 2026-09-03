'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Loader2, CheckCircle2, Shield, Globe, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/features/auth/actions/auth-actions'

export function SettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('new_password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setIsSubmitting(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      setSuccess(true)
      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-400" /> Security
          </h2>
          <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure.</p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          {success && <p className="text-sm text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Password updated successfully.</p>}

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input id="new_password" name="new_password" type="password" required className="pl-9" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input id="confirm_password" name="confirm_password" type="password" required className="pl-9" />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Update Password'}
          </Button>
        </form>
      </section>

      <section>
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-400" /> Preferences
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage your language and accessibility settings.</p>
        </div>
        
        <div className="space-y-6 max-w-md">
          <div className="flex items-center justify-between border border-gray-200 p-4 rounded-xl">
            <div>
              <Label className="text-base font-semibold">SMS Notifications</Label>
              <p className="text-sm text-gray-500">Receive SMS updates for your bookings.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border border-gray-200 p-4 rounded-xl">
            <div>
              <Label className="text-base font-semibold">WhatsApp Notifications</Label>
              <p className="text-sm text-gray-500">Receive WhatsApp updates for your bookings.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#25D366]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              name="language"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue="en"
            >
              <option value="en">English</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
          <Button type="button" className="w-full bg-primary text-white" onClick={() => {
            const select = document.getElementById('language') as HTMLSelectElement;
            if (select) {
              alert(`Language changed to ${select.value}`);
            }
          }}>
            Apply Changes
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LogOut className="h-5 w-5 text-gray-400" /> Account Session
          </h2>
          <p className="text-sm text-gray-500 mt-1">Sign out from your active account on this device.</p>
        </div>
        
        <div className="max-w-md">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all active:scale-[0.98] shadow-xs"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
