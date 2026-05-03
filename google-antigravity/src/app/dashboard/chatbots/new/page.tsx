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
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/10 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] -z-10 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[
            { num: 1, label: 'Name', icon: Robot },
            { num: 2, label: 'Train', icon: UploadSimple },
            { num: 3, label: 'Embed', icon: Code }
          ].map(s => {
            const Icon = s.icon;
            const active = step >= s.num;
            return (
              <div key={s.num} className="flex flex-col items-center gap-3">
                <div className={clsx(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300",
                  active ? "bg-black border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "bg-[#0a0a0a] border-white/10 text-white/30"
                )}>
                  <Icon size={24} weight={active ? "fill" : "regular"} />
                </div>
                <span className={clsx("text-sm font-bold uppercase tracking-wider", active ? "text-white" : "text-white/30")}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {step === 1 && (
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-10 border-r border-white/5">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-8">Name your AI agent</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Chatbot Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm" placeholder="e.g. Support Bot" defaultValue="My Chatbot" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Welcome Message</label>
                  <textarea rows={3} className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm resize-none" defaultValue="Hi! How can I help you today?" />
                </div>
              </div>
              <div className="mt-10 flex justify-end">
                <button 
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                >
                  Continue <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            <div className="w-full md:w-96 bg-black p-10 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-blue-500/5 blur-[50px]"></div>
              <div className="w-full bg-[#0a0a0a] rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden relative z-10">
                <div className="h-14 bg-white/5 border-b border-white/10 text-white px-4 flex items-center font-bold tracking-tight">My Chatbot</div>
                <div className="flex-1 p-5 bg-[#050505] min-h-[250px]">
                  <div className="bg-white/[0.05] border border-white/10 p-3 rounded-xl rounded-tl-sm text-sm w-[85%] text-white">Hi! How can I help you today?</div>
                </div>
                <div className="p-4 border-t border-white/10 bg-[#050505]">
                  <div className="h-10 bg-white/5 border border-white/10 rounded-lg w-full flex items-center px-3">
                    <div className="w-4 h-4 bg-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-10">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Connect Knowledge</h2>
            <p className="text-white/50 mb-10 text-lg">Upload your documentation so the AI knows how to answer.</p>
            
            <div className="border border-white/10 rounded-xl overflow-hidden mb-10 bg-black">
              <div className="flex border-b border-white/10 bg-white/[0.02]">
                <button className="flex-1 py-4 text-sm font-bold border-b-2 border-white text-white tracking-wide">Website URL</button>
                <button className="flex-1 py-4 text-sm font-bold text-white/40 hover:text-white transition-colors tracking-wide">Upload PDF</button>
                <button className="flex-1 py-4 text-sm font-bold text-white/40 hover:text-white transition-colors tracking-wide">Raw Text</button>
              </div>
              <div className="p-8">
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-3">URL to Scrape</label>
                <div className="flex gap-3">
                  <input type="url" className="flex-1 px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm" placeholder="https://example.com/docs" />
                  <button className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors">Sync</button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(1)} className="px-6 py-3 text-white/50 font-bold hover:text-white transition-colors">Back</button>
              <button 
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-8 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-bold hover:bg-white/20 transition-colors group"
              >
                Skip for now <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
              <Code size={40} weight="duotone" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-3">Agent Deployed</h2>
            <p className="text-white/50 mb-10 text-lg">Copy the code below and paste it before the closing &lt;/body&gt; tag on your website.</p>
            
            <div className="bg-black border border-white/10 rounded-xl p-6 text-left overflow-x-auto mb-10 font-mono text-sm shadow-inner relative group">
              <div className="text-white/30 mb-2">// Place this script anywhere on your website</div>
              <div className="text-blue-400">&lt;script</div>
              <div className="pl-4 text-blue-300">src=<span className="text-green-300">"https://smartdocs.app/widget.js"</span></div>
              <div className="pl-4 text-blue-300">data-chatbot-id=<span className="text-green-300">"your-chatbot-id-here"</span></div>
              <div className="pl-4 text-blue-300">defer</div>
              <div className="text-blue-400">&gt;&lt;/script&gt;</div>
            </div>

            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-bold hover:bg-white/20 transition-colors">Copy Snippet</button>
              <button onClick={() => router.push('/dashboard/chatbots/1')} className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">Go to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
