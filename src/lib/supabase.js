import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(url && key)

// Uses the SAME Supabase project as the main site.
// Access is enforced by RLS policies in the database (supabase/migrations).
export const supabase = isConfigured ? createClient(url, key) : null
