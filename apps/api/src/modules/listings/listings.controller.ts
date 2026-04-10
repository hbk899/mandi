import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../middleware/error.middleware'
import { createListingSchema, updateListingSchema } from '@mandi/validators'

const LISTING_SELECT = {
  id: true,
  titleEn: true,
  titleUr: true,
  descriptionEn: true,
  descriptionUr: true,
  price: true,
  currency: true,
  priceType: true,
  status: true,
  locationText: true,
  attributes: true,
  viewCount: true,
  expiresAt: true,
  createdAt: true,
  user: { select: { id: true, name: true, phone: true } },
  category: { select: { id: true, slug: true, nameEn: true, nameUr: true } },
  city: { select: { id: true, nameEn: true, nameUr: true, province: true } },
  images: { select: { id: true, imageUrl: true, sortOrder: true, isPrimary: true }, orderBy: { sortOrder: 'asc' as const } },
}

export async function getListings(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, city, minPrice, maxPrice, page = '1', limit = '20' } = req.query

    const where: Record<string, unknown> = { status: 'active' }
    if (category) where.category = { slug: category }
    if (city) where.cityId = city
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {}),
      }
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({ where, select: LISTING_SELECT, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit as string) }),
      prisma.listing.count({ where }),
    ])

    res.json({ listings, total, page: parseInt(page as string), limit: parseInt(limit as string) })
  } catch (err) {
    next(err)
  }
}

export async function getListing(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      select: LISTING_SELECT,
    })
    if (!listing) return next(new AppError(404, 'Listing not found'))

    // Increment view count (fire and forget)
    prisma.listing.update({ where: { id: req.params.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

    res.json(listing)
  } catch (err) {
    next(err)
  }
}

export async function createListing(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createListingSchema.parse(req.body)
    const listing = await prisma.listing.create({
      data: {
        ...data,
        userId: req.user!.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      select: LISTING_SELECT,
    })
    res.status(201).json(listing)
  } catch (err) {
    next(err)
  }
}

export async function updateListing(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } })
    if (!listing) return next(new AppError(404, 'Listing not found'))
    if (listing.userId !== req.user!.userId) return next(new AppError(403, 'Forbidden'))

    const data = updateListingSchema.parse(req.body)
    const updated = await prisma.listing.update({ where: { id: req.params.id }, data, select: LISTING_SELECT })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function deleteListing(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } })
    if (!listing) return next(new AppError(404, 'Listing not found'))
    if (listing.userId !== req.user!.userId && req.user!.role !== 'admin') {
      return next(new AppError(403, 'Forbidden'))
    }
    await prisma.listing.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function markSold(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } })
    if (!listing) return next(new AppError(404, 'Listing not found'))
    if (listing.userId !== req.user!.userId) return next(new AppError(403, 'Forbidden'))

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: { status: 'sold' },
      select: LISTING_SELECT,
    })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}
