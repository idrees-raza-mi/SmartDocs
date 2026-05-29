'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Spinner, ClipboardText } from '@phosphor-icons/react';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import Link from 'next/link';

type Row = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_id: string | null;
};

export default function AuditLogPage() {
  const { plan, loading: planLoading } = usePlanAccess();
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (planLoading || plan !== 'business') return;
    supabase
      .from('audit_log')
      .select('id, action, entity_type, entity_id, metadata, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setRows((data ?? []) as Row[]);
        setLoading(false);
      });
  }, [planLoading, plan]);

  if (planLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={24} className="animate-spin text-white/40" />
      </div>
    );
  }

  if (plan !== 'business') {
    return (
      <div className="max-w-2xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-2xl p-10 text-center">
        <ClipboardText size={36} className="mx-auto text-amber-400/60 mb-3" />
        <h2 className="text-xl font-bold text-white tracking-tight mb-2">Audit Log</h2>
        <p className="text-sm text-white/60 mb-6">Full audit trail is available on the Business plan.</p>
        <Link
          href="/dashboard/billing"
          className="inline-block px-6 py-2 bg-white text-black rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
        >
          Upgrade to Business
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit Log</h1>
        <p className="text-sm text-white/40 mt-1">Every meaningful action in your org, with timestamps and metadata.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size={24} className="animate-spin text-white/40" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-12 text-center text-sm text-white/40">
          No events yet.
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-3 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Action</th>
                <th className="py-3 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Target</th>
                <th className="py-3 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Metadata</th>
                <th className="py-3 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-6 text-xs font-mono text-white/80">{r.action}</td>
                  <td className="py-3 px-6 text-xs text-white/60">{r.entity_type}{r.entity_id ? `:${r.entity_id.slice(0, 8)}` : ''}</td>
                  <td className="py-3 px-6 text-xs text-white/40 max-w-[300px] truncate" title={JSON.stringify(r.metadata)}>
                    {r.metadata ? JSON.stringify(r.metadata) : '—'}
                  </td>
                  <td className="py-3 px-6 text-xs text-white/40 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
