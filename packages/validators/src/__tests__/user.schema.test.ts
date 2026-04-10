import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema, updateProfileSchema } from '../user.schema'

describe('registerSchema', () => {
  describe('valid inputs', () => {
    it('accepts phone + password', () => {
      const result = registerSchema.safeParse({
        name: 'Ali Hassan',
        phone: '03001234567',
        password: 'securepass',
      })
      expect(result.success).toBe(true)
    })

    it('accepts email + password', () => {
      const result = registerSchema.safeParse({
        name: 'Ali Hassan',
        email: 'ali@example.com',
        password: 'securepass',
      })
      expect(result.success).toBe(true)
    })

    it('accepts both phone and email', () => {
      const result = registerSchema.safeParse({
        name: 'Ali Hassan',
        phone: '03001234567',
        email: 'ali@example.com',
        password: 'securepass',
      })
      expect(result.success).toBe(true)
    })

    it('accepts Pakistani phone with +92 prefix', () => {
      const result = registerSchema.safeParse({
        name: 'Ali Hassan',
        phone: '+923001234567',
        password: 'securepass',
      })
      expect(result.success).toBe(true)
    })

    it('accepts name at min length (2 chars)', () => {
      const result = registerSchema.safeParse({
        name: 'AB',
        phone: '03001234567',
        password: 'securepass',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('rejects when neither phone nor email provided', () => {
      const result = registerSchema.safeParse({
        name: 'Ali Hassan',
        password: 'securepass',
      })
      expect(result.success).toBe(false)
    })

    it('rejects password shorter than 8 chars', () => {
      const result = registerSchema.safeParse({
        name: 'Ali Hassan',
        phone: '03001234567',
        password: 'short',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password')
      }
    })

    it('rejects name shorter than 2 chars', () => {
      const result = registerSchema.safeParse({
        name: 'A',
        phone: '03001234567',
        password: 'securepass',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid Pakistani phone (too short)', () => {
      const result = registerSchema.safeParse({
        name: 'Ali Hassan',
        phone: '0300123',
        password: 'securepass',
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-Pakistani phone format', () => {
      const result = registerSchema.safeParse({
        name: 'Ali Hassan',
        phone: '+1-555-000-0000',
        password: 'securepass',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email format', () => {
      const result = registerSchema.safeParse({
        name: 'Ali Hassan',
        email: 'not-an-email',
        password: 'securepass',
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing name', () => {
      const result = registerSchema.safeParse({
        phone: '03001234567',
        password: 'securepass',
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing password', () => {
      const result = registerSchema.safeParse({
        name: 'Ali Hassan',
        phone: '03001234567',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('loginSchema', () => {
  it('accepts phone as identifier', () => {
    const result = loginSchema.safeParse({ identifier: '03001234567', password: 'pass1234' })
    expect(result.success).toBe(true)
  })

  it('accepts email as identifier', () => {
    const result = loginSchema.safeParse({ identifier: 'user@example.com', password: 'pass1234' })
    expect(result.success).toBe(true)
  })

  it('rejects empty identifier', () => {
    const result = loginSchema.safeParse({ identifier: '', password: 'pass1234' })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ identifier: '03001234567', password: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing fields', () => {
    const result = loginSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('updateProfileSchema', () => {
  it('accepts all optional fields together', () => {
    const result = updateProfileSchema.safeParse({
      name: 'New Name',
      cityId: 'clxyz123456789',
      profileImageUrl: 'https://res.cloudinary.com/mandi/image.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('accepts partial update (name only)', () => {
    const result = updateProfileSchema.safeParse({ name: 'New Name' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object (no-op update)', () => {
    const result = updateProfileSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejects name shorter than 2 chars', () => {
    const result = updateProfileSchema.safeParse({ name: 'X' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid URL for profileImageUrl', () => {
    const result = updateProfileSchema.safeParse({ profileImageUrl: 'not-a-url' })
    expect(result.success).toBe(false)
  })
})
