'use client';

import Link from 'next/link';
import { ChatbotWithStats } from '@/types/chatbot';
import { ChatCircleDots, FileText, WarningCircle, ArrowRight } from '@phosphor-icons/react';

export const ChatbotCard = ({ chatbot }: { chatbot: ChatbotWithStats }) => {
  return (
    <Link href={`/dashboard/chatbots/${chatbot.id}`} className="block group">
      <div className="bg-white dark:bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm group-hover:shadow-md group-hover:border-[var(--brand)] transition-all duration-200 relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-1 h-full" 
          style={{ backgroundColor: chatbot.accent_color }}
        />
        
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">{chatbot.name}</h3>
          <ArrowRight size={20} className="text-[var(--text-muted)] group-hover:text-[var(--brand)] group-hover:translate-x-1 transition-all" />
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-4 mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mb-1"><ChatCircleDots size={14}/> Messages</span>
            <span className="font-medium text-[var(--text-primary)]">{chatbot.total_messages}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mb-1"><FileText size={14}/> Sources</span>
            <span className="font-medium text-[var(--text-primary)]">{chatbot.sourceCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[var(--warning)] flex items-center gap-1 mb-1"><WarningCircle size={14}/> Unanswered</span>
            <span className="font-medium text-[var(--text-primary)]">{chatbot.unansweredCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
