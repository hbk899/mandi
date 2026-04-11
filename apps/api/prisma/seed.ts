import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { CITIES, CATEGORIES } from '@mandi/config'

const prisma = new PrismaClient()

// ── Category attributes per leaf slug ──────────────────────────────
const ATTRIBUTES: Record<
  string,
  { key: string; labelEn: string; labelUr: string; type: 'text' | 'number' | 'select' | 'boolean'; options?: string[]; required?: boolean }[]
> = {
  goats: [
    { key: 'breed', labelEn: 'Breed', labelUr: 'نسل', type: 'select', options: ['Beetal', 'Teddy', 'Nachi', 'Dera Din Panah', 'Kamori', 'Other'] },
    { key: 'age_months', labelEn: 'Age (months)', labelUr: 'عمر (مہینے)', type: 'number' },
    { key: 'weight_kg', labelEn: 'Weight (kg)', labelUr: 'وزن (کلو)', type: 'number' },
    { key: 'gender', labelEn: 'Gender', labelUr: 'جنس', type: 'select', options: ['Male', 'Female'] },
    { key: 'vaccinated', labelEn: 'Vaccinated', labelUr: 'ویکسین شدہ', type: 'boolean' },
  ],
  cows: [
    { key: 'breed', labelEn: 'Breed', labelUr: 'نسل', type: 'select', options: ['Sahiwal', 'Cholistani', 'Tharparkar', 'Friesian Cross', 'Other'] },
    { key: 'age_months', labelEn: 'Age (months)', labelUr: 'عمر (مہینے)', type: 'number' },
    { key: 'weight_kg', labelEn: 'Weight (kg)', labelUr: 'وزن (کلو)', type: 'number' },
    { key: 'milk_liters_per_day', labelEn: 'Milk (litres/day)', labelUr: 'دودھ (لیٹر/روز)', type: 'number' },
    { key: 'gender', labelEn: 'Gender', labelUr: 'جنس', type: 'select', options: ['Male', 'Female'] },
    { key: 'pregnant', labelEn: 'Pregnant', labelUr: 'حاملہ', type: 'boolean' },
  ],
  buffaloes: [
    { key: 'breed', labelEn: 'Breed', labelUr: 'نسل', type: 'select', options: ['Nili Ravi', 'Kundi', 'Azi Kheli', 'Other'] },
    { key: 'age_months', labelEn: 'Age (months)', labelUr: 'عمر (مہینے)', type: 'number' },
    { key: 'milk_liters_per_day', labelEn: 'Milk (litres/day)', labelUr: 'دودھ (لیٹر/روز)', type: 'number' },
    { key: 'gender', labelEn: 'Gender', labelUr: 'جنس', type: 'select', options: ['Male', 'Female'] },
    { key: 'pregnant', labelEn: 'Pregnant', labelUr: 'حاملہ', type: 'boolean' },
  ],
  camels: [
    { key: 'breed', labelEn: 'Breed', labelUr: 'نسل', type: 'select', options: ['Brela', 'Dhatti', 'Kharai', 'Other'] },
    { key: 'age_months', labelEn: 'Age (months)', labelUr: 'عمر (مہینے)', type: 'number' },
    { key: 'gender', labelEn: 'Gender', labelUr: 'جنس', type: 'select', options: ['Male', 'Female'] },
    { key: 'trained', labelEn: 'Trained', labelUr: 'تربیت یافتہ', type: 'boolean' },
  ],
  horses: [
    { key: 'breed', labelEn: 'Breed', labelUr: 'نسل', type: 'select', options: ['Thoroughbred', 'Arabian', 'Waler', 'Desi', 'Other'] },
    { key: 'age_months', labelEn: 'Age (months)', labelUr: 'عمر (مہینے)', type: 'number' },
    { key: 'gender', labelEn: 'Gender', labelUr: 'جنس', type: 'select', options: ['Stallion', 'Mare', 'Gelding'] },
    { key: 'trained', labelEn: 'Trained', labelUr: 'تربیت یافتہ', type: 'boolean' },
    { key: 'color', labelEn: 'Color', labelUr: 'رنگ', type: 'text' },
  ],
  birds: [
    { key: 'species', labelEn: 'Species', labelUr: 'قسم', type: 'select', options: ['Parrot', 'Pigeon', 'Hen', 'Rooster', 'Peacock', 'Other'] },
    { key: 'age_months', labelEn: 'Age (months)', labelUr: 'عمر (مہینے)', type: 'number' },
    { key: 'pair', labelEn: 'Selling as pair', labelUr: 'جوڑے کے طور پر', type: 'boolean' },
  ],
  fish: [
    { key: 'species', labelEn: 'Species', labelUr: 'قسم', type: 'text' },
    { key: 'quantity', labelEn: 'Quantity', labelUr: 'تعداد', type: 'number' },
    { key: 'weight_kg', labelEn: 'Weight (kg)', labelUr: 'وزن (کلو)', type: 'number' },
  ],
  seeds: [
    { key: 'crop_type', labelEn: 'Crop Type', labelUr: 'فصل کی قسم', type: 'select', options: ['Wheat', 'Rice', 'Cotton', 'Maize', 'Sugarcane', 'Vegetables', 'Other'] },
    { key: 'quantity_kg', labelEn: 'Quantity (kg)', labelUr: 'مقدار (کلو)', type: 'number' },
    { key: 'variety', labelEn: 'Variety', labelUr: 'قسم', type: 'text' },
    { key: 'certified', labelEn: 'Certified', labelUr: 'تصدیق شدہ', type: 'boolean' },
  ],
  fertilizers: [
    { key: 'type', labelEn: 'Type', labelUr: 'قسم', type: 'select', options: ['Urea', 'DAP', 'NP', 'SOP', 'Organic', 'Other'] },
    { key: 'quantity_kg', labelEn: 'Quantity (kg)', labelUr: 'مقدار (کلو)', type: 'number', required: true },
    { key: 'brand', labelEn: 'Brand', labelUr: 'برانڈ', type: 'text' },
  ],
  pesticides: [
    { key: 'type', labelEn: 'Type', labelUر: 'قسم', type: 'select', options: ['Herbicide', 'Insecticide', 'Fungicide', 'Other'] },
    { key: 'quantity_liters', labelEn: 'Quantity (litres)', labelUr: 'مقدار (لیٹر)', type: 'number' },
    { key: 'brand', labelEn: 'Brand', labelUr: 'برانڈ', type: 'text' },
  ],
  'hand-tools': [
    { key: 'tool_type', labelEn: 'Tool Type', labelUr: 'اوزار کی قسم', type: 'text' },
    { key: 'condition', labelEn: 'Condition', labelUr: 'حالت', type: 'select', options: ['New', 'Used - Good', 'Used - Fair'] },
    { key: 'quantity', labelEn: 'Quantity', labelUr: 'تعداد', type: 'number' },
  ],
  'machinery-tractors': [
    { key: 'type', labelEn: 'Type', labelUr: 'قسم', type: 'select', options: ['Tractor', 'Thresher', 'Cultivator', 'Plough', 'Sprayer', 'Generator', 'Other'] },
    { key: 'brand', labelEn: 'Brand', labelUr: 'برانڈ', type: 'text' },
    { key: 'model_year', labelEn: 'Model Year', labelUr: 'ماڈل سال', type: 'number' },
    { key: 'engine_hp', labelEn: 'Engine (HP)', labelUr: 'انجن (HP)', type: 'number' },
    { key: 'condition', labelEn: 'Condition', labelUr: 'حالت', type: 'select', options: ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'] },
    { key: 'hours_used', labelEn: 'Hours Used', labelUr: 'استعمال شدہ گھنٹے', type: 'number' },
  ],
  'land-for-lease': [
    { key: 'area_acres', labelEn: 'Area (acres)', labelUr: 'رقبہ (ایکڑ)', type: 'number', required: true },
    { key: 'lease_duration', labelEn: 'Lease Duration', labelUr: 'لیز مدت', type: 'select', options: ['1 Season', '1 Year', '2 Years', '3+ Years'] },
    { key: 'soil_type', labelEn: 'Soil Type', labelUr: 'مٹی کی قسم', type: 'select', options: ['Clay', 'Sandy', 'Loam', 'Other'] },
    { key: 'water_source', labelEn: 'Water Source', labelUr: 'پانی کا ذریعہ', type: 'select', options: ['Canal', 'Tubewell', 'Rainwater', 'Multiple'] },
  ],
}

async function main() {
  console.log('🌱 Starting database seed...')

  // ── Cities ────────────────────────────────────────────────────
  console.log('  → Seeding cities...')
  for (const city of CITIES) {
    await prisma.city.upsert({
      where: { id: city.id },
      update: { nameEn: city.nameEn, nameUr: city.nameUr, province: city.province, isMajorCity: city.isMajorCity },
      create: { id: city.id, nameEn: city.nameEn, nameUr: city.nameUr, province: city.province, isMajorCity: city.isMajorCity },
    })
  }
  console.log(`     ✓ ${CITIES.length} cities seeded`)

  // ── Categories + subcategories + attributes ───────────────────
  console.log('  → Seeding categories...')
  let categoryCount = 0
  let attributeCount = 0

  for (const parent of CATEGORIES) {
    const parentRecord = await prisma.category.upsert({
      where: { slug: parent.slug },
      update: { nameEn: parent.nameEn, nameUr: parent.nameUr, sortOrder: parent.sortOrder, isActive: true },
      create: { slug: parent.slug, nameEn: parent.nameEn, nameUr: parent.nameUr, sortOrder: parent.sortOrder, isActive: true },
    })
    categoryCount++

    for (const child of parent.children ?? []) {
      const childRecord = await prisma.category.upsert({
        where: { slug: child.slug },
        update: { nameEn: child.nameEn, nameUr: child.nameUr, sortOrder: child.sortOrder, isActive: true, parentId: parentRecord.id },
        create: { slug: child.slug, nameEn: child.nameEn, nameUr: child.nameUr, sortOrder: child.sortOrder, isActive: true, parentId: parentRecord.id },
      })
      categoryCount++

      const attrs = ATTRIBUTES[child.slug] ?? []
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i]
        await prisma.categoryAttribute.upsert({
          where: {
            // Composite unique: categoryId + attributeKey
            id: `${childRecord.id}_${attr.key}`,
          },
          update: {
            labelEn: attr.labelEn,
            labelUr: attr.labelUr ?? attr.labelEn,
            inputType: attr.type,
            optionsJson: attr.options ?? null,
            isRequired: attr.required ?? false,
            sortOrder: i,
          },
          create: {
            id: `${childRecord.id}_${attr.key}`,
            categoryId: childRecord.id,
            attributeKey: attr.key,
            labelEn: attr.labelEn,
            labelUr: attr.labelUr ?? attr.labelEn,
            inputType: attr.type,
            optionsJson: attr.options ?? null,
            isRequired: attr.required ?? false,
            sortOrder: i,
          },
        })
        attributeCount++
      }
    }
  }

  console.log(`     ✓ ${categoryCount} categories seeded`)
  console.log(`     ✓ ${attributeCount} category attributes seeded`)
  console.log('\n✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
