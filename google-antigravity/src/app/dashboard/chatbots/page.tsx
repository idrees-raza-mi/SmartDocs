import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ChatbotCard } from '@/components/dashboard/ChatbotCard';
import type { ChatbotWithStats } from '@/types/chatbot';
import Link from 'next/link';
import { Plus, ChatCircleDots } from '@phosphor-icons/react/dist/ssr';

export default async function ChatbotsList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  let chatbots: ChatbotWithStats[] = [];

  if (org) {
    const { data: bots } = await supabaseAdmin
      .from('chatbots')
      .select('*')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false });

    const list = bots ?? [];
    if (list.length > 0) {
      const ids = list.map((b) => b.id);

      // Source counts per chatbot
      const { data: sourceRows } = await supabaseAdmin
        .from('sources')
        .select('chatbot_id')
        .in('chatbot_id', ids);
      const sourceCountMap = new Map<string, number>();
      for (const row of sourceRows ?? []) {
        sourceCountMap.set(row.chatbot_id, (sourceCountMap.get(row.chatbot_id) ?? 0) + 1);
      }

      // Unanswered counts per chatbot
      const { data: unansRows } = await supabaseAdmin
        .from('unanswered_questions')
        .select('chatbot_id')
        .in('chatbot_id', ids)
        .is('resolved_at', null);
      const unansCountMap = new Map<string, number>();
      for (const row of unansRows ?? []) {
        unansCountMap.set(row.chatbot_id, (unansCountMap.get(row.chatbot_id) ?? 0) + 1);
      }

      chatbots = list.map((bot) => ({
        ...bot,
        sourceCount: sourceCountMap.get(bot.id) ?? 0,
        unansweredCount: unansCountMap.get(bot.id) ?? 0,
      }));
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Chatbots</h1>
          <p className="text-white/40 mt-1 text-sm">Manage your deployed AI assistants.</p>
        </div>
        <Link
          href="/dashboard/chatbots/new"
          className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          <Plus size={16} weight="bold" />
          New Chatbot
        </Link>
      </div>

      {chatbots.length === 0 ? (
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
            Create your first chatbot
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {chatbots.map((bot) => (
            <ChatbotCard key={bot.id} chatbot={bot} />
          ))}
          <Link
            href="/dashboard/chatbots/new"
            className="border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 hover:border-white/20 hover:bg-white/[0.02] transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <Plus size={20} className="text-white/40" />
            </div>
            <span className="text-sm font-medium text-white/40 group-hover:text-white/60 transition-colors">
              Create another chatbot
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
