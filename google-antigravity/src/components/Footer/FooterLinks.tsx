'use client';

import { MotionWrapper } from '../ui/MotionWrapper';
import { Gear } from '@phosphor-icons/react';

export const FooterLinks = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 h-full text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">
      <div className="flex gap-6 hidden sm:flex">
        <MotionWrapper id="footer-ad" type="footer" as="a" href="#" className="hover:underline">Advertising</MotionWrapper>
        <MotionWrapper id="footer-business" type="footer" as="a" href="#" className="hover:underline">Business</MotionWrapper>
        <MotionWrapper id="footer-how" type="footer" as="a" href="#" className="hover:underline">How Search works</MotionWrapper>
      </div>
      <div className="flex gap-6 items-center w-full sm:w-auto justify-evenly sm:justify-start">
        <MotionWrapper id="footer-privacy" type="footer" as="a" href="#" className="hover:underline">Privacy</MotionWrapper>
        <MotionWrapper id="footer-terms" type="footer" as="a" href="#" className="hover:underline">Terms</MotionWrapper>
        <MotionWrapper id="footer-settings" type="footer" as="a" href="#" className="hover:underline flex items-center gap-1">
          <Gear size={14} weight="bold" /> Settings
        </MotionWrapper>
      </div>
    </div>
  );
};
