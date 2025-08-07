import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig, isSupabaseConfigured as checkConfigured } from '@/config/env'

// Get Supabase configuration
const config = getSupabaseConfig()

// Create the Supabase client
export const supabase = createClient(config.url, config.anonKey)
export const isSupabaseConfigured = checkConfigured()

// Database types for TypeScript
export type Profile = {
  id: string
  email: string
  name: string
  role: 'customer' | 'vendor' | 'professional' | 'trade'
  phone?: string
  business_name?: string
  zip_code?: string
  material_specialties?: string[]
  business_description?: string
  service_radius?: number
  created_at: string
  updated_at: string
}

export type Lead = {
  id: string
  email: string
  phone?: string
  zip_code: string
  material_category: string
  project_type: string
  budget?: number
  timeline?: string
  description: string
  status: 'new' | 'contacted' | 'qualified' | 'closed'
  intent_score: number
  created_at: string
  updated_at: string
}