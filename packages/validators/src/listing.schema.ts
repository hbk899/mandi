import { z } from 'zod'

export const createListingSchema = z.object({
  titleEn: z.string().min(3).max(200),
  titleUr: z.string().min(3).max(200).optional(),
  descriptionEn: z.string().max(5000).optional(),
  descriptionUr: z.string().max(5000).optional(),
  price: z.number().positive().optional(),
  currency: z.string().default('PKR'),
  priceType: z.enum(['fixed', 'negotiable', 'free', 'contact']).default('fixed'),
  categoryId: z.string().cuid(),
  cityId: z.string().cuid().optional(),
  locationText: z.string().max(300).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  attributes: z.record(z.unknown()).default({}),
})

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['draft', 'active', 'sold', 'expired']).optional(),
})

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
