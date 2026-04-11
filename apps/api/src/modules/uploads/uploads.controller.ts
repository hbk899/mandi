import { Request, Response, NextFunction } from 'express'
import { cloudinary } from '../../lib/cloudinary'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../middleware/error.middleware'

const MAX_IMAGES_PER_LISTING = 5

export async function getSignedUploadUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const timestamp = Math.round(Date.now() / 1000)
    const folder = `mandi/listings/${req.user!.userId}`

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, eager: 'w_800,h_600,c_fill/q_auto/f_auto' },
      process.env.CLOUDINARY_API_SECRET!
    )

    res.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    })
  } catch (err) {
    next(err)
  }
}

export async function attachImages(req: Request, res: Response, next: NextFunction) {
  try {
    const listingId = String(req.params.listingId)
    const { images } = req.body as { images: { publicId: string; imageUrl: string; isPrimary?: boolean }[] }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) return next(new AppError(404, 'Listing not found'))
    if (listing.userId !== req.user!.userId) return next(new AppError(403, 'Forbidden'))

    const existing = await prisma.listingImage.count({ where: { listingId } })
    if (existing + images.length > MAX_IMAGES_PER_LISTING) {
      return next(new AppError(400, `Max ${MAX_IMAGES_PER_LISTING} images per listing`))
    }

    const created = await prisma.listingImage.createMany({
      data: images.map((img, i) => ({
        listingId,
        imageUrl: img.imageUrl,
        publicId: img.publicId,
        sortOrder: existing + i,
        isPrimary: img.isPrimary ?? (existing === 0 && i === 0),
      })),
    })
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction) {
  try {
    const publicId = decodeURIComponent(String(req.params.publicId))

    const image = await prisma.listingImage.findFirst({ where: { publicId } })
    if (!image) return next(new AppError(404, 'Image not found'))

    const listing = await prisma.listing.findUnique({ where: { id: image.listingId } })
    if (listing?.userId !== req.user!.userId) return next(new AppError(403, 'Forbidden'))

    await cloudinary.uploader.destroy(publicId)
    await prisma.listingImage.delete({ where: { id: image.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
