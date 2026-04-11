'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { CATEGORIES, MAJOR_CITIES } from '@mandi/config'
import { api } from '../../lib/api'
import ListingCard from '../../components/ListingCard'

interface Listing {
  id: string; titleEn: string; titleUr?: string; price?: number
  currency: string; priceType: string; locationText?: string; createdAt: string
  category: { slug: string; nameEn: string; nameUr: string }
  city?: { nameEn: string; nameUr: string }
  images: { imageUrl: string; isPrimary: boolean }[]
}

export default function HomePage() {
  const t = useTranslations()
  const locale = useLocale()
  const isUr = locale === 'ur'
  const router = useRouter()

  const [recent, setRecent] = useState<Listing[]>([])

  useEffect(() => {
    api.get<{ listings: Listing[] }>('/listings?limit=8&page=1')
      .then(res => setRecent(res.listings))
      .catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
    if (q) router.push(`/listings?q=${encodeURIComponent(q)}`)
    else router.push('/listings')
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2 font-urdu">منڈی</h1>
        <p className="text-primary-100 text-lg mb-8">
          {isUr ? 'پاکستان کی بہترین مارکیٹ — جانور اور زرعی اشیاء خریدیں اور بیچیں' : "Pakistan's marketplace for animals & agriculture"}
        </p>
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
          <input
            name="q"
            type="search"
            placeholder={t('search.placeholder')}
            className="flex-1 rounded-lg px-4 py-3 text-neutral-900 text-base focus:outline-none"
          />
          <button type="submit" className="bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            {t('search.button')}
          </button>
        </form>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-neutral-800">
          {t('categories.all')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/listings?category=${cat.slug}`}
              className="bg-white rounded-xl p-6 text-center shadow-card hover:shadow-md transition-shadow border border-neutral-100"
            >
              <p className="text-lg font-semibold text-neutral-800 font-urdu">{cat.nameUr}</p>
              <p className="text-sm text-neutral-500 mt-1">{cat.nameEn}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent listings */}
      {recent.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-800">
              {isUr ? 'تازہ ترین اشتہارات' : 'Recent Listings'}
            </h2>
            <Link href="/listings" className="text-sm text-primary-600 hover:underline font-medium">
              {isUr ? 'سب دیکھیں ←' : 'View all →'}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recent.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {/* Browse by city */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-neutral-800">
            {isUr ? 'شہر کے مطابق تلاش کریں' : 'Browse by City'}
          </h2>
          <div className="flex flex-wrap gap-3">
            {MAJOR_CITIES.map((city) => (
              <Link
                key={city.id}
                href={`/listings?city=${city.id}`}
                className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors"
              >
                {isUr ? city.nameUr : city.nameEn}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary-500 py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isUr ? 'اپنا اشتہار دیں' : 'Sell Something Today'}
        </h2>
        <p className="text-secondary-100 mb-6">
          {isUr ? 'مفت اشتہار دیں اور لاکھوں خریداروں تک پہنچیں' : 'Post a free ad and reach thousands of buyers'}
        </p>
        <Link
          href="/listings/new"
          className="bg-white text-secondary-600 font-bold px-8 py-3 rounded-xl hover:bg-secondary-50 transition-colors inline-block"
        >
          {isUr ? 'اشتہار دیں' : 'Post Free Ad'}
        </Link>
      </section>
    </main>
  )
}
