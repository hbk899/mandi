import { describe, it, expect } from 'vitest'
import { CATEGORIES, CATEGORIES_FLAT, findCategory } from '../categories'

describe('CATEGORIES', () => {
  it('has exactly 2 top-level categories', () => {
    expect(CATEGORIES).toHaveLength(2)
  })

  it('first top-level category is Animals', () => {
    expect(CATEGORIES[0].slug).toBe('animals')
    expect(CATEGORIES[0].nameEn).toBe('Animals')
    expect(CATEGORIES[0].nameUr).toBe('جانور')
  })

  it('second top-level category is Agriculture', () => {
    expect(CATEGORIES[1].slug).toBe('agriculture')
    expect(CATEGORIES[1].nameEn).toBe('Agriculture')
    expect(CATEGORIES[0].nameUr).toBe('جانور')
  })

  it('Animals has 8 subcategories', () => {
    const animals = CATEGORIES.find((c) => c.slug === 'animals')!
    expect(animals.children).toHaveLength(8)
  })

  it('Agriculture has 7 subcategories', () => {
    const agri = CATEGORIES.find((c) => c.slug === 'agriculture')!
    expect(agri.children).toHaveLength(7)
  })

  it('all categories have bilingual names', () => {
    for (const cat of CATEGORIES_FLAT) {
      expect(cat.nameEn, `${cat.slug} missing nameEn`).toBeTruthy()
      expect(cat.nameUr, `${cat.slug} missing nameUr`).toBeTruthy()
    }
  })

  it('all categories have unique slugs', () => {
    const slugs = CATEGORIES_FLAT.map((c) => c.slug)
    const uniqueSlugs = new Set(slugs)
    expect(uniqueSlugs.size).toBe(slugs.length)
  })

  it('all categories have a non-negative sortOrder', () => {
    for (const cat of CATEGORIES_FLAT) {
      expect(cat.sortOrder, `${cat.slug} has invalid sortOrder`).toBeGreaterThanOrEqual(0)
    }
  })

  it('contains goats, cows, buffaloes, camels subcategories', () => {
    const slugs = CATEGORIES_FLAT.map((c) => c.slug)
    expect(slugs).toContain('goats')
    expect(slugs).toContain('cows')
    expect(slugs).toContain('buffaloes')
    expect(slugs).toContain('camels')
  })

  it('contains seeds, fertilizers, tractors subcategories', () => {
    const slugs = CATEGORIES_FLAT.map((c) => c.slug)
    expect(slugs).toContain('seeds')
    expect(slugs).toContain('fertilizers')
    expect(slugs).toContain('machinery-tractors')
  })
})

describe('CATEGORIES_FLAT', () => {
  it('includes both parent and child categories', () => {
    // 2 parents + 8 animals children + 7 agri children = 17 total
    expect(CATEGORIES_FLAT).toHaveLength(17)
  })

  it('includes top-level animals category', () => {
    expect(CATEGORIES_FLAT.some((c) => c.slug === 'animals')).toBe(true)
  })
})

describe('findCategory', () => {
  it('returns the category for a valid slug', () => {
    const cat = findCategory('goats')
    expect(cat).toBeDefined()
    expect(cat!.nameEn).toBe('Goats')
    expect(cat!.nameUr).toBe('بکریاں')
  })

  it('returns agriculture parent', () => {
    const cat = findCategory('agriculture')
    expect(cat).toBeDefined()
    expect(cat!.nameUr).toBe('زراعت')
  })

  it('returns undefined for unknown slug', () => {
    // @ts-expect-error — intentionally testing unknown slug
    const cat = findCategory('dragons')
    expect(cat).toBeUndefined()
  })

  it('finds machinery-tractors', () => {
    const cat = findCategory('machinery-tractors')
    expect(cat).toBeDefined()
    expect(cat!.nameEn).toBe('Machinery & Tractors')
  })
})
