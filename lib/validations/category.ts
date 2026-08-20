import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(50, 'Slug cannot exceed 50 characters'),
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
  icon_url: z.string().url('Must be a valid URL').optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
