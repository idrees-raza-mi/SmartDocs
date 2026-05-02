'use client';

import { Copy, Check } from '@phosphor-icons/react';
import { useState } from 'react';

export default function EmbedTab() {
  const [copied, setCopied] = useState(false);
  const [color, setColor] = useState('#4f46e5');

  const snippet = `<script 
  src="https://smartdocs.app/widget.js" 
  data-chatbot-id="your-chatbot-id-here" 
  defer
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-8">
        <div className="bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-[var(--text-primary)] mb-2">Embed Code</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Paste this snippet just before the closing <code>&lt;/body&gt;</code> tag of your website.</p>
          
          <div className="relative">
            <div className="bg-[#1e1e1e] rounded-xl p-4 text-left overflow-x-auto font-mono text-sm text-[#d4d4d4]">
              <pre><code>{snippet}</code></pre>
            </div>
            <button 
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-[var(--text-primary)] mb-6">Widget Settings</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Accent Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-10 rounded border border-[var(--border)] cursor-pointer"
                />
                <input 
                  type="text" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="px-3 py-2 border border-[var(--border)] rounded-lg text-sm w-28 uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Allowed Domains</label>
              <textarea 
                rows={3}
                placeholder="example.com&#10;app.example.com"
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] text-sm"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">Leave blank to allow on any domain. Put each domain on a new line.</p>
            </div>
            
            <button className="px-6 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand-hover)] transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      </div>

      <div className="lg:w-[400px]">
        <div className="bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm h-[600px] relative overflow-hidden flex flex-col">
          <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-[var(--border)] flex items-center px-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
          </div>
          <div className="p-8 flex-1 opacity-50 select-none">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/3 rounded mb-8"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 w-3/4 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 w-full rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 w-5/6 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 w-full rounded mb-2"></div>
          </div>

          <div className="absolute bottom-6 right-6 flex flex-col items-end gap-4 shadow-2xl">
            <div className="w-[320px] bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden flex flex-col">
              <div className="h-14 px-4 flex items-center font-semibold text-white" style={{ backgroundColor: color }}>
                Customer Support Bot
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-[200px]">
                <div className="bg-white dark:bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl rounded-tl-none text-sm w-[85%] text-[var(--text-primary)]">
                  Hi! How can I help you today?
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
