'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth'
import { api } from '../../../lib/api'
import ListingCard from '../../../components/ListingCard'

interface Listing {
  id: string; titleEn: string; titleUr?: string; price?: number
  currency: string; priceType: string; locationText?: string; createdAt: string
  category: { slug: string; nameEn: string; nameUr: string }
  city?: { nameEn: string; nameUr: string }
  images: { imageUrl: string; isPrimary: boolean }[]
}

export default function ProfilePage() {
  const locale = useLocale()
  const isUr = locale === 'ur'
  const router = useRouter()
  const { user, token, isLoggedIn, isLoading: authLoading, logout } = useAuth()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push('/login')
  }, [authLoading, isLoggedIn, router])

  useEffect(() => {
    if (!token) return
    api.get<Listing[]>('/users/me/listings', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setListings(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (authLoading || !user) return null

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-neutral-800">{user.name}</p>
          <p className="text-sm text-neutral-400">{user.email}</p>
          <p className="text-sm text-neutral-400">{user.phone}</p>
        </div>
        <button
          onClick={async () => { await logout(); router.push('/') }}
          className="text-sm text-error-600 hover:underline"
        >
          {isUr ? 'باہر نکلیں' : 'Logout'}
        </button>
      </div>

      {/* My listings */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neutral-800">
          {isUr ? 'میرے اشتہارات' : 'My Listings'}
        </h2>
        <Link
          href="/listings/new"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          + {isUr ? 'نیا اشتہار' : 'New Listing'}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-neutral-100 rounded-xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">{isUr ? 'ابھی تک کوئی اشتہار نہیں' : 'No listings yet'}</p>
          <Link href="/listings/new" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
            {isUr ? 'پہلا اشتہار دیں →' : 'Post your first listing →'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {listings.map(l => (
            <div key={l.id} className="flex flex-col gap-2">
              <ListingCard listing={l} />
              <Link
                href={`/listings/${l.id}/edit`}
                className="text-center text-xs text-neutral-500 hover:text-primary-600 border border-neutral-200 hover:border-primary-300 rounded-lg py-1.5 transition-colors"
              >
                {isUr ? 'ترمیم کریں' : 'Edit'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
