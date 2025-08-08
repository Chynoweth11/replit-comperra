import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export type Profile = {
  id: string
  email: string
  name: string
  role: 'customer' | 'vendor' | 'professional'
  phone?: string
  business_name?: string
  zip_code?: string
  material_specialties?: string[]
  business_description?: string
  service_radius?: number
  latitude?: number
  longitude?: number
  formatted_address?: string
  // Customer fields
  customer_type?: 'homeowner' | 'designer' | 'contractor' | 'architect' | 'other'
  street_address?: string
  city?: string
  state?: string
  // Business fields
  ein_number?: string
  licenses_certifications?: string[]
  service_area_zip_codes?: string[]
  business_street_address?: string
  business_city?: string
  business_state?: string
  business_website?: string
  about_business?: string
  social_links?: string[]
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