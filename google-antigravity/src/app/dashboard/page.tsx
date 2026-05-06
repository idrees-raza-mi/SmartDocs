import { StatsCard } from '@/components/dashboard/StatsCard';
import { ChatbotCard } from '@/components/dashboard/ChatbotCard';
import { ChatbotWithStats } from '@/types/chatbot';
import { ChatCircleDots, FileText, Users, WarningCircle, Plus, ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export default function DashboardOverview() {
  const mockChatbots: ChatbotWithStats[] = [
    {
      id: '1', org_id: '1', name: 'Customer Support Bot', system_prompt: '',
      accent_color: '#ffffff', welcome_message: 'Hi!', placeholder_text: 'Ask...',
      show_branding: true, allowed_domains: null, total_messages: 1240,
      created_at: new Date().toISOString(), sourceCount: 12, unansweredCount: 4
    },
    {
      id: '2', org_id: '1', name: 'Internal HR Bot', system_prompt: '',
      accent_color: '#10b981', welcome_message: 'Hi!', placeholder_text: 'Ask...',
      show_branding: true, allowed_domains: null, total_messages: 320,
      created_at: new Date().toISOString(), sourceCount: 3, unansweredCount: 0
    }
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Chatbots" value={2} icon={<ChatCircleDots size={20} />} />
        <StatsCard title="Messages This Month" value="1,560" trend={12} icon={<Users size={20} />} />
        <StatsCard title="Sources Indexed" value={15} trend={5} icon={<FileText size={20} />} />
        <StatsCard title="Unanswered" value={4} trend={-2} icon={<WarningCircle size={20} />} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-6 tracking-tight">Messages (Last 7 days)</h2>
          <div className="flex items-end gap-2 h-32">
            {[40, 75, 55, 90, 65, 110, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-white/10 rounded-sm hover:bg-white/20 transition-colors"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-white/30 font-mono">
                  {['M','T','W','T','F','S','S'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col">
          <h2 className="text-base font-bold text-white mb-6 tracking-tight">Top Topics</h2>
          <div className="space-y-4 flex-1">
            {[
              { label: 'Pricing', pct: 38 },
              { label: 'Refunds', pct: 27 },
              { label: 'Shipping', pct: 20 },
              { label: 'Setup', pct: 15 },
            ].map(t => (
              <div key={t.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70 font-medium">{t.label}</span>
                  <span className="text-white/40">{t.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white/40 rounded-full" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockChatbots.map(bot => (
            <ChatbotCard key={bot.id} chatbot={bot} />
          ))}
          {/* Empty slot CTA */}
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
      </div>

      {/* Unanswered Questions */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white tracking-tight">Unanswered Questions</h2>
          <span className="text-xs text-white/40 font-medium">Last 30 days</span>
        </div>
        <div className="space-y-3">
          {[
            { q: 'Do you offer on-premise hosting?', count: 12 },
            { q: 'Can I pay via wire transfer?', count: 8 },
            { q: 'Is there an enterprise SLA?', count: 6 },
          ].map((item) => (
            <div key={item.q} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <span className="text-sm text-white/80 font-medium">{item.q}</span>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-xs text-white/30 font-mono">×{item.count}</span>
                <ArrowUpRight size={16} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
