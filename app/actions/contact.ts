'use server'

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

    // Validate using Zod — this is fast and always works
    const validatedData = contactSchema.parse(rawData)

    // Fire-and-forget: try to save to DB but don't wait too long
    const dbSave = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        // @ts-ignore
        const { error } = await supabase.from('contact_messages').insert([{
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message,
        }])
        if (error) {
          console.error('[Contact] DB insert error:', error.message)
        } else {
          console.log('[Contact] Message saved from:', validatedData.email)
        }
      } catch (e) {
        console.error('[Contact] DB exception:', e)
      }
    }

    // Race the DB save against a 3-second timeout — whichever finishes first
    await Promise.race([
      dbSave(),
      new Promise<void>(resolve => setTimeout(resolve, 3000))
    ])

    // Always return success after validation passes
    return { success: true, error: null }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Contact submission error:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

