import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

// Cache the client across renders so repeated `createClient()` calls in the same
// tab don't spin up new auth listeners (which is what triggered duplicate
// _recoverAndRefresh storms when Supabase was unreachable).
let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Surface this in the dev console so the developer sees the cause once
    // instead of a flood of "Failed to fetch" errors from auth.
    if (typeof window !== 'undefined') {
      console.error('[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
  }

  cached = createBrowserClient<Database>(url ?? '', key ?? '');
  return cached;
}
