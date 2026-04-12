'use client'

import { useState } from 'react'

export interface UploadedImage {
  publicId: string
  imageUrl: string
  isPrimary: boolean
  pending?: boolean   // true while uploading — imageUrl is a local blob URL
}

export function useImageUpload(token: string | null) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [error, setError] = useState('')

  const uploadFile = async (file: File) => {
    setError('')
    const tempId = `pending-${Date.now()}-${Math.random()}`
    const previewUrl = URL.createObjectURL(file)

    // Show local preview immediately
    setImages(prev => [...prev, { publicId: tempId, imageUrl: previewUrl, isPrimary: prev.length === 0, pending: true }])

    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
      const sigRes = await fetch(`${BASE}/uploads/sign`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!sigRes.ok) throw new Error('Could not get upload signature')
      const { signature, timestamp, folder, cloudName, apiKey } =
        await sigRes.json() as { signature: string; timestamp: number; folder: string; cloudName: string; apiKey: string }

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
      if (!upRes.ok) {
        const errData = await upRes.json().catch(() => ({})) as { error?: { message?: string } }
        throw new Error(errData?.error?.message ?? `Upload failed (${upRes.status})`)
      }
      const upData = await upRes.json() as { public_id: string; secure_url: string }

      setImages(prev => prev.map(img =>
        img.publicId === tempId
          ? { publicId: upData.public_id, imageUrl: upData.secure_url, isPrimary: img.isPrimary }
          : img
      ))
      URL.revokeObjectURL(previewUrl)
    } catch (err) {
      setImages(prev => prev.filter(img => img.publicId !== tempId))
      URL.revokeObjectURL(previewUrl)
      setError(err instanceof Error ? err.message : 'Image upload failed')
    }
  }

  const handleFiles = async (files: FileList | null, isUr: boolean) => {
    if (!files) return
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        setError(isUr ? 'تصویر 5MB سے کم ہونی چاہیے' : 'Image must be under 5MB')
        continue
      }
      await uploadFile(file)
    }
  }

  const setPrimary = (publicId: string) => {
    setImages(prev => prev.map(img => ({ ...img, isPrimary: img.publicId === publicId })))
  }

  const removeImage = async (publicId: string, token: string | null) => {
    // Only call API for real (non-pending) images
    if (!publicId.startsWith('pending-')) {
      try {
        const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
        await fetch(`${BASE}/uploads/${encodeURIComponent(publicId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch { /* ignore */ }
    }
    setImages(prev => {
      const remaining = prev.filter(img => img.publicId !== publicId)
      if (remaining.length > 0 && !remaining.some(img => img.isPrimary)) {
        remaining[0].isPrimary = true
      }
      return remaining
    })
  }

  return { images, setImages, error, setError, handleFiles, setPrimary, removeImage }
}
