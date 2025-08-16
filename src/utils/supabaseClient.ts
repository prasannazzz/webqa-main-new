import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Supabase environment variables are missing. Check your .env file.");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,  // Keeps user logged in if you add auth later
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (input: RequestInfo, init?: RequestInit) => fetch(input, init), // Ensures SSR support if needed
    
  }
});