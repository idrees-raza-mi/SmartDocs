'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PLAN_LIMITS, PlanType } from '@/lib/constants';

export function usePlanAccess() {
  const [plan, setPlan] = useState<PlanType>('trial');
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase
        .from('organizations')
        .select('id, plan')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setPlan(data.plan as PlanType)
            setOrgId(data.id)
          }
          setLoading(false)
        })
    })
  }, [])

  function checkAccess(feature: keyof Omit<typeof PLAN_LIMITS[PlanType], 'chatbots' | 'messagesPerMonth' | 'sources'>): { allowed: boolean; requiredPlan: string } {
    const planLimits = PLAN_LIMITS[plan]
    const hasAccess = planLimits[feature] === true
    if (hasAccess) return { allowed: true, requiredPlan: '' }

    const planOrder: PlanType[] = ['trial', 'starter', 'pro', 'business']
    for (const p of planOrder) {
      if (PLAN_LIMITS[p][feature] === true) {
        return { allowed: false, requiredPlan: p.charAt(0).toUpperCase() + p.slice(1) }
      }
    }
    return { allowed: false, requiredPlan: 'Business' }
  }

  function getLimit(feature: 'chatbots' | 'sources' | 'messagesPerMonth'): number {
    return PLAN_LIMITS[plan][feature]
  }

  return { plan, orgId, loading, checkAccess, getLimit }
}
