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

        {/* Mobile Toggle & Actions */}
        <div className="flex md:hidden items-center gap-3">
          {user ? (
            <Link href="/profile">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-primary text-white text-xs h-8 px-3 rounded-full">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
