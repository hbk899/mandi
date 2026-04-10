export type CategorySlug =
  // Animals — top level
  | 'animals'
  // Animals — children
  | 'goats'
  | 'cows'
  | 'buffaloes'
  | 'camels'
  | 'horses'
  | 'birds'
  | 'fish'
  | 'other-animals'
  // Agriculture — top level
  | 'agriculture'
  // Agriculture — children
  | 'seeds'
  | 'fertilizers'
  | 'pesticides'
  | 'hand-tools'
  | 'machinery-tractors'
  | 'land-for-lease'
  | 'other-agriculture'

export interface CategoryConfig {
  slug: CategorySlug
  nameEn: string
  nameUr: string
  iconUrl?: string
  sortOrder: number
  children?: CategoryConfig[]
}

export const CATEGORIES: CategoryConfig[] = [
  {
    slug: 'animals',
    nameEn: 'Animals',
    nameUr: 'جانور',
    sortOrder: 1,
    children: [
      { slug: 'goats', nameEn: 'Goats', nameUr: 'بکریاں', sortOrder: 1 },
      { slug: 'cows', nameEn: 'Cows', nameUr: 'گائیں', sortOrder: 2 },
      { slug: 'buffaloes', nameEn: 'Buffaloes', nameUr: 'بھینسیں', sortOrder: 3 },
      { slug: 'camels', nameEn: 'Camels', nameUr: 'اونٹ', sortOrder: 4 },
      { slug: 'horses', nameEn: 'Horses', nameUr: 'گھوڑے', sortOrder: 5 },
      { slug: 'birds', nameEn: 'Birds', nameUr: 'پرندے', sortOrder: 6 },
      { slug: 'fish', nameEn: 'Fish', nameUr: 'مچھلی', sortOrder: 7 },
      { slug: 'other-animals', nameEn: 'Other Animals', nameUr: 'دیگر جانور', sortOrder: 8 },
    ],
  },
  {
    slug: 'agriculture',
    nameEn: 'Agriculture',
    nameUr: 'زراعت',
    sortOrder: 2,
    children: [
      { slug: 'seeds', nameEn: 'Seeds', nameUr: 'بیج', sortOrder: 1 },
      { slug: 'fertilizers', nameEn: 'Fertilizers', nameUr: 'کھاد', sortOrder: 2 },
      { slug: 'pesticides', nameEn: 'Pesticides', nameUr: 'کیڑے مار دوائیں', sortOrder: 3 },
      { slug: 'hand-tools', nameEn: 'Hand Tools', nameUr: 'ہاتھ کے اوزار', sortOrder: 4 },
      { slug: 'machinery-tractors', nameEn: 'Machinery & Tractors', nameUr: 'مشینری اور ٹریکٹر', sortOrder: 5 },
      { slug: 'land-for-lease', nameEn: 'Land for Lease', nameUr: 'زمین کرایے پر', sortOrder: 6 },
      { slug: 'other-agriculture', nameEn: 'Other Agriculture', nameUr: 'دیگر زراعت', sortOrder: 7 },
    ],
  },
]

// Flat map for easy lookup
export const CATEGORIES_FLAT = CATEGORIES.flatMap((c) => [c, ...(c.children ?? [])])

export function findCategory(slug: CategorySlug) {
  return CATEGORIES_FLAT.find((c) => c.slug === slug)
}
