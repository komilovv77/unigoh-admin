import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(url && key)

// Asosiy sayt bilan BIR XIL Supabase loyihasi ishlatiladi.
// Kirish huquqlari bazadagi RLS qoidalari bilan nazorat qilinadi (supabase/migrations).
export const supabase = isConfigured ? createClient(url, key) : null
