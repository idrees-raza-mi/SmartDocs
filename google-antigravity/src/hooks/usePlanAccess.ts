'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PLAN_LIMITS, PlanType } from '@/lib/constants';

type OrgInfo = { plan: PlanType; orgId: string | null };

// Module-level cache + in-flight promise. With the hook mounted on multiple
// components per page, this collapses N concurrent auth/org fetches into one
// network round-trip — a real win when Supabase is slow or unreachable.
let cached: OrgInfo | null = null;
let inflight: Promise<OrgInfo> | null = null;

async function fetchOrgInfo(): Promise<OrgInfo> {
  if (cached) return cached;
  if (inflight) return inflight;

  const supabase = createClient();
  inflight = (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { plan: 'trial' as PlanType, orgId: null };
      const { data } = await supabase
        .from('organizations')
        .select('id, plan')
        .eq('user_id', user.id)
        .single();
      const info: OrgInfo = {
        plan: (data?.plan as PlanType) ?? 'trial',
        orgId: data?.id ?? null,
      };
      cached = info;
      return info;
    } catch {
      return { plan: 'trial' as PlanType, orgId: null };
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function refreshPlanAccessCache() {
  cached = null;
}

export function usePlanAccess() {
  const [plan, setPlan] = useState<PlanType>(cached?.plan ?? 'trial');
  const [orgId, setOrgId] = useState<string | null>(cached?.orgId ?? null);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let mounted = true;
    fetchOrgInfo().then((info) => {
      if (!mounted) return;
      setPlan(info.plan);
      setOrgId(info.orgId);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function checkAccess(feature: string): { allowed: boolean; requiredPlan: string } {
    const planLimits = PLAN_LIMITS[plan] as Record<string, unknown>;
    if (planLimits[feature] === true) return { allowed: true, requiredPlan: '' };

    const planOrder: PlanType[] = ['trial', 'starter', 'pro', 'business'];
    for (const p of planOrder) {
      if ((PLAN_LIMITS[p] as Record<string, unknown>)[feature] === true) {
        return { allowed: false, requiredPlan: p.charAt(0).toUpperCase() + p.slice(1) };
      }
    }
    return { allowed: false, requiredPlan: 'Business' };
  }

  function getLimit(feature: 'chatbots' | 'sources' | 'messagesPerMonth'): number {
    return PLAN_LIMITS[plan][feature];
  }

  return { plan, orgId, loading, checkAccess, getLimit };
}
