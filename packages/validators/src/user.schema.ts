import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^(\+92|0)?3[0-9]{9}$/, 'Invalid Pakistani phone number').optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).max(100),
  })
  .refine((d) => d.phone || d.email, {
    message: 'Either phone or email is required',
  })

export const loginSchema = z.object({
  identifier: z.string().min(1), // phone or email
  password: z.string().min(1),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  cityId: z.string().cuid().optional(),
  profileImageUrl: z.string().url().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
