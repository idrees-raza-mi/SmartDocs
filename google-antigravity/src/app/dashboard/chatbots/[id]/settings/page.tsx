'use client';

import { WarningCircle } from '@phosphor-icons/react';

export default function SettingsTab() {
  return (
    <div className="max-w-2xl space-y-8">
      <div className="bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-[var(--text-primary)] mb-6">General</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Chatbot Name</label>
            <input 
              type="text" 
              defaultValue="Customer Support Bot"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Welcome Message</label>
            <input 
              type="text" 
              defaultValue="Hi! How can I help you today?"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Input Placeholder</label>
            <input 
              type="text" 
              defaultValue="Ask me anything..."
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] text-sm"
            />
          </div>
          <button className="px-6 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand-hover)] transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-[var(--text-primary)] mb-6">AI Personality</h3>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">System Prompt Instructions</label>
          <textarea 
            rows={4}
            placeholder="E.g. You are a cheerful customer support rep. Always use emojis."
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] text-sm mb-4"
          />
          <button className="px-6 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand-hover)] transition-colors">
            Update AI
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">Remove Branding <span className="text-amber-600/80 text-xs">✦</span></h3>
          <p className="text-sm text-[var(--text-secondary)]">Hide the "Powered by DocWise" badge on your widget.</p>
        </div>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-[var(--text-secondary)] rounded-lg text-sm font-medium cursor-not-allowed">
          Pro Plan Required
        </button>
      </div>

      <div className="border border-red-200 dark:border-red-900/50 rounded-xl p-6 bg-red-50 dark:bg-red-900/10">
        <h3 className="font-bold text-red-600 dark:text-red-400 mb-1 flex items-center gap-2">
          <WarningCircle size={20} weight="fill" /> Danger Zone
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">Deleting this chatbot will permanently remove all of its sources, chunks, and conversation history. This action cannot be undone.</p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
          Delete Chatbot
        </button>
      </div>
    </div>
  );
}
