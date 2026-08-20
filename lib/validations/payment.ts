import { z } from 'zod'

export const paymentIntentSchema = z.object({
  booking_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('INR'), // Default to INR since it's Agrirent
})

export type PaymentIntentFormValues = z.infer<typeof paymentIntentSchema>
