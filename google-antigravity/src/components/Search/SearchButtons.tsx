'use client';

import { MotionWrapper } from '../ui/MotionWrapper';
import { useGravityStore } from '@/hooks/useGravityStore';

export const SearchButtons = () => {
  const enableAntigravity = useGravityStore((state) => state.enableAntigravity);

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-[8px] mt-[28px] w-[92vw] sm:w-auto mx-auto">
      <MotionWrapper id="btn-search" type="button" className="w-full sm:w-auto">
        <button 
          className="w-full sm:w-auto bg-[#f8f9fa] dark:bg-[#303134] border border-[#f8f9fa] dark:border-[#303134] rounded-[4px] h-[36px] px-4 font-product-sans text-[14px] font-medium text-[#3c4043] dark:text-[#e8eaed] hover:border-[#dadce0] dark:hover:border-[#5f6368] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:text-[#202124] dark:hover:text-white active:bg-[#f2f2f2] transition-all duration-200"
        >
          Google Search
        </button>
      </MotionWrapper>
      <MotionWrapper id="btn-lucky" type="button" className="w-full sm:w-auto">
        <button 
          className="w-full sm:w-auto bg-[#f8f9fa] dark:bg-[#303134] border border-[#f8f9fa] dark:border-[#303134] rounded-[4px] h-[36px] px-4 font-product-sans text-[14px] font-medium text-[#3c4043] dark:text-[#e8eaed] hover:border-[#dadce0] dark:hover:border-[#5f6368] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:text-[#202124] dark:hover:text-white active:bg-[#f2f2f2] transition-all duration-200"
          onClick={(e) => { e.preventDefault(); enableAntigravity(); }}
        >
          I'm Feeling Lucky
        </button>
      </MotionWrapper>
    </div>
  );
};
