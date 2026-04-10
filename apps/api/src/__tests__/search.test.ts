import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'

const mockListing = prisma.listing as Record<string, ReturnType<typeof vi.fn>>

const sampleResult = {
  id: 'listing-1',
  titleEn: 'Goat for Sale',
  titleUr: 'بکری برائے فروخت',
  price: '15000',
  currency: 'PKR',
  priceType: 'fixed',
  locationText: 'Lahore',
  createdAt: new Date(),
  category: { slug: 'goats', nameEn: 'Goats', nameUr: 'بکریاں' },
  city: { nameEn: 'Lahore', nameUr: 'لاہور' },
  images: [{ id: 'img-1', imageUrl: 'https://res.cloudinary.com/test/goat.jpg', sortOrder: 0, isPrimary: true }],
}

describe('GET /api/v1/search', () => {
  it('returns listings matching a query', async () => {
    mockListing.findMany.mockResolvedValue([sampleResult])
    mockListing.count.mockResolvedValue(1)

    const res = await request(app).get('/api/v1/search?q=goat')

    expect(res.status).toBe(200)
    expect(res.body.listings).toHaveLength(1)
    expect(res.body.total).toBe(1)
  })

  it('searches with OR across bilingual title fields', async () => {
    mockListing.findMany.mockResolvedValue([sampleResult])
    mockListing.count.mockResolvedValue(1)

    await request(app).get('/api/v1/search?q=goat')

    expect(mockListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ titleEn: expect.anything() }),
            expect.objectContaining({ titleUr: expect.anything() }),
          ]),
        }),
      })
    )
  })

  it('filters by category', async () => {
    mockListing.findMany.mockResolvedValue([sampleResult])
    mockListing.count.mockResolvedValue(1)

    await request(app).get('/api/v1/search?category=goats')

    expect(mockListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: { slug: 'goats' } }),
      })
    )
  })

  it('filters by city', async () => {
    mockListing.findMany.mockResolvedValue([sampleResult])
    mockListing.count.mockResolvedValue(1)

    await request(app).get('/api/v1/search?city=lahore')

    expect(mockListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ cityId: 'lahore' }),
      })
    )
  })

  it('sorts by price ascending', async () => {
    mockListing.findMany.mockResolvedValue([sampleResult])
    mockListing.count.mockResolvedValue(1)

    await request(app).get('/api/v1/search?sort=price_asc')

    expect(mockListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { price: 'asc' } })
    )
  })

  it('sorts by price descending', async () => {
    mockListing.findMany.mockResolvedValue([sampleResult])
    mockListing.count.mockResolvedValue(1)

    await request(app).get('/api/v1/search?sort=price_desc')

    expect(mockListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { price: 'desc' } })
    )
  })

  it('defaults to sort by newest', async () => {
    mockListing.findMany.mockResolvedValue([sampleResult])
    mockListing.count.mockResolvedValue(1)

    await request(app).get('/api/v1/search')

    expect(mockListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    )
  })

  it('returns empty results when no listings match', async () => {
    mockListing.findMany.mockResolvedValue([])
    mockListing.count.mockResolvedValue(0)

    const res = await request(app).get('/api/v1/search?q=unicorn')

    expect(res.status).toBe(200)
    expect(res.body.listings).toHaveLength(0)
    expect(res.body.total).toBe(0)
  })

  it('returns correct pagination metadata', async () => {
    mockListing.findMany.mockResolvedValue([sampleResult])
    mockListing.count.mockResolvedValue(50)

    const res = await request(app).get('/api/v1/search?page=3&limit=10')

    expect(res.body.page).toBe(3)
    expect(res.body.limit).toBe(10)
    expect(res.body.total).toBe(50)
  })
})
