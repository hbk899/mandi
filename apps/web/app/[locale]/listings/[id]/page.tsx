'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '../../../../lib/api'
import { useAuth } from '../../../../lib/auth'

interface ListingDetail {
  id: string
  titleEn: string
  titleUr?: string
  descriptionEn?: string
  descriptionUr?: string
  price?: number
  currency: string
  priceType: string
  locationText?: string
  attributes?: Record<string, unknown>
  createdAt: string
  status: string
  category: { slug: string; nameEn: string; nameUr: string }
  city?: { nameEn: string; nameUr: string }
  images: { id: string; imageUrl: string; isPrimary: boolean }[]
  user: { id: string; name: string; phone: string }
}

function formatPrice(price: number | undefined, priceType: string, currency: string) {
  if (priceType === 'free') return 'Free'
  if (priceType === 'contact' || !price) return 'Contact for price'
  return `${currency} ${price.toLocaleString()}`
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const locale = useLocale()
  const router = useRouter()
  const { token, user: authUser } = useAuth()
  const isUr = locale === 'ur'

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.get<ListingDetail>(`/listings/${id}`)
      .then(setListing)
      .catch(() => setListing(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm(isUr ? 'کیا آپ واقعی اس اشتہار کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this listing?')) return
    setDeleting(true)
    try {
      await api.delete(`/listings/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      router.push('/listings')
    } catch {
      alert(isUr ? 'خطا — دوبارہ کوشش کریں' : 'Error — please try again')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="bg-neutral-200 rounded-xl aspect-video" />
          <div className="h-8 bg-neutral-200 rounded w-3/4" />
          <div className="h-6 bg-neutral-200 rounded w-1/4" />
          <div className="h-24 bg-neutral-200 rounded" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-neutral-400">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-lg font-medium">{isUr ? 'اشتہار نہیں ملا' : 'Listing not found'}</p>
        <Link href="/listings" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
          {isUr ? '← تمام اشتہارات' : '← All Listings'}
        </Link>
      </div>
    )
  }

  const title = isUr && listing.titleUr ? listing.titleUr : listing.titleEn
  const description = isUr && listing.descriptionUr ? listing.descriptionUr : listing.descriptionEn
  const cityName = listing.city ? (isUr ? listing.city.nameUr : listing.city.nameEn) : null
  const isOwner = authUser?.id === listing.user.id

  const sortedImages = [...listing.images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-neutral-400 mb-4">
        <Link href="/listings" className="hover:text-primary-600">{isUr ? 'تمام اشتہارات' : 'All Listings'}</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-600">{isUr ? listing.category.nameUr : listing.category.nameEn}</span>
      </nav>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Images */}
        <div className="md:col-span-3 space-y-3">
          <div className="rounded-xl overflow-hidden bg-neutral-100 aspect-[4/3] relative">
            {sortedImages.length > 0 ? (
              <Image
                src={sortedImages[activeImage]?.imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300 text-6xl">🐄</div>
            )}
          </div>
          {sortedImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sortedImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === activeImage ? 'border-primary-500' : 'border-transparent'}`}
                >
                  <Image src={img.imageUrl} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              {isUr ? listing.category.nameUr : listing.category.nameEn}
            </span>
            <h1 className="text-xl font-bold text-neutral-800 mt-2 leading-snug">{title}</h1>
            <p className="text-2xl font-bold text-primary-700 mt-2">
              {formatPrice(listing.price, listing.priceType, listing.currency)}
              {listing.priceType === 'negotiable' && (
                <span className="text-sm font-normal text-neutral-400 ms-1">
                  {isUr ? '(قابل مذاکرہ)' : '(negotiable)'}
                </span>
              )}
            </p>
          </div>

          <div className="text-sm text-neutral-500 space-y-1">
            {(cityName || listing.locationText) && (
              <p>📍 {cityName ?? listing.locationText}</p>
            )}
            <p>🕐 {timeAgo(listing.createdAt)}</p>
          </div>

          {/* Seller contact */}
          <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-neutral-500 uppercase">{isUr ? 'فروخت کنندہ' : 'Seller'}</p>
            <p className="font-semibold text-neutral-800">{listing.user.name}</p>
            <a
              href={`tel:${listing.user.phone}`}
              className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              📞 {listing.user.phone}
            </a>
            <a
              href={`https://wa.me/${listing.user.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              WhatsApp
            </a>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/listings/${listing.id}/edit`}
                className="flex-1 text-center py-2 border border-primary-300 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
              >
                {isUr ? 'ترمیم' : 'Edit'}
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 border border-error-300 text-error-600 rounded-lg text-sm font-medium hover:bg-error-50 transition-colors disabled:opacity-50"
              >
                {deleting ? '...' : isUr ? 'حذف' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">{isUr ? 'تفصیل' : 'Description'}</h2>
          <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">{description}</p>
        </div>
      )}
    </div>
  )
}
