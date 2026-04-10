export type Province =
  | 'Punjab'
  | 'Sindh'
  | 'KPK'
  | 'Balochistan'
  | 'AJK'
  | 'GilgitBaltistan'
  | 'ICT'

export interface CityConfig {
  id: string   // stable slug used as seed ID
  nameEn: string
  nameUr: string
  province: Province
  isMajorCity: boolean
}

export const CITIES: CityConfig[] = [
  // Punjab
  { id: 'lahore', nameEn: 'Lahore', nameUr: 'لاہور', province: 'Punjab', isMajorCity: true },
  { id: 'faisalabad', nameEn: 'Faisalabad', nameUr: 'فیصل آباد', province: 'Punjab', isMajorCity: true },
  { id: 'rawalpindi', nameEn: 'Rawalpindi', nameUr: 'راولپنڈی', province: 'Punjab', isMajorCity: true },
  { id: 'gujranwala', nameEn: 'Gujranwala', nameUr: 'گوجرانوالہ', province: 'Punjab', isMajorCity: true },
  { id: 'multan', nameEn: 'Multan', nameUr: 'ملتان', province: 'Punjab', isMajorCity: true },
  { id: 'bahawalpur', nameEn: 'Bahawalpur', nameUr: 'بہاولپور', province: 'Punjab', isMajorCity: false },
  { id: 'sargodha', nameEn: 'Sargodha', nameUr: 'سرگودھا', province: 'Punjab', isMajorCity: false },
  { id: 'sialkot', nameEn: 'Sialkot', nameUr: 'سیالکوٹ', province: 'Punjab', isMajorCity: false },
  { id: 'sheikhupura', nameEn: 'Sheikhupura', nameUr: 'شیخوپورہ', province: 'Punjab', isMajorCity: false },
  { id: 'jhang', nameEn: 'Jhang', nameUr: 'جھنگ', province: 'Punjab', isMajorCity: false },
  { id: 'rahim-yar-khan', nameEn: 'Rahim Yar Khan', nameUr: 'رحیم یار خان', province: 'Punjab', isMajorCity: false },
  { id: 'okara', nameEn: 'Okara', nameUr: 'اوکاڑہ', province: 'Punjab', isMajorCity: false },

  // Sindh
  { id: 'karachi', nameEn: 'Karachi', nameUr: 'کراچی', province: 'Sindh', isMajorCity: true },
  { id: 'hyderabad', nameEn: 'Hyderabad', nameUr: 'حیدرآباد', province: 'Sindh', isMajorCity: true },
  { id: 'sukkur', nameEn: 'Sukkur', nameUr: 'سکھر', province: 'Sindh', isMajorCity: false },
  { id: 'larkana', nameEn: 'Larkana', nameUr: 'لاڑکانہ', province: 'Sindh', isMajorCity: false },
  { id: 'nawabshah', nameEn: 'Nawabshah', nameUr: 'نوابشاہ', province: 'Sindh', isMajorCity: false },

  // KPK
  { id: 'peshawar', nameEn: 'Peshawar', nameUr: 'پشاور', province: 'KPK', isMajorCity: true },
  { id: 'mardan', nameEn: 'Mardan', nameUr: 'مردان', province: 'KPK', isMajorCity: false },
  { id: 'abbottabad', nameEn: 'Abbottabad', nameUr: 'ایبٹ آباد', province: 'KPK', isMajorCity: false },
  { id: 'swat', nameEn: 'Swat', nameUr: 'سوات', province: 'KPK', isMajorCity: false },

  // Balochistan
  { id: 'quetta', nameEn: 'Quetta', nameUr: 'کوئٹہ', province: 'Balochistan', isMajorCity: true },
  { id: 'turbat', nameEn: 'Turbat', nameUr: 'تربت', province: 'Balochistan', isMajorCity: false },

  // ICT
  { id: 'islamabad', nameEn: 'Islamabad', nameUr: 'اسلام آباد', province: 'ICT', isMajorCity: true },

  // AJK
  { id: 'muzaffarabad', nameEn: 'Muzaffarabad', nameUr: 'مظفرآباد', province: 'AJK', isMajorCity: false },

  // Gilgit-Baltistan
  { id: 'gilgit', nameEn: 'Gilgit', nameUr: 'گلگت', province: 'GilgitBaltistan', isMajorCity: false },
]

export const MAJOR_CITIES = CITIES.filter((c) => c.isMajorCity)

export function findCity(id: string) {
  return CITIES.find((c) => c.id === id)
}

export function citiesByProvince(province: Province) {
  return CITIES.filter((c) => c.province === province)
}
