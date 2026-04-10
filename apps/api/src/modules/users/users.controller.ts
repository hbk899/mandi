import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, phone: true, role: true, profileImageUrl: true, city: { select: { id: true, nameEn: true, nameUr: true } }, createdAt: true },
    })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, cityId, profileImageUrl } = req.body
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, cityId, profileImageUrl },
      select: { id: true, name: true, email: true, phone: true, role: true, profileImageUrl: true },
    })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

export async function getMyListings(req: Request, res: Response, next: NextFunction) {
  try {
    const listings = await prisma.listing.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: { images: { where: { isPrimary: true }, take: 1 }, category: true, city: true },
    })
    res.json(listings)
  } catch (err) {
    next(err)
  }
}

export async function getSaved(req: Request, res: Response, next: NextFunction) {
  try {
    const saved = await prisma.savedListing.findMany({
      where: { userId: req.user!.userId },
      include: {
        listing: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: true,
            city: true,
          },
        },
      },
    })
    res.json(saved.map((s) => s.listing))
  } catch (err) {
    next(err)
  }
}

export async function saveToggle(req: Request, res: Response, next: NextFunction) {
  try {
    const listingId = String(req.params.listingId)
    const userId = req.user!.userId

    const existing = await prisma.savedListing.findUnique({
      where: { userId_listingId: { userId, listingId } },
    })

    if (existing) {
      await prisma.savedListing.delete({ where: { userId_listingId: { userId, listingId } } })
      res.json({ saved: false })
    } else {
      await prisma.savedListing.create({ data: { userId, listingId } })
      res.json({ saved: true })
    }
  } catch (err) {
    next(err)
  }
}
