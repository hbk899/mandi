import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../middleware/error.middleware'

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: { attributes: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })
    res.json(categories)
  } catch (err) {
    next(err)
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        attributes: { orderBy: { sortOrder: 'asc' } },
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
    })
    if (!category) return next(new AppError(404, 'Category not found'))
    res.json(category)
  } catch (err) {
    next(err)
  }
}
