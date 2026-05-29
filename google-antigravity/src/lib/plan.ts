import type { PlanType } from '@/lib/constants';

// Compute the *effective* plan for an org. If the org is still in their
// 7-day trial window, return 'trial' (Starter-tier benefits). Once the trial
// ends, downgrade silently to 'free'. The cron job updates the DB row
// asynchronously; this helper is the synchronous fallback so runtime gates
// work even before the cron fires.
export function effectivePlan(org: { plan: string | null; trial_ends_at: string | null }): PlanType {
  const plan = (org.plan ?? 'free') as PlanType;
  if (plan !== 'trial') return plan;
  if (!org.trial_ends_at) return 'trial';
  return new Date(org.trial_ends_at) > new Date() ? 'trial' : 'free';
}
