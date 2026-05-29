'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PLAN_LIMITS, PLAN_PRICES, PlanType } from '@/lib/constants';
import type { Organization } from '@/types/chatbot';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingPageInner />
    </Suspense>
  );
}

function BillingPageInner() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [org, setOrg] = useState<Organization | null>(null);
  const [chatbotCount, setChatbotCount] = useState(0);
  const [sourceCount, setSourceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const expired = searchParams.get('expired') === 'true';
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (orgData) setOrg(orgData);

      if (orgData) {
        const { count: cCount } = await supabase
          .from('chatbots')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgData.id);

        setChatbotCount(cCount || 0);

        const { data: bots } = await supabase
          .from('chatbots')
          .select('id')
          .eq('org_id', orgData.id);

        if (bots && bots.length > 0) {
          const { count: sCount } = await supabase
            .from('sources')
            .select('*', { count: 'exact', head: true })
            .in('chatbot_id', bots.map(b => b.id));

          setSourceCount(sCount || 0);
        }
      }

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-48 mb-8" />
        <div className="h-32 bg-white/5 rounded-2xl" />
        <div className="h-48 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-white/50">Could not load billing information.</p>
      </div>
    );
  }

  const plan: PlanType = org.plan;
  const limits: {
    messagesPerMonth: number;
    chatbots: number;
    sources: number;
    analytics: boolean;
    customBranding: boolean;
  } = PLAN_LIMITS[plan];
  const messageUsage = Math.min(org.message_count_this_month || 0, limits.messagesPerMonth);
  const messagePct = limits.messagesPerMonth === -1 ? 0 : Math.round((messageUsage / limits.messagesPerMonth) * 100);
  const chatbotPct = limits.chatbots === -1 ? 0 : Math.round((chatbotCount / limits.chatbots) * 100);
  const sourcePct = limits.sources === -1 ? 0 : Math.round((sourceCount / limits.sources) * 100);

  function getBarColor(pct: number) {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80) return 'bg-yellow-500';
    return 'bg-blue-500';
  }

  function getWarning(pct: number) {
    if (pct >= 100) return <span className="text-xs text-red-400 font-medium">Limit reached</span>;
    if (pct >= 80) return <span className="text-xs text-yellow-400 font-medium">Approaching limit</span>;
    return null;
  }

  function daysRemaining() {
    if (!org?.trial_ends_at) return null;
    const end = new Date(org.trial_ends_at);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'Expired';
    return `${diff} days remaining`;
  }

  const planOrder: PlanType[] = ['starter', 'pro', 'business'];
  const currentIndex = planOrder.indexOf(plan);
  const nextPlan = currentIndex >= 0 && currentIndex < planOrder.length - 1 ? planOrder[currentIndex + 1] : null;

  async function handleUpgrade(upgradePlan: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/lemonsqueezy/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ planId: upgradePlan }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.assign(data.url);
    }
  }

  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {expired && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
          <WarningCircle size={20} weight="fill" className="text-red-400 shrink-0" />
          <p className="text-sm text-red-300 font-medium">Your trial has ended. Choose a plan to continue using DocWise.</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} weight="fill" className="text-green-400 shrink-0" />
          <p className="text-sm text-green-300 font-medium">Payment successful! Your plan is now active.</p>
        </div>
      )}

      {canceled && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
          <WarningCircle size={20} weight="fill" className="text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-300 font-medium">Checkout was canceled. You can try again anytime.</p>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Current Plan</h2>
            <p className="text-sm text-white/40 mt-1">
              {plan === 'trial' ? 'Trial' : planName} plan
              {plan === 'trial' && daysRemaining() && (
                <span className="ml-2 text-amber-400 font-medium">({daysRemaining()})</span>
              )}
            </p>
          </div>
          {plan !== 'trial' && (
            <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-bold text-white">
              {planName}
            </div>
          )}
        </div>

        {/* Usage Bars */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">Messages this month</span>
              <span className="text-white font-medium">{messageUsage}{limits.messagesPerMonth === -1 ? '' : ` / ${limits.messagesPerMonth}`}</span>
            </div>
            {limits.messagesPerMonth !== -1 && (
              <>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${getBarColor(messagePct)}`} style={{ width: `${Math.min(messagePct, 100)}%` }} />
                </div>
                <div className="mt-1">{getWarning(messagePct)}</div>
              </>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">Chatbots</span>
              <span className="text-white font-medium">{chatbotCount}{limits.chatbots === -1 ? '' : ` / ${limits.chatbots}`}</span>
            </div>
            {limits.chatbots !== -1 && (
              <>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${getBarColor(chatbotPct)}`} style={{ width: `${Math.min(chatbotPct, 100)}%` }} />
                </div>
                <div className="mt-1">{getWarning(chatbotPct)}</div>
              </>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">Sources</span>
              <span className="text-white font-medium">{sourceCount}{limits.sources === -1 ? '' : ` / ${limits.sources}`}</span>
            </div>
            {limits.sources !== -1 && (
              <>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${getBarColor(sourcePct)}`} style={{ width: `${Math.min(sourcePct, 100)}%` }} />
                </div>
                <div className="mt-1">{getWarning(sourcePct)}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Section */}
      {plan === 'trial' && (
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight mb-6">Choose a plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planOrder.map((p) => {
              const price = PLAN_PRICES[p as keyof typeof PLAN_PRICES];
              const pLimits: typeof limits = PLAN_LIMITS[p];
              return (
                <div key={p} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                  <h3 className="text-sm font-bold text-white/50 tracking-wider mb-2 uppercase">{p}</h3>
                  <div className="text-3xl font-bold text-white tracking-tighter mb-4">${price.monthly}<span className="text-sm text-white/40 font-normal">/mo</span></div>
                  <ul className="space-y-3 mb-8">
                    <li className="text-sm text-white/70 flex items-start gap-2">
                      <CheckCircle size={16} weight="fill" className="text-white/30 shrink-0 mt-0.5" />
                      {pLimits.chatbots === -1 ? 'Unlimited chatbots' : `${pLimits.chatbots} chatbots`}
                    </li>
                    <li className="text-sm text-white/70 flex items-start gap-2">
                      <CheckCircle size={16} weight="fill" className="text-white/30 shrink-0 mt-0.5" />
                      {pLimits.messagesPerMonth === -1 ? 'Unlimited messages' : `${pLimits.messagesPerMonth} messages/mo`}
                    </li>
                    <li className="text-sm text-white/70 flex items-start gap-2">
                      <CheckCircle size={16} weight="fill" className="text-white/30 shrink-0 mt-0.5" />
                      {pLimits.sources === -1 ? 'Unlimited sources' : `${pLimits.sources} sources`}
                    </li>
                    {pLimits.analytics && <li className="text-sm text-white/70 flex items-start gap-2"><CheckCircle size={16} weight="fill" className="text-white/30 shrink-0 mt-0.5" />Analytics</li>}
                    {pLimits.customBranding && <li className="text-sm text-white/70 flex items-start gap-2"><CheckCircle size={16} weight="fill" className="text-white/30 shrink-0 mt-0.5" />Remove branding</li>}
                  </ul>
                  <button
                    onClick={() => handleUpgrade(p)}
                    className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors text-sm"
                  >
                    Choose {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {plan !== 'trial' && nextPlan && (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-bold text-white tracking-tight mb-2">Ready for more?</h2>
          <p className="text-sm text-white/50 mb-6">Upgrade to {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)} for more features and higher limits.</p>
          <button
            onClick={() => handleUpgrade(nextPlan!)}
            className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors"
          >
            Upgrade to {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)} — ${PLAN_PRICES[nextPlan as keyof typeof PLAN_PRICES].monthly}/mo
          </button>
        </div>
      )}
    </div>
  );
}
