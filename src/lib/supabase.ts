import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mgabikdbuelwynmgazfo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kGXuX1lFglmuJm3U59xHUA_X4uml3lo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
