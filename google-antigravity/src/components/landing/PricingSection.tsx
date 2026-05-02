'use client';

import { CheckCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export const PricingSection = () => {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: 'STARTER',
      price: annual ? 24 : 29,
      description: 'Perfect for small websites just getting started.',
      features: ['1 chatbot', '500 messages/month', '5 sources (URLs or files)', 'CSV conversation export', 'Email support', 'SmartDocs branding shown'],
      recommended: false,
      cta: 'Get started'
    },
    {
      name: 'PRO',
      price: annual ? 63 : 79,
      description: 'For growing businesses with support volume.',
      features: ['5 chatbots', '5,000 messages/month', 'Unlimited sources', 'Remove SmartDocs branding', 'Analytics dashboard', 'Priority support', 'Custom accent color'],
      recommended: true,
      cta: 'Start Pro trial'
    },
    {
      name: 'BUSINESS',
      price: annual ? 159 : 199,
      description: 'For agencies and large scale deployments.',
      features: ['Unlimited chatbots', '50,000 messages/month', 'Unlimited sources', 'White-label (your logo + domain)', 'API access', 'Dedicated support', 'Custom domain for widget'],
      recommended: false,
      cta: 'Contact sales'
    }
  ];

  return (
    <section className="py-32 px-6 sm:px-12 max-w-7xl mx-auto border-b border-white/5" id="pricing">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Predictable pricing.</h2>
        <p className="text-xl text-white/50 mb-8 max-w-2xl mx-auto">Scale your support intelligently without hidden fees.</p>
        
        <div className="inline-flex items-center bg-white/5 border border-white/10 p-1 rounded-lg backdrop-blur-md">
          <button 
            className={clsx("px-6 py-2 rounded-md text-sm font-medium transition-all", !annual ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white")}
            onClick={() => setAnnual(false)}
          >
            Monthly
          </button>
          <button 
            className={clsx("px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2", annual ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white")}
            onClick={() => setAnnual(true)}
          >
            Annually <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {plans.map((plan, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            key={plan.name} 
            className={clsx(
              "relative bg-[#0a0a0a] rounded-2xl p-8 border transition-all duration-300",
              plan.recommended ? "border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.05)] -translate-y-2" : "border-white/10"
            )}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
            )}
            <h3 className="text-sm font-bold text-white/50 tracking-wider mb-4">{plan.name}</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-white tracking-tighter">${plan.price}</span>
              <span className="text-white/50 font-medium">/mo</span>
            </div>
            
            <p className="text-white/50 text-sm mb-8 h-10">{plan.description}</p>
            
            <Link 
              href="/auth/signup" 
              className={clsx(
                "block w-full text-center py-3 px-4 rounded-lg font-bold transition-all active:scale-95 mb-8 text-sm",
                plan.recommended 
                  ? "bg-white text-black hover:bg-gray-200" 
                  : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
              )}
            >
              {plan.cta}
            </Link>

            <ul className="space-y-4">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="text-white/30 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/80">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
