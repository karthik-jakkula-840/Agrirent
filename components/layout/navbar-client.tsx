'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Tractor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { logout } from '@/features/auth/actions/auth-actions'

interface NavbarClientProps {
  user: any | null
  role: 'customer' | 'owner' | 'rental_owner' | 'admin' | null
}

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Equipment', href: '/equipment' },
  { name: 'Categories', href: '/categories' },
  { name: 'How It Works', href: '/#how-it-works' },
  { name: 'About', href: '/about' },
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

  const getDashboardLink = () => {
    if (role === 'admin') return '/dashboard/admin'
    if (role === 'owner' || role === 'rental_owner') return '/dashboard/owner'
    return '/dashboard/user'
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Tractor className="h-8 w-8" />
          <span className="text-2xl font-bold tracking-tight text-gray-900">AGRIFORM</span>
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
              <Link href="/profile">
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

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-4 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium text-gray-700 p-2 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <Link
                href="/signup?type=owner"
                className="text-base font-medium text-secondary p-2 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Become an Owner
              </Link>
            )}
            <hr className="my-2 border-gray-100" />
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      Dashboard
                    </Button>
                  </Link>
                  <form action={logout} className="w-full">
                    <Button variant="ghost" type="submit" className="w-full justify-start text-red-500">
                      Logout
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-start bg-primary text-white">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
