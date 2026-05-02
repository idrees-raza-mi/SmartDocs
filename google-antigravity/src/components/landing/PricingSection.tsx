'use client';

import { CheckCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

export const PricingSection = () => {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: 'STARTER',
      price: annual ? 24 : 29,
      annualPrice: 278,
      description: 'Perfect for small websites just getting started.',
      features: ['1 chatbot', '500 messages/month', '5 sources (URLs or files)', 'CSV conversation export', 'Email support', 'SmartDocs branding shown'],
      recommended: false,
      cta: 'Get started'
    },
    {
      name: 'PRO',
      price: annual ? 63 : 79,
      annualPrice: 758,
      description: 'For growing businesses with support volume.',
      features: ['5 chatbots', '5,000 messages/month', 'Unlimited sources', 'Remove SmartDocs branding', 'Analytics dashboard', 'Priority support', 'Custom accent color'],
      recommended: true,
      cta: 'Start Pro trial'
    },
    {
      name: 'BUSINESS',
      price: annual ? 159 : 199,
      annualPrice: 1910,
      description: 'For agencies and large scale deployments.',
      features: ['Unlimited chatbots', '50,000 messages/month', 'Unlimited sources', 'White-label (your logo + domain)', 'API access', 'Dedicated support', 'Custom domain for widget'],
      recommended: false,
      cta: 'Contact sales'
    }
  ];

  return (
    <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto" id="pricing">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">Simple, transparent pricing</h2>
        <p className="text-lg text-[var(--text-secondary)] mb-8">Choose the plan that fits your needs. Cancel anytime.</p>
        
        <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button 
            className={clsx("px-6 py-2 rounded-md text-sm font-medium transition-all", !annual ? "bg-white dark:bg-gray-700 shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}
            onClick={() => setAnnual(false)}
          >
            Monthly
          </button>
          <button 
            className={clsx("px-6 py-2 rounded-md text-sm font-medium transition-all", annual ? "bg-white dark:bg-gray-700 shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}
            onClick={() => setAnnual(true)}
          >
            Annually <span className="text-[var(--success)] ml-1">-20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={clsx(
              "relative bg-white dark:bg-[var(--surface)] rounded-2xl p-8 border transition-all duration-200 hover:-translate-y-2 hover:shadow-xl",
              plan.recommended ? "border-[var(--brand)] shadow-lg ring-1 ring-[var(--brand)]" : "border-[var(--border)] shadow-sm"
            )}
          >
            {plan.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--brand)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Recommended
              </div>
            )}
            <h3 className="text-sm font-bold text-[var(--text-secondary)] tracking-wider mb-4">{plan.name}</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-[var(--text-primary)]">${plan.price}</span>
              <span className="text-[var(--text-secondary)] font-medium">/mo</span>
            </div>
            {annual && <div className="text-sm text-[var(--success)] font-medium mb-6">${plan.annualPrice}/yr, save ${Math.floor((plan.price / 0.8 * 12) - plan.annualPrice)}</div>}
            {!annual && <div className="text-sm text-transparent mb-6">Spacer</div>}
            
            <p className="text-[var(--text-secondary)] text-sm mb-8 h-10">{plan.description}</p>
            
            <Link 
              href="/auth/signup" 
              className={clsx(
                "block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all active:scale-95 mb-8",
                plan.recommended 
                  ? "bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]" 
                  : "bg-[var(--brand-light)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white"
              )}
            >
              {plan.cta}
            </Link>

            <ul className="space-y-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="text-[var(--success)] shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--text-primary)]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
