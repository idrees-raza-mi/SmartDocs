'use client';

import { MotionWrapper } from '../ui/MotionWrapper';

export const LanguageSelector = () => {
  const languages = ['Español', 'Français', 'Deutsch', 'हिन्दी', 'اردو'];

  return (
    <div className="flex justify-center flex-wrap gap-2 mt-[28px] text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">
      <MotionWrapper id="lang-text" type="default" as="span">
        Google offered in:{' '}
      </MotionWrapper>
      {languages.map((lang, idx) => (
        <MotionWrapper key={lang} id={`lang-${idx}`} type="default" as="span">
          <a href="#" className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline ml-1">
            {lang}
          </a>
        </MotionWrapper>
      ))}
    </div>
  );
};
