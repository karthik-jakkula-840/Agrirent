'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Tractor, Home, Grid, HelpCircle, Info, Phone, ArrowRight, UserCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { logout } from '@/features/auth/actions/auth-actions'

interface NavbarClientProps {
  user: any | null
  role: 'customer' | 'owner' | 'rental_owner' | 'admin' | null
}

const navLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Equipment', href: '/equipment', icon: Tractor },
  { name: 'Categories', href: '/categories', icon: Grid },
  { name: 'How It Works', href: '/#how-it-works', icon: HelpCircle },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Contact', href: '/contact', icon: Phone },
]

export function NavbarClient({ user, role }: NavbarClientProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const getDashboardLink = () => {
    if (role === 'admin') return '/dashboard/admin'
    if (role === 'owner' || role === 'rental_owner') return '/dashboard/owner'
    return '/dashboard/user'
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' 
            : 'bg-white/70 backdrop-blur-md md:bg-transparent py-3 md:py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Tractor className="h-7 w-7 md:h-8 md:w-8 text-[#009b55]" />
            <span className="text-xl md:text-2xl font-black tracking-tight text-gray-950">AGRIFORM</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <Link
                href="/signup?type=owner"
                className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
              >
                Become an Owner
              </Link>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link href={getDashboardLink()}>
                  <Button variant="ghost" className="text-gray-700">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/user/profile">
                  <Button variant="outline" className="border-gray-200">
                    Profile
                  </Button>
                </Link>
                <form action={logout}>
                  <Button variant="ghost" type="submit" className="text-gray-500">
                    Logout
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-700">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
              className="p-2 -mr-1.5 rounded-xl text-gray-800 hover:bg-gray-100/80 active:scale-95 transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                  <Link 
                    href="/" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <Tractor className="h-7 w-7 text-[#009b55]" />
                    <span className="text-xl font-black tracking-tight text-gray-950">AGRIFORM</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* User Status Card */}
                {user ? (
                  <div className="my-5 p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-[#009b55] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {user.email?.[0].toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-[11px] text-emerald-800 capitalize font-medium">{role || 'Customer'}</p>
                      </div>
                    </div>
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-semibold text-[#009b55] bg-white px-2.5 py-1.5 rounded-xl border border-emerald-200 shrink-0"
                    >
                      Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="my-5 grid grid-cols-2 gap-2">
                    <Link 
                      href="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-4 rounded-xl border border-gray-200 text-center font-semibold text-xs text-gray-700 hover:bg-gray-50"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/signup" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-4 rounded-xl bg-[#009b55] text-white text-center font-semibold text-xs hover:bg-[#00874a]"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="space-y-1 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
                    Menu
                  </p>
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-emerald-50/60 hover:text-[#009b55] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-400 group-hover:text-[#009b55] transition-colors" />
                          <span>{link.name}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#009b55] transition-colors" />
                      </Link>
                    )
                  })}

                  {!user && (
                    <Link
                      href="/signup?type=owner"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-secondary hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Tractor className="h-5 w-5 text-secondary" />
                        <span>Become an Owner</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-secondary/50" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-gray-100">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard/user/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-50"
                    >
                      <UserCircle className="h-4 w-4 text-gray-400" />
                      Profile Settings
                    </Link>
                    <form action={logout} className="w-full">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all active:scale-[0.98] shadow-xs"
                      >
                        <LogOut className="h-4 w-4 text-red-500" />
                        <span>Log out</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center">
                    Agriform · Smart Equipment Rental
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
