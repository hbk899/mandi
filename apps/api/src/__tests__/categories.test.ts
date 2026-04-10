import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'

const mockCategory = prisma.category as Record<string, ReturnType<typeof vi.fn>>

const sampleTree = [
  {
    id: 'cat-1',
    slug: 'animals',
    nameEn: 'Animals',
    nameUr: 'جانور',
    iconUrl: null,
    sortOrder: 1,
    isActive: true,
    parentId: null,
    children: [
      {
        id: 'cat-2',
        slug: 'goats',
        nameEn: 'Goats',
        nameUr: 'بکریاں',
        iconUrl: null,
        sortOrder: 1,
        isActive: true,
        parentId: 'cat-1',
        attributes: [
          { id: 'attr-1', categoryId: 'cat-2', attributeKey: 'breed', labelEn: 'Breed', labelUr: 'نسل', inputType: 'text', optionsJson: null, isRequired: false, sortOrder: 1 },
          { id: 'attr-2', categoryId: 'cat-2', attributeKey: 'age_months', labelEn: 'Age (months)', labelUr: 'عمر (مہینے)', inputType: 'number', optionsJson: null, isRequired: false, sortOrder: 2 },
        ],
      },
    ],
  },
]

describe('GET /api/v1/categories', () => {
  it('returns the full category tree', async () => {
    mockCategory.findMany.mockResolvedValue(sampleTree)

    const res = await request(app).get('/api/v1/categories')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].slug).toBe('animals')
    expect(res.body[0].children).toHaveLength(1)
  })

  it('returns bilingual names', async () => {
    mockCategory.findMany.mockResolvedValue(sampleTree)

    const res = await request(app).get('/api/v1/categories')

    expect(res.body[0].nameEn).toBe('Animals')
    expect(res.body[0].nameUr).toBe('جانور')
  })

  it('includes attributes on child categories', async () => {
    mockCategory.findMany.mockResolvedValue(sampleTree)

    const res = await request(app).get('/api/v1/categories')

    expect(res.body[0].children[0].attributes).toHaveLength(2)
    expect(res.body[0].children[0].attributes[0].attributeKey).toBe('breed')
  })
})

describe('GET /api/v1/categories/:slug', () => {
  it('returns a single category by slug', async () => {
    const goatCategory = { ...sampleTree[0].children[0], attributes: sampleTree[0].children[0].attributes, children: [] }
    mockCategory.findUnique.mockResolvedValue(goatCategory)

    const res = await request(app).get('/api/v1/categories/goats')

    expect(res.status).toBe(200)
    expect(res.body.slug).toBe('goats')
    expect(res.body.nameEn).toBe('Goats')
  })

  it('returns 404 for unknown category slug', async () => {
    mockCategory.findUnique.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/categories/dragons')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Category not found')
  })
})
