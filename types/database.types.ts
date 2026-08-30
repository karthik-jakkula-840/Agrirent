export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: string
          full_name: string | null
          email: string | null
          phone: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      notifications: {
        Row: { id: string, user_id: string, read: boolean, created_at: string }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      equipment: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
      equipment_images: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
      rentals: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
      rental_items: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
      bookings: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
      payments: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
      reviews: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
      favorites: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
      owner_requests: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
      transactions: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
      activity_logs: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
      contact_messages: { Row: Record<string, any>; Insert: Record<string, any>; Update: Record<string, any> }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
