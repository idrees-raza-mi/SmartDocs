import { supabaseAdmin } from '@/lib/supabase/admin';

export type AuditAction =
  | 'chatbot.create'
  | 'chatbot.update'
  | 'chatbot.delete'
  | 'source.create'
  | 'source.delete'
  | 'source.resync'
  | 'apikey.create'
  | 'apikey.revoke'
  | 'webhook.create'
  | 'webhook.delete'
  | 'profile.update'
  | 'plan.upgrade'
  | 'plan.downgrade';

export async function logAudit(params: {
  orgId: string;
  userId: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabaseAdmin.from('audit_log').insert({
      org_id: params.orgId,
      user_id: params.userId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      metadata: (params.metadata as never) ?? null,
    });
  } catch (err) {
    // Audit logging should never break the request that triggered it.
    console.error('[audit] failed to write log:', err);
  }
}
