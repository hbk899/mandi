import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, category, city, minPrice, maxPrice, sort = 'newest', page = '1', limit = '20' } = req.query

    const where: Record<string, unknown> = { status: 'active' }

    // Full-text search using PostgreSQL ts_vector
    // Using raw query for full-text search across bilingual fields
    if (q) {
      where.OR = [
        { titleEn: { contains: q as string, mode: 'insensitive' } },
        { titleUr: { contains: q as string, mode: 'insensitive' } },
        { descriptionEn: { contains: q as string, mode: 'insensitive' } },
        { descriptionUr: { contains: q as string, mode: 'insensitive' } },
      ]
    }

    if (category) where.category = { slug: category }
    if (city) where.cityId = city as string
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {}),
      }
    }

    const orderBy =
      sort === 'price_asc'
        ? { price: 'asc' as const }
        : sort === 'price_desc'
          ? { price: 'desc' as const }
          : { createdAt: 'desc' as const }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit as string),
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

    res.json({ listings, total, page: parseInt(page as string), limit: parseInt(limit as string) })
  } catch (err) {
    next(err)
  }
}
