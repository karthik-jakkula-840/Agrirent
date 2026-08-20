import { z } from 'zod'

export const ownerRequestSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  business_type: z.string().min(2, 'Business type is required'),
  tax_id: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
})

export type OwnerRequestFormValues = z.infer<typeof ownerRequestSchema>
