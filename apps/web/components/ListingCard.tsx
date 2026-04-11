import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'

interface Listing {
  id: string
  titleEn: string
  titleUr?: string
  price?: number
  currency: string
  priceType: string
  locationText?: string
  createdAt: string
  category: { slug: string; nameEn: string; nameUr: string }
  city?: { nameEn: string; nameUr: string }
  images: { imageUrl: string; isPrimary: boolean }[]
}

function formatPrice(price: number | undefined, priceType: string, currency: string) {
  if (priceType === 'free') return 'Free'
  if (priceType === 'contact' || !price) return 'Contact'
  return `${currency} ${price.toLocaleString()}`
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const locale = useLocale()
  const title = locale === 'ur' && listing.titleUr ? listing.titleUr : listing.titleEn
  const cityName = listing.city ? (locale === 'ur' ? listing.city.nameUr : listing.city.nameEn) : null
  const primaryImage = listing.images.find(i => i.isPrimary) ?? listing.images[0]

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-neutral-100 relative">
        {primaryImage ? (
          <Image src={primaryImage.imageUrl} alt={title} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-4xl">🐄</div>
        )}
        <span className="absolute top-2 start-2 bg-white/90 text-xs px-2 py-0.5 rounded-full text-neutral-600 font-medium">
          {locale === 'ur' ? listing.category.nameUr : listing.category.nameEn}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold text-neutral-800 line-clamp-2 leading-snug">{title}</p>
        <p className="text-base font-bold text-primary-700 mt-auto">
          {formatPrice(listing.price, listing.priceType, listing.currency)}
          {listing.priceType === 'negotiable' && (
            <span className="text-xs font-normal text-neutral-400 ms-1">
              {locale === 'ur' ? '(قابل مذاکرہ)' : '(neg.)'}
            </span>
          )}
        </p>
        <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
          <span>{cityName ?? listing.locationText ?? '—'}</span>
          <span>{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}
