'use client';

import { usePremiumPopup } from '@/hooks/usePremiumPopup';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function PremiumPopup() {
  const { isOpen, featureName, requiredPlan, hide } = usePremiumPopup();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={hide}
        >
          <motion.div
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">✦</div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Premium Feature</h3>
            <p className="text-sm text-white/60 mb-8">
              {featureName} is available on the {requiredPlan} plan.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/billing"
                onClick={hide}
                className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors text-sm"
              >
                Upgrade Now
              </Link>
              <button
                onClick={hide}
                className="w-full py-3 text-white/50 font-bold hover:text-white transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
