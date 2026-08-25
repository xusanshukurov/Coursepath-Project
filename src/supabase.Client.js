import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase muhit o‘zgaruvchilari topilmadi. .env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY borligini tekshiring.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);