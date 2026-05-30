import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ChatbotCard } from '@/components/dashboard/ChatbotCard';
import { ChatCircleDots, FileText, Users, WarningCircle, Plus, CheckCircle, Circle, ArrowRight, Code } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

// Force this page to render fresh on every request so stats reflect the
// current state of the user's chatbot rather than a build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  // Date.now() must be evaluated PER REQUEST. Pulling it from module scope
  // freezes the value at server cold-start, which on Vercel's serverless
  // can be hours or days old — so every "last 7 days" filter would compare
  // recent messages to a stale anchor and discard them silently.
  const now = Date.now();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Read with the admin client — we've already verified the caller's identity
  // above, and admin queries don't depend on RLS policy correctness (which
  // gets fragile when joining across many tables in chained reads).
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: chatbots, count: chatbotCount } = await supabaseAdmin
    .from('chatbots')
    .select('*', { count: 'exact' })
    .eq('org_id', org?.id || '');

  let sourceCount = 0;
  let unansweredTotal = 0;
  let convIds: string[] = [];

  if (chatbots && chatbots.length > 0) {
    const chatbotIds = chatbots.map(b => b.id);

    const { count: sCount } = await supabaseAdmin
      .from('sources')
      .select('*', { count: 'exact', head: true })
      .in('chatbot_id', chatbotIds);
    sourceCount = sCount || 0;

    const { data: convs } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .in('chatbot_id', chatbotIds);
    convIds = (convs ?? []).map((c) => c.id);

    if (convIds.length > 0) {
      const { count: unansCount } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .eq('was_escalated', true);
      unansweredTotal = unansCount || 0;
    }
  }

  const msgThisMonth = org?.message_count_this_month || 0;

  // Fetch real chart data for last 7 days
  let dailyCounts: number[] = [];
  let topTopics: { label: string; pct: number }[] = [];
  let unansweredQuestions: { question: string; count: number }[] = [];

  if (chatbots && chatbots.length > 0) {
    if (convIds.length > 0) {
      const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString();
      const { data: recentMsgs } = await supabaseAdmin
        .from('messages')
        .select('role, content, was_escalated, created_at')
        .in('conversation_id', convIds)
        .gte('created_at', sevenDaysAgo);

      if (recentMsgs) {
        const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const dayCounts = Array(7).fill(0);

        recentMsgs.forEach(msg => {
          const msgDate = new Date(msg.created_at);
          const dayDiff = Math.floor((now - msgDate.getTime()) / 86400000);
          if (dayDiff >= 0 && dayDiff < 7) {
            dayCounts[6 - dayDiff]++;
          }
        });

        const maxCount = Math.max(...dayCounts, 1);
        dailyCounts = dayCounts.map(c => Math.round((c / maxCount) * 100));

        // Top topics from user messages
        const topicMap: Record<string, number> = {};
        let totalTopic = 0;
        recentMsgs.filter(m => m.role === 'user').forEach(msg => {
          const topic = msg.content.split(' ').slice(0, 3).join(' ');
          topicMap[topic] = (topicMap[topic] || 0) + 1;
          totalTopic++;
        });

        topTopics = Object.entries(topicMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([label, count]) => ({ label: label.length > 20 ? label.slice(0, 20) + '...' : label, pct: Math.round((count / totalTopic) * 100) }));

        // Unanswered questions
        const unansMap: Record<string, number> = {};
        recentMsgs.filter(m => m.was_escalated && m.role === 'user').forEach(msg => {
          const question = msg.content.length > 60 ? msg.content.slice(0, 60) + '...' : msg.content;
          unansMap[question] = (unansMap[question] || 0) + 1;
        });

        unansweredQuestions = Object.entries(unansMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([question, count]) => ({ question, count }));
      }
    }
  }

  const chatbotsWithStats = (chatbots || []).map(bot => ({
    ...bot,
    sourceCount: 0,
    unansweredCount: 0,
  }));

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const hasChatbot = (chatbots?.length ?? 0) > 0;
  const hasSource = sourceCount > 0;
  const hasMessage = unansweredTotal + msgThisMonth > 0;
  const isFullyOnboarded = hasChatbot && hasSource && hasMessage;

  return (
    <div className="space-y-10 max-w-6xl mx-auto">

      {/* Onboarding checklist */}
      {!isFullyOnboarded && (
        <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-1">Get started</h2>
          <p className="text-sm text-white/40 mb-5">Finish these steps to launch your chatbot.</p>
          <div className="space-y-2">
            <OnboardingItem done={hasChatbot} href="/dashboard/chatbots/new" label="Create a chatbot" />
            <OnboardingItem done={hasSource} href={hasChatbot && chatbots ? `/dashboard/chatbots/${chatbots[0].id}` : '/dashboard/chatbots'} label="Add a knowledge source" />
            <OnboardingItem done={hasMessage} href={hasChatbot && chatbots ? `/dashboard/chatbots/${chatbots[0].id}` : '/dashboard/chatbots'} label="Test the chatbot" />
            <OnboardingItem done={false} href={hasChatbot && chatbots ? `/dashboard/chatbots/${chatbots[0].id}/embed` : '/dashboard/chatbots'} label="Embed it on your site" />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Chatbots" value={chatbotCount || 0} icon={<ChatCircleDots size={20} />} />
        <StatsCard title="Messages This Month" value={msgThisMonth} icon={<Users size={20} />} />
        <StatsCard title="Sources Indexed" value={sourceCount} icon={<FileText size={20} />} />
        <StatsCard title="Unanswered" value={unansweredTotal} icon={<WarningCircle size={20} />} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-6 tracking-tight">Messages (Last 7 days)</h2>
          <div className="flex items-end gap-2 h-32">
            {dailyCounts.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-white/10 rounded-sm hover:bg-white/20 transition-colors"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-white/30 font-mono">
                  {dayLabels[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col">
          <h2 className="text-base font-bold text-white mb-6 tracking-tight">Top Topics</h2>
          <div className="space-y-4 flex-1">
            {topTopics.length === 0 ? (
              <span className="text-sm text-white/40">No messages yet.</span>
            ) : (
              topTopics.map(t => (
                <div key={t.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70 font-medium">{t.label}</span>
                    <span className="text-white/40">{t.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-white/40 rounded-full" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chatbots */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Your Agents</h2>
          <Link
            href="/dashboard/chatbots/new"
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            <Plus size={16} weight="bold" />
            New Agent
          </Link>
        </div>

        {(!chatbots || chatbots.length === 0) ? (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChatCircleDots size={32} className="text-white/40" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No chatbots yet</h3>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Create your first chatbot to get started — train it on your docs, embed it on your site.
            </p>
            <Link
              href="/dashboard/chatbots/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Plus size={16} weight="bold" />
              Create Your First Chatbot →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {chatbotsWithStats.map(bot => (
              <ChatbotCard key={bot.id} chatbot={bot} />
            ))}
            <Link
              href="/dashboard/chatbots/new"
              className="border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 hover:border-white/20 hover:bg-white/[0.02] transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <Plus size={20} className="text-white/40" />
              </div>
              <span className="text-sm font-medium text-white/40 group-hover:text-white/60 transition-colors">Create another agent</span>
            </Link>
          </div>
        )}
      </div>

      {/* Quick links row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/developer" className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 hover:border-white/15 transition-colors flex items-center gap-3">
          <Code size={20} className="text-white/40" />
          <div className="flex-1">
            <div className="text-sm font-medium text-white">Developer API</div>
            <div className="text-xs text-white/40">Integrate via REST</div>
          </div>
          <ArrowRight size={14} className="text-white/30" />
        </Link>
        <Link href="/dashboard/review" className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 hover:border-white/15 transition-colors flex items-center gap-3">
          <WarningCircle size={20} className="text-white/40" />
          <div className="flex-1">
            <div className="text-sm font-medium text-white">Review Queue</div>
            <div className="text-xs text-white/40">Answer what your bot missed</div>
          </div>
          <ArrowRight size={14} className="text-white/30" />
        </Link>
        <Link href="/dashboard/billing" className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 hover:border-white/15 transition-colors flex items-center gap-3">
          <FileText size={20} className="text-white/40" />
          <div className="flex-1">
            <div className="text-sm font-medium text-white">Billing</div>
            <div className="text-xs text-white/40">Plan, usage, invoices</div>
          </div>
          <ArrowRight size={14} className="text-white/30" />
        </Link>
      </div>

      {/* Unanswered Questions */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white tracking-tight">Unanswered Questions</h2>
          <span className="text-xs text-white/40 font-medium">Last 7 days</span>
        </div>
        <div className="space-y-3">
          {unansweredQuestions.length === 0 ? (
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 text-center">
              <span className="text-sm text-white/50">No unanswered questions in the last 7 days.</span>
            </div>
          ) : (
            unansweredQuestions.map(({ question, count }) => (
              <div key={question} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg border border-white/5">
                <span className="text-sm font-medium text-white/80 truncate mr-4">{question}</span>
                <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded shrink-0">Asked {count} times</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function OnboardingItem({ done, href, label }: { done: boolean; href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 -mx-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
    >
      {done ? (
        <CheckCircle weight="fill" size={20} className="text-green-400 shrink-0" />
      ) : (
        <Circle size={20} className="text-white/30 shrink-0" />
      )}
      <span className={done ? 'line-through text-white/40 flex-1 text-sm' : 'text-white/80 flex-1 text-sm font-medium'}>
        {label}
      </span>
      {!done && (
        <ArrowRight size={14} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
      )}
    </Link>
  );
}
