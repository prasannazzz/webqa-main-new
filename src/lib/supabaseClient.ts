import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Attempt to get Supabase credentials from the Lovable native integration (no .env needed)
const getConfig = () => {
  const w = window as any;
  const url =
    w.LOVABLE_SUPABASE_URL ||
    w.SUPABASE_URL ||
    w.__SUPABASE_URL__ ||
    w.__LOVABLE_SUPABASE_URL__;
  const anon =
    w.LOVABLE_SUPABASE_ANON_KEY ||
    w.SUPABASE_ANON_KEY ||
    w.__SUPABASE_ANON_KEY__ ||
    w.__LOVABLE_SUPABASE_ANON_KEY__;
  return { url, anon } as { url?: string; anon?: string };
};

const { url, anon } = getConfig();

export const supabase: SupabaseClient | null =
  url && anon ? createClient(url, anon) : null;

if (!supabase) {
  // This warning helps users connect the native Supabase integration if not already active
  console.warn(
    '[Supabase] Missing URL or anon key. Connect via the green Supabase button (top right) to enable storage persistence.'
  );
}

export const QA_BUCKET = 'qa-reports';
