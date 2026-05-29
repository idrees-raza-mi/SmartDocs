import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'edge';

// Lightweight health check — pings Supabase. Useful for uptime monitors and
// the status badge in the footer.
export async function GET() {
  const checks: Record<string, { ok: boolean; latency?: number; error?: string }> = {};

  // Supabase
  try {
    const t = Date.now();
    const { error } = await supabaseAdmin.from('organizations').select('id').limit(1);
    if (error) throw error;
    checks.supabase = { ok: true, latency: Date.now() - t };
  } catch (err) {
    checks.supabase = { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }

  // OpenAI key set?
  checks.openai = { ok: !!process.env.OPENAI_API_KEY };

  // Stripe key set?
  checks.stripe = { ok: !!process.env.STRIPE_SECRET_KEY };

  // Resend key set?
  checks.resend = { ok: !!process.env.RESEND_API_KEY };

  const ok = Object.values(checks).every((c) => c.ok);
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
