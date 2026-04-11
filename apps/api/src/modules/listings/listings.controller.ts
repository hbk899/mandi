import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
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

/** Safely extract a scalar string from an Express query param */
function qs(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v[0] : v
}

export async function getListings(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, city, minPrice, maxPrice, page = '1', limit = '20' } = req.query

    const where: Record<string, unknown> = { status: 'active' }
    if (category) where.category = { slug: qs(category as string | string[]) }
    if (city) where.cityId = qs(city as string | string[])
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(qs(minPrice as string | string[])!) } : {}),
        ...(maxPrice ? { lte: parseFloat(qs(maxPrice as string | string[])!) } : {}),
      }
    }

    const pageNum = parseInt(qs(page as string | string[]) ?? '1')
    const limitNum = parseInt(qs(limit as string | string[]) ?? '20')
    const skip = (pageNum - 1) * limitNum
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({ where, select: LISTING_SELECT, orderBy: { createdAt: 'desc' }, skip, take: limitNum }),
      prisma.listing.count({ where }),
    ])

    res.json({ listings, total, page: pageNum, limit: limitNum })
  } catch (err) {
    next(err)
  }
}

export async function getListing(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: LISTING_SELECT,
    })
    if (!listing) return next(new AppError(404, 'Listing not found'))

    // Increment view count (fire and forget)
    prisma.listing.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

    res.json(listing)
  } catch (err) {
    next(err)
  }
}

export async function createListing(req: Request, res: Response, next: NextFunction) {
  try {
    const { categorySlug, ...rest } = createListingSchema.parse(req.body)

    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
    if (!category) return next(new AppError(400, `Unknown category: ${categorySlug}`))

    const listing = await prisma.listing.create({
      data: {
        ...rest,
        categoryId: category.id,
        attributes: rest.attributes as Prisma.InputJsonValue,
        userId: req.user!.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      } satisfies Prisma.ListingUncheckedCreateInput,
      select: LISTING_SELECT,
    })
    res.status(201).json(listing)
  } catch (err) {
    next(err)
  }
}

export async function updateListing(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return next(new AppError(404, 'Listing not found'))
    if (listing.userId !== req.user!.userId) return next(new AppError(403, 'Forbidden'))

    const data = updateListingSchema.parse(req.body)
    const updated = await prisma.listing.update({
      where: { id },
      data: data as unknown as Prisma.ListingUncheckedUpdateInput,
      select: LISTING_SELECT,
    })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function deleteListing(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return next(new AppError(404, 'Listing not found'))
    if (listing.userId !== req.user!.userId && req.user!.role !== 'admin') {
      return next(new AppError(403, 'Forbidden'))
    }
    await prisma.listing.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function markSold(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return next(new AppError(404, 'Listing not found'))
    if (listing.userId !== req.user!.userId) return next(new AppError(403, 'Forbidden'))

    const updated = await prisma.listing.update({
      where: { id },
      data: { status: 'sold' },
      select: LISTING_SELECT,
    })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}
