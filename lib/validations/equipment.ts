import { z } from 'zod'

export const equipmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  category_id: z.string().min(1, 'Please select a category'),
  custom_category: z.string().optional(),
  sub_category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().min(1950, 'Invalid year').max(new Date().getFullYear(), 'Invalid year').optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  
  fuel_type: z.string().optional(),
  condition: z.string().optional(),
  working_status: z.string().optional(),
  horsepower: z.coerce.number().positive().optional().or(z.literal('')),
  working_hours: z.coerce.number().nonnegative().optional().or(z.literal('')),
  
  hourly_price: z.coerce.number().nonnegative('Price cannot be negative').optional().or(z.literal('')),
  daily_price: z.coerce.number().min(1, 'Daily price must be greater than 0'),
  weekly_price: z.coerce.number().nonnegative().optional().or(z.literal('')),
  monthly_price: z.coerce.number().nonnegative().optional().or(z.literal('')),
  deposit: z.coerce.number().nonnegative('Security deposit cannot be negative').default(0),
  
  location: z.string().min(2, 'Location is required'),
  address: z.string().min(5, 'Address is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  latitude: z.coerce.number().optional().or(z.literal('')),
  longitude: z.coerce.number().optional().or(z.literal('')),
  
  insurance_status: z.string().optional(),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  
  availability: z.enum(['available', 'booked', 'maintenance', 'unavailable']).default('available'),
}).refine(data => {
  if (data.category_id === 'other' && !data.custom_category?.trim()) {
    return false
  }
  return true
}, {
  message: "Custom category name is required",
  path: ["custom_category"]
})

export type EquipmentFormValues = z.infer<typeof equipmentSchema>
