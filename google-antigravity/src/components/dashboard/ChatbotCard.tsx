'use client';

import Link from 'next/link';
import { ChatbotWithStats } from '@/types/chatbot';
import { ChatCircleDots, FileText, WarningCircle, ArrowRight } from '@phosphor-icons/react';

export const ChatbotCard = ({ chatbot }: { chatbot: ChatbotWithStats }) => {
  return (
    <Link href={`/dashboard/chatbots/${chatbot.id}`} className="block group">
      <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1 shadow-lg">
        <div 
          className="absolute top-0 left-0 w-full h-[2px]" 
          style={{ backgroundColor: chatbot.accent_color }}
        />
        
        <div className="flex justify-between items-start mb-6 mt-2">
          <h3 className="text-xl font-bold text-white tracking-tight">{chatbot.name}</h3>
          <ArrowRight size={20} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6 mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-white/40 flex items-center gap-1 mb-1 font-medium uppercase tracking-wider"><ChatCircleDots size={14}/> Msgs</span>
            <span className="font-bold text-white text-lg">{chatbot.total_messages}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-white/40 flex items-center gap-1 mb-1 font-medium uppercase tracking-wider"><FileText size={14}/> Srcs</span>
            <span className="font-bold text-white text-lg">{chatbot.sourceCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-yellow-500/70 flex items-center gap-1 mb-1 font-medium uppercase tracking-wider"><WarningCircle size={14}/> Miss</span>
            <span className="font-bold text-white text-lg">{chatbot.unansweredCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
