import 'server-only'
import { createClient } from './server'

export async function uploadFile(bucket: string, path: string, file: File | Blob, options?: {
  cacheControl?: string,
  upsert?: boolean
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: options?.cacheControl || '3600',
    upsert: options?.upsert || false,
  })

  if (error) throw error
  return data
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
  return data
}

export async function getPublicUrl(bucket: string, path: string) {
  const supabase = await createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 60) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}
