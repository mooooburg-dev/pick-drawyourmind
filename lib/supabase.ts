import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

export const getSupabase = () => {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

    if (supabaseUrl.includes('placeholder')) {
      throw new Error('Supabase URL is not configured')
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

export const getSupabaseAdmin = () => {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

    if (supabaseUrl.includes('placeholder')) {
      throw new Error('Supabase URL is not configured')
    }

    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return _supabaseAdmin
}

// 레거시 호환성을 위한 별칭 - 빌드 시 오류 방지를 위해 제거

export type Campaign = {
  id: string
  title: string
  image_url: string
  partner_link: string
  category: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

export type BlogPost = {
  id: string
  campaign_id: string
  title: string
  content: string
  excerpt?: string
  slug: string
  featured_image_url?: string
  content_image_1_url?: string
  content_image_2_url?: string
  tags?: string[]
  meta_description?: string
  is_published: boolean
  created_at: string
  updated_at: string
}