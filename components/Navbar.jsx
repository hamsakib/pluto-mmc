'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-[#080808]/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-xl font-black text-white tracking-tight leading-none">plut</span>
            <span
              className="inline-block w-[18px] h-[18px] rounded-full bg-[#2B47CC] group-hover:bg-[#2338A8] transition-colors mb-[1px] ml-[1px]"
              aria-hidden="true"
            />
            <span className="ml-1.5 text-[9px] font-semibold tracking-[0.2em] text-[#555] uppercase self-end mb-[3px]">
              Marketing
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-[#888] hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="secondary" size="sm">Dashboard</Button>
                </Link>
                <div className="flex items-center gap-2">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={28}
                      height={28}
                      className="rounded-full ring-1 ring-[#333]"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm text-[#888] hover:text-white transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-[#888] hover:text-white p-1 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#1a1a1a] bg-[#080808] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm text-[#888] hover:text-white rounded-lg hover:bg-white/5 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#1a1a1a] flex flex-col gap-2">
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">Dashboard</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                  className="w-full"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Log in</Button>
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
