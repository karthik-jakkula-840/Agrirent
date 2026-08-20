import { z } from 'zod'

export const reviewSchema = z.object({
  equipment_id: z.string().uuid(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(500, 'Review cannot exceed 500 characters'),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>
