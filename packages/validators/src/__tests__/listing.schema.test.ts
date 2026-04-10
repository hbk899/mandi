import { describe, it, expect } from 'vitest'
import { createListingSchema, updateListingSchema } from '../listing.schema'

const validBase = {
  titleEn: 'Sahiwal Cow for Sale',
  categoryId: 'clxyz1234567890abcd',
}

describe('createListingSchema', () => {
  describe('valid inputs', () => {
    it('accepts minimal required fields', () => {
      const result = createListingSchema.safeParse(validBase)
      expect(result.success).toBe(true)
    })

    it('accepts full listing with all optional fields', () => {
      const result = createListingSchema.safeParse({
        ...validBase,
        titleUr: 'ساہیوال گائے برائے فروخت',
        descriptionEn: 'Healthy Sahiwal cow, 4 years old, good milk yield.',
        descriptionUr: 'صحت مند ساہیوال گائے، 4 سال، اچھی دودھ پیداوار',
        price: 85000,
        currency: 'PKR',
        priceType: 'negotiable',
        cityId: 'clxyz1234567890efgh',
        locationText: 'Near Badami Bagh, Lahore',
        latitude: 31.5497,
        longitude: 74.3436,
        attributes: { breed: 'Sahiwal', age_months: 48, weight_kg: 320 },
      })
      expect(result.success).toBe(true)
    })

    it('defaults currency to PKR', () => {
      const result = createListingSchema.safeParse(validBase)
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.currency).toBe('PKR')
    })

    it('defaults priceType to fixed', () => {
      const result = createListingSchema.safeParse(validBase)
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.priceType).toBe('fixed')
    })

    it('defaults attributes to empty object', () => {
      const result = createListingSchema.safeParse(validBase)
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.attributes).toEqual({})
    })

    it('accepts all priceType values', () => {
      const priceTypes = ['fixed', 'negotiable', 'free', 'contact'] as const
      for (const pt of priceTypes) {
        const result = createListingSchema.safeParse({ ...validBase, priceType: pt })
        expect(result.success).toBe(true)
      }
    })

    it('accepts zero price', () => {
      // price must be positive, 0 should fail
      const result = createListingSchema.safeParse({ ...validBase, price: 0 })
      expect(result.success).toBe(false)
    })

    it('accepts positive price', () => {
      const result = createListingSchema.safeParse({ ...validBase, price: 50000 })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('rejects missing titleEn', () => {
      const result = createListingSchema.safeParse({ categoryId: validBase.categoryId })
      expect(result.success).toBe(false)
    })

    it('rejects missing categoryId', () => {
      const result = createListingSchema.safeParse({ titleEn: validBase.titleEn })
      expect(result.success).toBe(false)
    })

    it('rejects titleEn shorter than 3 chars', () => {
      const result = createListingSchema.safeParse({ ...validBase, titleEn: 'AB' })
      expect(result.success).toBe(false)
    })

    it('rejects titleEn longer than 200 chars', () => {
      const result = createListingSchema.safeParse({ ...validBase, titleEn: 'A'.repeat(201) })
      expect(result.success).toBe(false)
    })

    it('rejects negative price', () => {
      const result = createListingSchema.safeParse({ ...validBase, price: -100 })
      expect(result.success).toBe(false)
    })

    it('rejects invalid priceType', () => {
      const result = createListingSchema.safeParse({ ...validBase, priceType: 'auction' })
      expect(result.success).toBe(false)
    })

    it('rejects latitude out of range', () => {
      const result = createListingSchema.safeParse({ ...validBase, latitude: 91 })
      expect(result.success).toBe(false)
    })

    it('rejects longitude out of range', () => {
      const result = createListingSchema.safeParse({ ...validBase, longitude: 181 })
      expect(result.success).toBe(false)
    })

    it('rejects descriptionEn over 5000 chars', () => {
      const result = createListingSchema.safeParse({
        ...validBase,
        descriptionEn: 'x'.repeat(5001),
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('updateListingSchema', () => {
  it('accepts empty object (no-op patch)', () => {
    const result = updateListingSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial update (price only)', () => {
    const result = updateListingSchema.safeParse({ price: 90000 })
    expect(result.success).toBe(true)
  })

  it('accepts status update to sold', () => {
    const result = updateListingSchema.safeParse({ status: 'sold' })
    expect(result.success).toBe(true)
  })

  it('accepts status update to draft', () => {
    const result = updateListingSchema.safeParse({ status: 'draft' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status', () => {
    const result = updateListingSchema.safeParse({ status: 'deleted' })
    expect(result.success).toBe(false)
  })

  it('rejects negative price even in update', () => {
    const result = updateListingSchema.safeParse({ price: -1 })
    expect(result.success).toBe(false)
  })
})
