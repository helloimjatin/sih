'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/patient', label: 'Patient', icon: 'personal_injury', active: pathname.startsWith('/patient') },
    { href: '/doctor', label: 'Doctor', icon: 'stethoscope', active: pathname.startsWith('/doctor') },
  ]

  return (
    <>
      {/* ── Top App Bar ── */}
      <header className="w-full sticky top-0 z-50 bg-surface-bright border-b border-outline-variant/40"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 sm:h-20 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="material-symbols-outlined text-primary text-[28px] sm:text-[32px] icon-fill group-hover:scale-105 transition-transform">
              healing
            </span>
            <span className="font-display font-bold text-[22px] sm:text-[28px] text-primary tracking-tight">
              MediKiosk
            </span>
          </Link>

          {/* Desktop Nav Pills */}
          <nav className="hidden sm:flex items-center gap-2 bg-surface-container p-1.5 rounded-full"
            style={{ boxShadow: 'inset 3px 3px 6px #dbd9d9, inset -3px -3px 6px #ffffff' }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-label-sm font-body font-semibold transition-all ${
                  link.active
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
                style={link.active ? { boxShadow: '0 3px 8px rgba(21,66,18,0.3)' } : {}}
              >
                <span className={`material-symbols-outlined text-[18px] ${link.active ? 'icon-fill' : ''}`}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* SIH Badge (desktop) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low"
            style={{ boxShadow: '3px 3px 6px #dbd9d9, -3px -3px 6px #ffffff' }}>
            <span className="material-symbols-outlined text-primary text-[16px] icon-fill">emoji_events</span>
            <span className="text-label-sm font-body text-on-surface-variant">SIH 2026</span>
          </div>

          {/* Mobile — show current section label */}
          <div className="sm:hidden flex items-center gap-1 text-label-sm font-body text-on-surface-variant">
            {pathname === '/' && <span>Home</span>}
            {pathname.startsWith('/patient') && <><span className="material-symbols-outlined text-[16px] text-primary">personal_injury</span><span className="text-primary font-bold">Patient Kiosk</span></>}
            {pathname.startsWith('/doctor') && <><span className="material-symbols-outlined text-[16px] text-primary">stethoscope</span><span className="text-primary font-bold">Doctor Console</span></>}
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-stretch bg-surface-bright border-t border-outline-variant pb-safe-bottom"
        style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
        <Link href="/"
          className={`flex flex-col items-center justify-center gap-0.5 px-6 py-3 flex-1 transition-colors ${
            pathname === '/' ? 'text-primary' : 'text-on-surface-variant'
          }`}>
          <span className={`material-symbols-outlined text-[24px] ${pathname === '/' ? 'icon-fill' : ''}`}>home</span>
          <span className="text-[11px] font-body font-semibold">Home</span>
        </Link>
        {navLinks.map(link => (
          <Link key={link.href} href={link.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-6 py-3 flex-1 transition-colors ${
              link.active ? 'text-primary' : 'text-on-surface-variant'
            }`}>
            <span className={`material-symbols-outlined text-[24px] ${link.active ? 'icon-fill' : ''}`}>
              {link.icon}
            </span>
            <span className="text-[11px] font-body font-semibold">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
