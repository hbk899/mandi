import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'

/** Safely extract a scalar string from an Express query param */
function qs(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v[0] : v
}

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, category, city, minPrice, maxPrice, sort = 'newest', page = '1', limit = '20' } = req.query

    const where: Record<string, unknown> = { status: 'active' }

    const qStr = qs(q as string | string[] | undefined)
    if (qStr) {
      where.OR = [
        { titleEn: { contains: qStr, mode: 'insensitive' } },
        { titleUr: { contains: qStr, mode: 'insensitive' } },
        { descriptionEn: { contains: qStr, mode: 'insensitive' } },
        { descriptionUr: { contains: qStr, mode: 'insensitive' } },
      ]
    }

    const categoryStr = qs(category as string | string[] | undefined)
    const cityStr = qs(city as string | string[] | undefined)
    const minPriceStr = qs(minPrice as string | string[] | undefined)
    const maxPriceStr = qs(maxPrice as string | string[] | undefined)

    if (categoryStr) where.category = { slug: categoryStr }
    if (cityStr) where.cityId = cityStr
    if (minPriceStr || maxPriceStr) {
      where.price = {
        ...(minPriceStr ? { gte: parseFloat(minPriceStr) } : {}),
        ...(maxPriceStr ? { lte: parseFloat(maxPriceStr) } : {}),
      }
    }

    const sortStr = qs(sort as string | string[] | undefined) ?? 'newest'
    const orderBy =
      sortStr === 'price_asc'
        ? { price: 'asc' as const }
        : sortStr === 'price_desc'
          ? { price: 'desc' as const }
          : { createdAt: 'desc' as const }

    const pageNum = parseInt(qs(page as string | string[] | undefined) ?? '1')
    const limitNum = parseInt(qs(limit as string | string[] | undefined) ?? '20')
    const skip = (pageNum - 1) * limitNum
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          titleEn: true,
          titleUr: true,
          price: true,
          currency: true,
          priceType: true,
          locationText: true,
          createdAt: true,
          category: { select: { slug: true, nameEn: true, nameUr: true } },
          city: { select: { nameEn: true, nameUr: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.listing.count({ where }),
    ])

    res.json({ listings, total, page: pageNum, limit: limitNum })
  } catch (err) {
    next(err)
  }
}
