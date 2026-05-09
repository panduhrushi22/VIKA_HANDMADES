import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase')) {
  console.error('Supabase credentials missing or invalid in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


