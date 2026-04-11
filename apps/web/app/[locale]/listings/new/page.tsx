'use client'

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { CATEGORIES_FLAT, MAJOR_CITIES } from '@mandi/config'
import { api } from '../../../../lib/api'
import { useAuth } from '../../../../lib/auth'

interface UploadedImage { publicId: string; imageUrl: string; isPrimary: boolean }

export default function NewListingPage() {
  const locale = useLocale()
  const isUr = locale === 'ur'
  const router = useRouter()
  const { token, isLoggedIn, isLoading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [titleEn, setTitleEn] = useState('')
  const [titleUr, setTitleUr] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionUr, setDescriptionUr] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [cityId, setCityId] = useState('')
  const [locationText, setLocationText] = useState('')
  const [price, setPrice] = useState('')
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable' | 'free' | 'contact'>('fixed')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirect if not logged in
  if (!authLoading && !isLoggedIn) {
    router.push('/login')
    return null
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
      // Step 1: get Cloudinary signed upload params
      const sigRes = await fetch(`${BASE}/uploads/sign`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!sigRes.ok) throw new Error('Could not get upload signature')
      const { signature, timestamp, folder, cloudName, apiKey } =
        await sigRes.json() as { signature: string; timestamp: number; folder: string; cloudName: string; apiKey: string }

      // Step 2: upload directly to Cloudinary
      const form = new FormData()
      form.append('file', file)
      form.append('signature', signature)
      form.append('timestamp', String(timestamp))
      form.append('folder', folder)
      form.append('api_key', apiKey)
      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: form,
      })
      if (!upRes.ok) throw new Error('Cloudinary upload failed')
      const upData = await upRes.json() as { public_id: string; secure_url: string }
      setImages(prev => [...prev, { publicId: upData.public_id, imageUrl: upData.secure_url, isPrimary: prev.length === 0 }])
    } catch {
      setError(isUr ? 'تصویر اپلوڈ نہیں ہوئی — Cloudinary ترتیب دیں' : 'Image upload failed — configure Cloudinary to enable photos')
    } finally {
      setUploading(false)
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        setError(isUr ? 'تصویر 5MB سے کم ہونی چاہیے' : 'Image must be under 5MB')
        continue
      }
      await uploadImage(file)
    }
  }

  const setPrimary = (publicId: string) => {
    setImages(prev => prev.map(img => ({ ...img, isPrimary: img.publicId === publicId })))
  }

  const removeImage = async (publicId: string) => {
    try {
      await api.delete(`/uploads/${encodeURIComponent(publicId)}`, { headers: { Authorization: `Bearer ${token}` } })
    } catch { /* ignore */ }
    setImages(prev => {
      const remaining = prev.filter(img => img.publicId !== publicId)
      if (remaining.length > 0 && !remaining.some(img => img.isPrimary)) {
        remaining[0].isPrimary = true
      }
      return remaining
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!titleEn.trim()) {
      setError(isUr ? 'انگریزی عنوان ضروری ہے' : 'English title is required')
      return
    }
    if (!categorySlug) {
      setError(isUr ? 'قسم منتخب کریں' : 'Please select a category')
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
      // Attach uploaded images if any
      if (images.length > 0) {
        await api.post(`/uploads/listings/${res.id}/images`, {
          images: images.map(img => ({
            publicId: img.publicId,
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary,
          })),
        }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
      }
      router.push(`/listings/${res.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : isUr ? 'خطا — دوبارہ کوشش کریں' : 'Failed to create listing')
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
        <div className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
          <h2 className="font-semibold text-neutral-700">{isUr ? 'تصاویر' : 'Photos'}</h2>
          <p className="text-xs text-neutral-400">{isUr ? 'پہلی تصویر مرکزی ہوگی۔ زیادہ سے زیادہ ۵ تصاویر۔' : 'First photo will be the main image. Maximum 5 photos.'}</p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map(img => (
              <div key={img.publicId} className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent">
                <Image src={img.imageUrl} alt="" fill className="object-cover" sizes="120px" />
                {img.isPrimary && (
                  <span className="absolute top-1 start-1 text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded-full">
                    {isUr ? 'مرکزی' : 'Main'}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-end justify-center pb-1 gap-1 opacity-0 hover:opacity-100">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(img.publicId)}
                      className="text-xs bg-white text-neutral-800 rounded px-1.5 py-0.5"
                    >
                      {isUr ? 'مرکزی' : 'Main'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.publicId)}
                    className="text-xs bg-error-600 text-white rounded px-1.5 py-0.5"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {images.length < 5 && (
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 hover:border-primary-400 hover:text-primary-500 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <span className="text-xs animate-pulse">...</span>
                ) : (
                  <>
                    <span className="text-2xl">+</span>
                    <span className="text-xs mt-1">{isUr ? 'تصویر' : 'Photo'}</span>
                  </>
                )}
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>

        {error && (
          <p className="text-sm text-error-600 bg-error-50 rounded-lg px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold text-base transition-colors disabled:opacity-60"
        >
          {submitting ? '...' : isUr ? 'اشتہار شائع کریں' : 'Publish Listing'}
        </button>
      </form>
    </main>
  )
}
