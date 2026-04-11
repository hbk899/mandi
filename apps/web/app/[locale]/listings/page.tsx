'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useLocale } from 'next-intl'
import { CATEGORIES, MAJOR_CITIES } from '@mandi/config'
import { api } from '../../../lib/api'
import ListingCard from '../../../components/ListingCard'

interface Listing {
  id: string; titleEn: string; titleUr?: string; price?: number
  currency: string; priceType: string; locationText?: string; createdAt: string
  category: { slug: string; nameEn: string; nameUr: string }
  city?: { nameEn: string; nameUr: string }
  images: { imageUrl: string; isPrimary: boolean }[]
}

interface ListingsResponse { listings: Listing[]; total: number; page: number; limit: number }

export default function ListingsPage() {
  return (
    <Suspense>
      <ListingsContent />
    </Suspense>
  )
}

function ListingsContent() {
  const locale = useLocale()
  const sp = useSearchParams()
  const router = useRouter()

  const [data, setData] = useState<ListingsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const q = sp.get('q') ?? ''
  const category = sp.get('category') ?? ''
  const city = sp.get('city') ?? ''
  const minPrice = sp.get('minPrice') ?? ''
  const maxPrice = sp.get('maxPrice') ?? ''
  const page = Number(sp.get('page') ?? '1')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    if (city) params.set('city', city)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    params.set('page', String(page))
    params.set('limit', '20')
    const endpoint = q ? `/search?${params}` : `/listings?${params}`
    try {
      const res = await api.get<ListingsResponse>(endpoint)
      setData(res)
    } catch { setData({ listings: [], total: 0, page: 1, limit: 20 }) }
    setLoading(false)
  }, [q, category, city, minPrice, maxPrice, page])

  useEffect(() => { fetchListings() }, [fetchListings])

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(sp.toString())
    value ? p.set(key, value) : p.delete(key)
    p.delete('page')
    router.push(`/listings?${p}`)
  }

  const isUr = locale === 'ur'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">
      {/* Sidebar filters */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="bg-white rounded-xl border border-neutral-100 p-4 sticky top-20 space-y-5">
          {/* Category */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">{isUr ? 'قسم' : 'Category'}</p>
            <div className="space-y-1">
              <button onClick={() => setParam('category', '')} className={`w-full text-start text-sm px-2 py-1 rounded-lg ${!category ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                {isUr ? 'سب' : 'All'}
              </button>
              {CATEGORIES.map(cat => (
                <button key={cat.slug} onClick={() => setParam('category', cat.slug)} className={`w-full text-start text-sm px-2 py-1 rounded-lg ${category === cat.slug ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                  {isUr ? cat.nameUr : cat.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">{isUr ? 'شہر' : 'City'}</p>
            <select value={city} onChange={e => setParam('city', e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">{isUr ? 'تمام شہر' : 'All cities'}</option>
              {MAJOR_CITIES.map(c => (
                <option key={c.id} value={c.id}>{isUr ? c.nameUr : c.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">{isUr ? 'قیمت' : 'Price (PKR)'}</p>
            <div className="flex gap-2">
              <input type="number" placeholder={isUr ? 'کم' : 'Min'} value={minPrice} onChange={e => setParam('minPrice', e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400" />
              <input type="number" placeholder={isUr ? 'زیادہ' : 'Max'} value={maxPrice} onChange={e => setParam('maxPrice', e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-neutral-800">
            {q ? `"${q}"` : isUr ? 'تمام اشتہارات' : 'All Listings'}
            {data && <span className="text-sm font-normal text-neutral-400 ms-2">({data.total})</span>}
          </h1>
        </div>

        {/* Mobile filters row */}
        <div className="flex gap-2 mb-4 md:hidden overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat.slug} onClick={() => setParam('category', category === cat.slug ? '' : cat.slug)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border ${category === cat.slug ? 'bg-primary-600 text-white border-primary-600' : 'border-neutral-200 text-neutral-600'}`}>
              {isUr ? cat.nameUr : cat.nameEn}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-neutral-100 rounded-xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : data?.listings.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">{isUr ? 'کوئی نتیجہ نہیں' : 'No listings found'}</p>
            <p className="text-sm mt-1">{isUr ? 'فلٹر تبدیل کریں' : 'Try changing your filters'}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data?.listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
            {/* Pagination */}
            {data && data.total > data.limit && (
              <div className="flex justify-center gap-2 mt-8">
                {page > 1 && (
                  <button onClick={() => setParam('page', String(page - 1))} className="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                    {isUr ? 'پچھلا' : 'Previous'}
                  </button>
                )}
                <span className="px-4 py-2 text-sm text-neutral-500">
                  {page} / {Math.ceil(data.total / data.limit)}
                </span>
                {page < Math.ceil(data.total / data.limit) && (
                  <button onClick={() => setParam('page', String(page + 1))} className="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                    {isUr ? 'اگلا' : 'Next'}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
