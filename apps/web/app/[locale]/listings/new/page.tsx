'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { CATEGORIES_FLAT, MAJOR_CITIES } from '@mandi/config'
import { api } from '../../../../lib/api'
import { useAuth } from '../../../../lib/auth'
import { useImageUpload } from '../../../../hooks/useImageUpload'
import ImageGrid from '../../../../components/ImageGrid'

export default function NewListingPage() {
  const locale = useLocale()
  const isUr = locale === 'ur'
  const router = useRouter()
  const { token, isLoggedIn, isLoading: authLoading } = useAuth()

  const [titleEn, setTitleEn] = useState('')
  const [titleUr, setTitleUr] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionUr, setDescriptionUr] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [cityId, setCityId] = useState('')
  const [locationText, setLocationText] = useState('')
  const [price, setPrice] = useState('')
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable' | 'free' | 'contact'>('fixed')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { images, error: uploadError, handleFiles, setPrimary, removeImage } = useImageUpload(token)

  if (!authLoading && !isLoggedIn) {
    router.push('/login')
    return null
  }

  const error = formError || uploadError

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!titleEn.trim()) {
      setFormError(isUr ? 'انگریزی عنوان ضروری ہے' : 'English title is required')
      return
    }
    if (!categorySlug) {
      setFormError(isUr ? 'قسم منتخب کریں' : 'Please select a category')
      return
    }
    if (images.some(img => img.pending)) {
      setFormError(isUr ? 'تصاویر اپلوڈ ہو رہی ہیں — انتظار کریں' : 'Images are still uploading — please wait')
      return
    }
    setSubmitting(true)
    try {
      const body = {
        titleEn: titleEn.trim(),
        ...(titleUr.trim() && { titleUr: titleUr.trim() }),
        ...(descriptionEn.trim() && { descriptionEn: descriptionEn.trim() }),
        ...(descriptionUr.trim() && { descriptionUr: descriptionUr.trim() }),
        categorySlug,
        ...(cityId && { cityId }),
        ...(locationText.trim() && { locationText: locationText.trim() }),
        priceType,
        currency: 'PKR',
        ...((priceType === 'fixed' || priceType === 'negotiable') && price ? { price: Number(price) } : {}),
      }
      const res = await api.post<{ id: string }>('/listings', body, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (images.length > 0) {
        await api.post(`/uploads/listings/${res.id}/images`, {
          images: images.map(img => ({ publicId: img.publicId, imageUrl: img.imageUrl, isPrimary: img.isPrimary })),
        }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
      }
      router.push(`/listings/${res.id}`)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : isUr ? 'خطا — دوبارہ کوشش کریں' : 'Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  const leafCategories = CATEGORIES_FLAT.filter(c => !c.children)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">
        {isUr ? 'نیا اشتہار دیں' : 'Post a New Listing'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 space-y-4">
          <h2 className="font-semibold text-neutral-700">{isUr ? 'عنوان' : 'Title'}</h2>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">English Title *</label>
            <input
              type="text"
              required
              value={titleEn}
              onChange={e => setTitleEn(e.target.value)}
              maxLength={120}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="e.g. 2 Year Old Black Goat for Sale"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">اردو عنوان (اختیاری)</label>
            <input
              type="text"
              value={titleUr}
              onChange={e => setTitleUr(e.target.value)}
              maxLength={120}
              dir="rtl"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 font-urdu"
              placeholder="مثلاً دو سالہ کالی بکری فروخت کے لیے"
            />
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <h2 className="font-semibold text-neutral-700 mb-3">{isUr ? 'قسم' : 'Category'} *</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {leafCategories.map(cat => (
              <button
                type="button"
                key={cat.slug}
                onClick={() => setCategorySlug(cat.slug)}
                className={`text-sm px-3 py-2 rounded-lg border text-start transition-colors ${
                  categorySlug === cat.slug
                    ? 'bg-primary-50 border-primary-400 text-primary-700 font-semibold'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <span className="block text-xs font-normal text-neutral-400">{cat.nameEn}</span>
                <span className="font-urdu">{cat.nameUr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
          <h2 className="font-semibold text-neutral-700">{isUr ? 'مقام' : 'Location'}</h2>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">{isUr ? 'شہر' : 'City'}</label>
            <select
              value={cityId}
              onChange={e => setCityId(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">{isUr ? 'شہر منتخب کریں' : 'Select city'}</option>
              {MAJOR_CITIES.map(c => (
                <option key={c.id} value={c.id}>{isUr ? c.nameUr : c.nameEn}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">{isUr ? 'علاقہ (اختیاری)' : 'Area / Village (optional)'}</label>
            <input
              type="text"
              value={locationText}
              onChange={e => setLocationText(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder={isUr ? 'مثلاً ماڈل ٹاؤن، لاہور' : 'e.g. Model Town, Lahore'}
            />
          </div>
        </div>

        {/* Price */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
          <h2 className="font-semibold text-neutral-700">{isUr ? 'قیمت' : 'Price'}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['fixed', 'negotiable', 'free', 'contact'] as const).map(pt => (
              <button
                type="button"
                key={pt}
                onClick={() => setPriceType(pt)}
                className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                  priceType === pt ? 'bg-primary-50 border-primary-400 text-primary-700' : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {pt === 'fixed' ? (isUr ? 'مقررہ' : 'Fixed')
                  : pt === 'negotiable' ? (isUr ? 'قابل مذاکرہ' : 'Negotiable')
                  : pt === 'free' ? (isUr ? 'مفت' : 'Free')
                  : (isUr ? 'رابطہ کریں' : 'Contact')}
              </button>
            ))}
          </div>
          {(priceType === 'fixed' || priceType === 'negotiable') && (
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">PKR</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="e.g. 25000"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
          <h2 className="font-semibold text-neutral-700">{isUr ? 'تفصیل' : 'Description'}</h2>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">English Description</label>
            <textarea
              rows={3}
              value={descriptionEn}
              onChange={e => setDescriptionEn(e.target.value)}
              maxLength={2000}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
              placeholder="Describe the animal, crop, or item..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">اردو تفصیل (اختیاری)</label>
            <textarea
              rows={3}
              value={descriptionUr}
              onChange={e => setDescriptionUr(e.target.value)}
              maxLength={2000}
              dir="rtl"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none font-urdu"
              placeholder="تفصیل لکھیں..."
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <h2 className="font-semibold text-neutral-700 mb-3">{isUr ? 'تصاویر' : 'Photos'}</h2>
          <ImageGrid
            images={images}
            onFiles={files => handleFiles(files, isUr)}
            onSetPrimary={setPrimary}
            onRemove={publicId => removeImage(publicId, token)}
          />
        </div>

        {error && (
          <p className="text-sm text-error-600 bg-error-50 rounded-lg px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || images.some(img => img.pending)}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold text-base transition-colors disabled:opacity-60"
        >
          {submitting ? (isUr ? 'شائع ہو رہا ہے...' : 'Publishing...') : isUr ? 'اشتہار شائع کریں' : 'Publish Listing'}
        </button>
      </form>
    </main>
  )
}
