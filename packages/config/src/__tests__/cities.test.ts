import { describe, it, expect } from 'vitest'
import { CITIES, MAJOR_CITIES, findCity, citiesByProvince } from '../cities'

describe('CITIES', () => {
  it('has cities for all provinces', () => {
    const provinces = new Set(CITIES.map((c) => c.province))
    expect(provinces.has('Punjab')).toBe(true)
    expect(provinces.has('Sindh')).toBe(true)
    expect(provinces.has('KPK')).toBe(true)
    expect(provinces.has('Balochistan')).toBe(true)
    expect(provinces.has('ICT')).toBe(true)
  })

  it('all cities have bilingual names', () => {
    for (const city of CITIES) {
      expect(city.nameEn, `${city.id} missing nameEn`).toBeTruthy()
      expect(city.nameUr, `${city.id} missing nameUr`).toBeTruthy()
    }
  })

  it('all city IDs are unique', () => {
    const ids = CITIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes major Pakistani cities', () => {
    const ids = CITIES.map((c) => c.id)
    expect(ids).toContain('lahore')
    expect(ids).toContain('karachi')
    expect(ids).toContain('islamabad')
    expect(ids).toContain('peshawar')
    expect(ids).toContain('quetta')
  })

  it('all cities have a valid province', () => {
    const validProvinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'AJK', 'GilgitBaltistan', 'ICT']
    for (const city of CITIES) {
      expect(validProvinces, `${city.id} has invalid province: ${city.province}`).toContain(city.province)
    }
  })

  it('isMajorCity is a boolean for every city', () => {
    for (const city of CITIES) {
      expect(typeof city.isMajorCity).toBe('boolean')
    }
  })
})

describe('MAJOR_CITIES', () => {
  it('is a subset of CITIES', () => {
    const allIds = new Set(CITIES.map((c) => c.id))
    for (const city of MAJOR_CITIES) {
      expect(allIds.has(city.id)).toBe(true)
    }
  })

  it('every major city has isMajorCity = true', () => {
    for (const city of MAJOR_CITIES) {
      expect(city.isMajorCity).toBe(true)
    }
  })

  it('includes Lahore, Karachi, Islamabad', () => {
    const ids = MAJOR_CITIES.map((c) => c.id)
    expect(ids).toContain('lahore')
    expect(ids).toContain('karachi')
    expect(ids).toContain('islamabad')
  })

  it('has at least 5 major cities', () => {
    expect(MAJOR_CITIES.length).toBeGreaterThanOrEqual(5)
  })
})

describe('findCity', () => {
  it('returns city for known id', () => {
    const city = findCity('lahore')
    expect(city).toBeDefined()
    expect(city!.nameEn).toBe('Lahore')
    expect(city!.nameUr).toBe('لاہور')
    expect(city!.province).toBe('Punjab')
  })

  it('returns undefined for unknown id', () => {
    const city = findCity('atlantis')
    expect(city).toBeUndefined()
  })

  it('returns correct province for Karachi', () => {
    const city = findCity('karachi')
    expect(city!.province).toBe('Sindh')
  })

  it('returns correct province for Islamabad', () => {
    const city = findCity('islamabad')
    expect(city!.province).toBe('ICT')
  })
})

describe('citiesByProvince', () => {
  it('returns only Punjab cities when asked for Punjab', () => {
    const cities = citiesByProvince('Punjab')
    expect(cities.length).toBeGreaterThan(0)
    for (const city of cities) {
      expect(city.province).toBe('Punjab')
    }
  })

  it('returns Lahore in Punjab cities', () => {
    const cities = citiesByProvince('Punjab')
    expect(cities.some((c) => c.id === 'lahore')).toBe(true)
  })

  it('returns Karachi in Sindh cities', () => {
    const cities = citiesByProvince('Sindh')
    expect(cities.some((c) => c.id === 'karachi')).toBe(true)
  })

  it('does not mix provinces', () => {
    const punjab = citiesByProvince('Punjab')
    const sindh = citiesByProvince('Sindh')
    const punjabIds = new Set(punjab.map((c) => c.id))
    for (const city of sindh) {
      expect(punjabIds.has(city.id)).toBe(false)
    }
  })
})
