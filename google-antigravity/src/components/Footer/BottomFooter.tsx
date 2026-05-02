'use client';

import { MotionWrapper } from '../ui/MotionWrapper';
import { FooterLinks } from './FooterLinks';

export const BottomFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 flex flex-col">
      <div className="bg-[#f2f2f2] dark:bg-[#171717] border-t border-[#e4e4e4] dark:border-[#303134] h-[40px] flex items-center px-4 sm:px-6">
        <MotionWrapper id="footer-country" type="footer" className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6]">
          Pakistan
        </MotionWrapper>
      </div>
      <div className="bg-white dark:bg-[#171717] h-[52px]">
        <FooterLinks />
      </div>
    </footer>
  );
};
