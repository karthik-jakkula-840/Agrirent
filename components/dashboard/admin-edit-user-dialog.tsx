'use client'

import { useState } from 'react'
import { updateUserAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit2, Loader2, User, Mail, Phone, ShieldCheck, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface AdminEditUserDialogProps {
  user: {
    id: string
    full_name: string | null
    email: string | null
    phone: string | null
    role: string
  }
  variant?: 'table' | 'card'
}

export function AdminEditUserDialog({ user, variant = 'table' }: AdminEditUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState(user.full_name || '')
  const [email, setEmail] = useState(user.email || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [role, setRole] = useState<'customer' | 'owner' | 'admin'>((user.role as any) || 'customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFullName(user.full_name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setRole((user.role as any) || 'customer')
      setError(null)
    }
    setOpen(newOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await updateUserAction(user.id, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
      })

      if (!res.success) {
        setError(res.error || 'Failed to update user.')
        toast.error(res.error || 'Failed to update user.')
      } else {
        toast.success(`Updated ${fullName || 'user'} successfully!`)
        setOpen(false)
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.')
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          variant === 'card' ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold text-gray-700 hover:text-green-700 border-gray-200 hover:border-green-300 hover:bg-green-50/50 rounded-xl"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5 text-gray-500" /> Edit User
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-xl px-2.5"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> Edit
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-green-100 text-green-700 rounded-xl">
              <Edit2 className="h-4 w-4" />
            </div>
            Edit User Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Update account details, contact email, phone number, and access role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-gray-400" /> Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              required
              className="h-10 text-sm rounded-xl border-gray-200 focus-visible:ring-green-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-400" /> Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@example.com"
              required
              className="h-10 text-sm rounded-xl border-gray-200 focus-visible:ring-green-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-gray-400" /> Phone Number
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="h-10 text-sm rounded-xl border-gray-200 focus-visible:ring-green-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-gray-400" /> Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="customer">Customer (Farmer / Renter)</option>
              <option value="owner">Equipment Owner</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-xl border-gray-200 text-gray-600 text-xs h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs h-10 font-semibold shadow-sm shadow-green-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
