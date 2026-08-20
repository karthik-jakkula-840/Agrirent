'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function submitContactMessage(prevState: any, formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    }

    // Validate using Zod
    const validatedData = contactSchema.parse(rawData)

    const supabase = await createClient()

    // Insert into Supabase
    // @ts-ignore: Placeholder types might lack contact_messages exact signature
    const { error } = await supabase.from('contact_messages').insert([{
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
    }])

    if (error) {
      console.error('Supabase insertion error:', error)
      return {
        success: false,
        error: 'Failed to send message. Please try again later.'
      }
    }

    return {
      success: true,
      error: null
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      }
    }
    
    console.error('Contact submission error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}
