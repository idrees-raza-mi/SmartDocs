'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Robot, UploadSimple, Code, ArrowRight } from '@phosphor-icons/react';
import clsx from 'clsx';

export default function NewChatbotWizard() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--border)] -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--brand)] -z-10 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[
            { num: 1, label: 'Name', icon: Robot },
            { num: 2, label: 'Train', icon: UploadSimple },
            { num: 3, label: 'Embed', icon: Code }
          ].map(s => {
            const Icon = s.icon;
            const active = step >= s.num;
            return (
              <div key={s.num} className="flex flex-col items-center gap-2">
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors",
                  active ? "bg-[var(--brand)] border-[var(--brand)] text-white" : "bg-white dark:bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]"
                )}>
                  <Icon size={20} />
                </div>
                <span className={clsx("text-sm font-medium", active ? "text-[var(--brand)]" : "text-[var(--text-muted)]")}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
        {step === 1 && (
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-8 border-r border-[var(--border)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Name your chatbot</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Chatbot Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-transparent" placeholder="e.g. Support Bot" defaultValue="My Chatbot" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Welcome Message</label>
                  <textarea rows={3} className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-transparent" defaultValue="Hi! How can I help you today?" />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand-hover)] transition-colors"
                >
                  Continue <ArrowRight weight="bold" />
                </button>
              </div>
            </div>
            <div className="w-full md:w-80 bg-[var(--background)] p-8 flex items-center justify-center">
              <div className="w-full h-80 bg-white dark:bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] flex flex-col overflow-hidden">
                <div className="h-12 bg-[var(--brand)] text-white px-4 flex items-center font-medium">My Chatbot</div>
                <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900/50">
                  <div className="bg-white dark:bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl rounded-tl-none text-sm w-[85%]">Hi! How can I help you today?</div>
                </div>
                <div className="p-3 border-t border-[var(--border)]">
                  <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Add your first source</h2>
            <p className="text-[var(--text-secondary)] mb-8">Upload a document or paste a URL to train your AI.</p>
            
            <div className="border border-[var(--border)] rounded-xl overflow-hidden mb-8">
              <div className="flex border-b border-[var(--border)] bg-gray-50 dark:bg-gray-800/50">
                <button className="flex-1 py-3 text-sm font-medium border-b-2 border-[var(--brand)] text-[var(--brand)]">Website URL</button>
                <button className="flex-1 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Upload PDF/Docx</button>
                <button className="flex-1 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Raw Text</button>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">URL to Scrape</label>
                <div className="flex gap-2">
                  <input type="url" className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-transparent" placeholder="https://example.com/docs" />
                  <button className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-black rounded-lg font-medium">Fetch</button>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2 text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]">Back</button>
              <button 
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand-hover)] transition-colors"
              >
                Skip for now <ArrowRight weight="bold" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[var(--success)] text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Code size={32} weight="bold" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">You're all set!</h2>
            <p className="text-[var(--text-secondary)] mb-8">Copy the code below and paste it before the closing &lt;/body&gt; tag on your website.</p>
            
            <div className="bg-[#1e1e1e] rounded-xl p-4 text-left overflow-x-auto mb-8 font-mono text-sm text-[#d4d4d4]">
              <pre>
                <code>
{`<script 
  src="https://smartdocs.app/widget.js" 
  data-chatbot-id="your-chatbot-id-here" 
  defer
></script>`}
                </code>
              </pre>
            </div>

            <div className="flex justify-center gap-4">
              <button className="px-6 py-2 bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-lg font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800">Copy Code</button>
              <button onClick={() => router.push('/dashboard/chatbots/1')} className="px-6 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand-hover)] transition-colors">Go to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
