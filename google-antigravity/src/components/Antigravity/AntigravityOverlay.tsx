'use client';

import { useGravityStore } from '@/hooks/useGravityStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowsOutCardinal } from '@phosphor-icons/react';

export const AntigravityOverlay = () => {
  const isComplete = useGravityStore((state) => state.isComplete);
  const disableAntigravity = useGravityStore((state) => state.disableAntigravity);

  return (
    <AnimatePresence>
      {isComplete && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a1a]"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-white mb-6"
          >
            <ArrowsOutCardinal size={64} weight="duotone" />
          </motion.div>
          <h1 className="text-white text-[32px] sm:text-[48px] font-product-sans font-light tracking-[0.3em] text-center px-4 mb-12">
            ANTIGRAVITY MODE
          </h1>
          <button 
            onClick={disableAntigravity}
            className="border-2 border-white text-white rounded-[24px] px-8 py-3 text-[16px] font-medium hover:bg-white hover:text-black transition-colors duration-300"
          >
            Restore gravity
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
