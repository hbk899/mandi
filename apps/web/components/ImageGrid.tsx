'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import type { UploadedImage } from '../hooks/useImageUpload'

interface Props {
  images: UploadedImage[]
  onFiles: (files: FileList | null) => void
  onSetPrimary: (publicId: string) => void
  onRemove: (publicId: string) => void
  maxImages?: number
}

export default function ImageGrid({ images, onFiles, onSetPrimary, onRemove, maxImages = 5 }: Props) {
  const locale = useLocale()
  const isUr = locale === 'ur'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasUploading = images.some(img => img.pending)

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-400">
        {isUr ? 'پہلی تصویر مرکزی ہوگی۔ زیادہ سے زیادہ ۵ تصاویر۔' : 'First photo will be the main image. Maximum 5 photos.'}
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map(img => (
          <div key={img.publicId} className="relative aspect-square rounded-lg overflow-hidden border-2 border-neutral-200">
            <Image
              src={img.imageUrl}
              alt=""
              fill
              className={`object-cover transition-opacity ${img.pending ? 'opacity-50' : 'opacity-100'}`}
              sizes="120px"
              unoptimized={img.pending} // blob URLs can't go through Next.js image optimization
            />

            {/* Uploading spinner */}
            {img.pending && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <svg className="w-8 h-8 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
            )}

            {/* Primary badge */}
            {img.isPrimary && !img.pending && (
              <span className="absolute top-1 start-1 text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded-full">
                {isUr ? 'مرکزی' : 'Main'}
              </span>
            )}

            {/* Hover actions (only for uploaded images) */}
            {!img.pending && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-end justify-center pb-1 gap-1 opacity-0 hover:opacity-100">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => onSetPrimary(img.publicId)}
                    className="text-xs bg-white text-neutral-800 rounded px-1.5 py-0.5"
                  >
                    {isUr ? 'مرکزی' : 'Main'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(img.publicId)}
                  className="text-xs bg-error-600 text-white rounded px-1.5 py-0.5"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add photo button */}
        {images.length < maxImages && (
          <button
            type="button"
            disabled={hasUploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 hover:border-primary-400 hover:text-primary-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {hasUploading ? (
              <svg className="w-6 h-6 animate-spin text-neutral-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <>
                <span className="text-2xl leading-none">+</span>
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
        onChange={e => onFiles(e.target.files)}
      />
    </div>
  )
}
