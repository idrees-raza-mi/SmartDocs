import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const { data: key } = await supabaseAdmin
      .from('api_keys')
      .select('id, org_id, organizations!inner(user_id)')
      .eq('id', id)
      .single();
    const orgs = key?.organizations as { user_id?: string } | { user_id?: string }[] | null;
    const orgObj = Array.isArray(orgs) ? orgs[0] : orgs;
    if (!key || orgObj?.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await supabaseAdmin
      .from('api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id);

    await logAudit({
      orgId: key.org_id,
      userId: user.id,
      action: 'apikey.revoke',
      entityType: 'api_key',
      entityId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
