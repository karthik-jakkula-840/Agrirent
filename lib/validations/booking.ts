import { z } from 'zod'

export const bookingSchema = z.object({
  equipment_id: z.string().uuid(),
  start_date: z.string().min(1, 'Start date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_date: z.string().min(1, 'End date is required'),
  end_time: z.string().min(1, 'End time is required'),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
}).refine((data) => {
  const start = new Date(`${data.start_date}T${data.start_time}`)
  const end = new Date(`${data.end_date}T${data.end_time}`)
  const now = new Date()

  // Prevent past dates
  if (start < now) {
    return false
  }
  
  // End must be strictly after start
  return end > start
}, {
  message: 'Invalid rental period. Ensure start time is in the future and end time is after start time.',
  path: ['end_time'] // Highlight end time field in case of error
})

export type BookingFormValues = z.infer<typeof bookingSchema>
