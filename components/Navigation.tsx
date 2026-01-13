'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CURRENT_USER } from '@/lib/mock-data'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Pipeline', href: '/pipeline' },
    { name: 'Portfolio', href: '/portfolio' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Nav */}
          <div className="flex items-center">
            {/* SAIF Logo - AI is bold */}
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-2xl tracking-tight text-[#1a1a1a]">
                <span className="font-light">S</span>
                <span className="font-bold">AI</span>
                <span className="font-light">F</span>
              </span>
            </Link>

            {/* Nav Items - hidden on small screens, shown on medium+ */}
            <div className="hidden md:flex md:ml-10 md:space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#f5f5f5] text-[#1a1a1a]'
                        : 'text-[#666666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - shown on small screens only */}
            <div className="relative md:hidden" ref={mobileMenuRef}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#666666] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              {/* Mobile Dropdown Menu */}
              {mobileMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px] z-50">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-[#f5f5f5] text-[#1a1a1a] font-medium'
                            : 'text-[#666666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Demo Mode Badge */}
            <span className="badge badge-purple">Demo Mode</span>

            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {CURRENT_USER.avatar}
                </span>
              </div>
              <span className="text-sm font-medium text-[#4a4a4a] hidden md:block">
                {CURRENT_USER.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
