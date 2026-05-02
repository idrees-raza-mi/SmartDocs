import { StatsCard } from '@/components/dashboard/StatsCard';
import { ChatbotCard } from '@/components/dashboard/ChatbotCard';
import { ChatbotWithStats } from '@/types/chatbot';
import { ChatCircleDots, FileText, Users, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export default function DashboardOverview() {
  const mockChatbots: ChatbotWithStats[] = [
    {
      id: '1', org_id: '1', name: 'Customer Support Bot', system_prompt: '',
      accent_color: '#4f46e5', welcome_message: 'Hi!', placeholder_text: 'Ask...',
      show_branding: true, allowed_domains: null, total_messages: 1240,
      created_at: new Date().toISOString(), sourceCount: 12, unansweredCount: 4
    },
    {
      id: '2', org_id: '1', name: 'Internal HR Bot', system_prompt: '',
      accent_color: '#16a34a', welcome_message: 'Hi!', placeholder_text: 'Ask...',
      show_branding: true, allowed_domains: null, total_messages: 320,
      created_at: new Date().toISOString(), sourceCount: 3, unansweredCount: 0
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard title="Total Chatbots" value={2} icon={<ChatCircleDots size={24} />} />
        <StatsCard title="Messages This Month" value="1,560" trend={12} icon={<Users size={24} />} />
        <StatsCard title="Sources Indexed" value={15} trend={5} icon={<FileText size={24} />} />
        <StatsCard title="Unanswered Questions" value={4} trend={-2} icon={<WarningCircle size={24} />} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Your Chatbots</h2>
          <Link 
            href="/dashboard/chatbots/new"
            className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create Chatbot
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockChatbots.map(bot => (
            <ChatbotCard key={bot.id} chatbot={bot} />
          ))}
        </div>
      </div>
    </div>
  );
}
