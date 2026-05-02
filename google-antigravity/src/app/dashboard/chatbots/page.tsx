import { ChatbotCard } from '@/components/dashboard/ChatbotCard';
import { ChatbotWithStats } from '@/types/chatbot';
import Link from 'next/link';
import { Plus } from '@phosphor-icons/react/dist/ssr';

export default function ChatbotsList() {
  const mockChatbots: ChatbotWithStats[] = [
    {
      id: '1', org_id: '1', name: 'Customer Support Bot', system_prompt: '',
      accent_color: '#4f46e5', welcome_message: 'Hi!', placeholder_text: 'Ask...',
      show_branding: true, allowed_domains: null, total_messages: 1240,
      created_at: new Date().toISOString(), sourceCount: 12, unansweredCount: 4
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Chatbots</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your deployed AI assistants.</p>
        </div>
        <Link 
          href="/dashboard/chatbots/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} weight="bold" />
          New Chatbot
        </Link>
      </div>

      {mockChatbots.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl border-dashed">
          <div className="w-16 h-16 bg-[var(--brand-light)] text-[var(--brand)] rounded-full flex items-center justify-center mb-4">
            <Plus size={32} />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No chatbots yet</h3>
          <p className="text-[var(--text-secondary)] text-center max-w-md mb-6">Create your first chatbot, train it on your documentation, and embed it on your website.</p>
          <Link 
            href="/dashboard/chatbots/new"
            className="px-6 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand-hover)] transition-colors"
          >
            Create Chatbot
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockChatbots.map(bot => (
            <ChatbotCard key={bot.id} chatbot={bot} />
          ))}
        </div>
      )}
    </div>
  );
}
