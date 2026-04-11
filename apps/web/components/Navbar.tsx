'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoggedIn, logout, isLoading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const otherLocale = locale === 'ur' ? 'en' : 'ur'
  const localePath = pathname.startsWith('/en') ? pathname.replace('/en', '') || '/' : `/en${pathname}`

  const handleLogout = async () => {
    await logout()
    router.push('/')
    setMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-neutral-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl text-primary-700 shrink-0 font-urdu">
          منڈی
        </Link>

        {/* Search bar — desktop */}
        <form
          className="hidden md:flex flex-1 max-w-xl"
          onSubmit={e => { e.preventDefault(); const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value; router.push(`/listings?q=${encodeURIComponent(q)}`) }}
        >
          <input
            name="q"
            type="search"
            placeholder={locale === 'ur' ? 'جانور، فصل تلاش کریں...' : 'Search animals, crops...'}
            className="flex-1 border border-neutral-200 rounded-s-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <button type="submit" className="bg-primary-600 text-white px-4 py-1.5 rounded-e-lg text-sm hover:bg-primary-700 transition-colors">
            {locale === 'ur' ? 'تلاش' : 'Search'}
          </button>
        </form>

        <div className="flex-1" />

        {/* Language switcher */}
        <Link href={localePath} className="text-xs text-neutral-500 hover:text-primary-600 transition-colors font-medium shrink-0">
          {otherLocale === 'ur' ? 'اردو' : 'EN'}
        </Link>

        {/* Post Ad */}
        <Link
          href="/listings/new"
          className="hidden sm:flex bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors shrink-0"
        >
          {t('post_ad')}
        </Link>

        {/* Auth / user menu */}
        {!isLoading && (
          isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 text-sm text-neutral-700 hover:text-primary-600 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute end-0 top-10 w-44 bg-white border border-neutral-100 rounded-xl shadow-lg z-50 py-1">
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-neutral-50">{t('my_ads')}</Link>
                  <Link href="/saved" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-neutral-50">{t('saved')}</Link>
                  <hr className="my-1 border-neutral-100" />
                  <button onClick={handleLogout} className="w-full text-start px-4 py-2 text-sm text-error-600 hover:bg-neutral-50">{t('logout')}</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2 shrink-0">
              <Link href="/login" className="text-sm text-neutral-600 hover:text-primary-600 px-2 py-1 transition-colors">{t('login')}</Link>
              <Link href="/register" className="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">{t('register')}</Link>
            </div>
          )
        )}
      </div>
    </nav>
  )
}
