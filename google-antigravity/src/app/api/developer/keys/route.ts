import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateApiKey } from '@/lib/api-keys';
import { logAudit } from '@/lib/audit';
import { PLAN_LIMITS, type PlanType } from '@/lib/constants';

async function requireOrgWithApi(userId: string) {
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id, plan')
    .eq('user_id', userId)
    .single();
  if (!org) return { error: 'Organization not found', status: 404 as const };
  if (!PLAN_LIMITS[org.plan as PlanType].apiAccess) {
    return { error: 'API access requires the Business plan.', status: 403 as const };
  }
  return { org };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await requireOrgWithApi(user.id);
    if ('error' in res) return NextResponse.json({ error: res.error }, { status: res.status });

    const { data: keys } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, prefix, last_used_at, created_at, revoked_at')
      .eq('org_id', res.org.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ keys: keys ?? [] });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await requireOrgWithApi(user.id);
    if ('error' in res) return NextResponse.json({ error: res.error }, { status: res.status });

    const body = await req.json().catch(() => ({}));
    const name = (body.name as string)?.trim() || 'Untitled key';

    const { full, hash, prefix } = generateApiKey();
    const { data } = await supabaseAdmin
      .from('api_keys')
      .insert({ org_id: res.org.id, name, prefix, key_hash: hash })
      .select('id, name, prefix, created_at')
      .single();

    await logAudit({
      orgId: res.org.id,
      userId: user.id,
      action: 'apikey.create',
      entityType: 'api_key',
      entityId: data?.id,
      metadata: { name },
    });

    return NextResponse.json({ key: full, summary: data });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
