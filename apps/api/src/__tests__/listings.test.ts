import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app'
import { prisma } from '../lib/prisma'

const mockListing = prisma.listing as Record<string, ReturnType<typeof vi.fn>>

function makeAuthHeader(userId = 'user-1', role = 'user') {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: 900 })
  return `Bearer ${token}`
}

const sampleListing = {
  id: 'listing-1',
  titleEn: 'Sahiwal Cow',
  titleUr: 'ساہیوال گائے',
  descriptionEn: 'Healthy cow',
  descriptionUr: null,
  price: '85000',
  currency: 'PKR',
  priceType: 'negotiable',
  status: 'active',
  locationText: 'Lahore',
  attributes: { breed: 'Sahiwal' },
  viewCount: 0,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  userId: 'user-1',
  user: { id: 'user-1', name: 'Ali Hassan', phone: '03001234567' },
  category: { id: 'cat-1', slug: 'cows', nameEn: 'Cows', nameUr: 'گائیں' },
  city: { id: 'city-1', nameEn: 'Lahore', nameUr: 'لاہور', province: 'Punjab' },
  images: [{ id: 'img-1', imageUrl: 'https://res.cloudinary.com/test/cow.jpg', sortOrder: 0, isPrimary: true }],
}

describe('GET /api/v1/listings', () => {
  it('returns paginated listings', async () => {
    mockListing.findMany.mockResolvedValue([sampleListing])
    mockListing.count.mockResolvedValue(1)

    const res = await request(app).get('/api/v1/listings')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('listings')
    expect(res.body).toHaveProperty('total', 1)
    expect(res.body.listings).toHaveLength(1)
    expect(res.body.listings[0].titleEn).toBe('Sahiwal Cow')
  })

  it('supports page and limit query params', async () => {
    mockListing.findMany.mockResolvedValue([])
    mockListing.count.mockResolvedValue(0)

    const res = await request(app).get('/api/v1/listings?page=2&limit=10')

    expect(res.status).toBe(200)
    expect(res.body.page).toBe(2)
    expect(res.body.limit).toBe(10)
  })

  it('filters by category slug', async () => {
    mockListing.findMany.mockResolvedValue([sampleListing])
    mockListing.count.mockResolvedValue(1)

    const res = await request(app).get('/api/v1/listings?category=cows')

    expect(res.status).toBe(200)
    expect(mockListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: { slug: 'cows' } }),
      })
    )
  })

  it('filters by price range', async () => {
    mockListing.findMany.mockResolvedValue([sampleListing])
    mockListing.count.mockResolvedValue(1)

    const res = await request(app).get('/api/v1/listings?minPrice=50000&maxPrice=100000')

    expect(res.status).toBe(200)
    expect(mockListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          price: { gte: 50000, lte: 100000 },
        }),
      })
    )
  })
})

describe('GET /api/v1/listings/:id', () => {
  it('returns a single listing', async () => {
    mockListing.findUnique.mockResolvedValue(sampleListing)
    mockListing.update.mockResolvedValue(sampleListing)

    const res = await request(app).get('/api/v1/listings/listing-1')

    expect(res.status).toBe(200)
    expect(res.body.id).toBe('listing-1')
    expect(res.body.titleEn).toBe('Sahiwal Cow')
  })

  it('returns 404 for unknown listing', async () => {
    mockListing.findUnique.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/listings/does-not-exist')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Listing not found')
  })
})

describe('POST /api/v1/listings', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/v1/listings').send({
      titleEn: 'Test Listing',
      categoryId: 'cat-1',
    })
    expect(res.status).toBe(401)
  })

  it('creates a listing when authenticated', async () => {
    mockListing.create.mockResolvedValue(sampleListing)

    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', makeAuthHeader())
      .send({
        titleEn: 'Sahiwal Cow',
        categoryId: 'cltest123',
        priceType: 'negotiable',
        price: 85000,
        attributes: { breed: 'Sahiwal' },
      })

    expect(res.status).toBe(201)
    expect(mockListing.create).toHaveBeenCalled()
  })

  it('returns 422 on missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', makeAuthHeader())
      .send({ price: 85000 })

    expect(res.status).toBe(422)
  })

  it('returns 422 on titleEn too short', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', makeAuthHeader())
      .send({ titleEn: 'AB', categoryId: 'cltest123' })

    expect(res.status).toBe(422)
  })
})

describe('PATCH /api/v1/listings/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).patch('/api/v1/listings/listing-1').send({ price: 90000 })
    expect(res.status).toBe(401)
  })

  it('returns 404 when listing not found', async () => {
    mockListing.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .patch('/api/v1/listings/unknown')
      .set('Authorization', makeAuthHeader())
      .send({ price: 90000 })

    expect(res.status).toBe(404)
  })

  it('returns 403 when not the owner', async () => {
    mockListing.findUnique.mockResolvedValue({ ...sampleListing, userId: 'other-user' })

    const res = await request(app)
      .patch('/api/v1/listings/listing-1')
      .set('Authorization', makeAuthHeader('user-1'))
      .send({ price: 90000 })

    expect(res.status).toBe(403)
  })

  it('updates listing when owner', async () => {
    mockListing.findUnique.mockResolvedValue(sampleListing)
    mockListing.update.mockResolvedValue({ ...sampleListing, price: '90000' })

    const res = await request(app)
      .patch('/api/v1/listings/listing-1')
      .set('Authorization', makeAuthHeader('user-1'))
      .send({ price: 90000 })

    expect(res.status).toBe(200)
  })
})

describe('DELETE /api/v1/listings/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/v1/listings/listing-1')
    expect(res.status).toBe(401)
  })

  it('returns 403 when not owner', async () => {
    mockListing.findUnique.mockResolvedValue({ ...sampleListing, userId: 'other-user' })

    const res = await request(app)
      .delete('/api/v1/listings/listing-1')
      .set('Authorization', makeAuthHeader('user-1'))

    expect(res.status).toBe(403)
  })

  it('deletes listing when owner', async () => {
    mockListing.findUnique.mockResolvedValue(sampleListing)
    mockListing.delete.mockResolvedValue(sampleListing)

    const res = await request(app)
      .delete('/api/v1/listings/listing-1')
      .set('Authorization', makeAuthHeader('user-1'))

    expect(res.status).toBe(204)
  })

  it('allows admin to delete any listing', async () => {
    mockListing.findUnique.mockResolvedValue({ ...sampleListing, userId: 'other-user' })
    mockListing.delete.mockResolvedValue(sampleListing)

    const res = await request(app)
      .delete('/api/v1/listings/listing-1')
      .set('Authorization', makeAuthHeader('admin-user', 'admin'))

    expect(res.status).toBe(204)
  })
})

describe('POST /api/v1/listings/:id/sold', () => {
  it('marks listing as sold for owner', async () => {
    mockListing.findUnique.mockResolvedValue(sampleListing)
    mockListing.update.mockResolvedValue({ ...sampleListing, status: 'sold' })

    const res = await request(app)
      .post('/api/v1/listings/listing-1/sold')
      .set('Authorization', makeAuthHeader('user-1'))

    expect(res.status).toBe(200)
    expect(mockListing.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'sold' } })
    )
  })

  it('returns 403 when not owner', async () => {
    mockListing.findUnique.mockResolvedValue({ ...sampleListing, userId: 'other-user' })

    const res = await request(app)
      .post('/api/v1/listings/listing-1/sold')
      .set('Authorization', makeAuthHeader('user-1'))

    expect(res.status).toBe(403)
  })
})
