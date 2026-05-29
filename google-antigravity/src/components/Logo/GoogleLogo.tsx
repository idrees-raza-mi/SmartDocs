'use client';

import { useGravityStore } from '@/hooks/useGravityStore';
import { CONSTANTS } from '@/lib/constants';
import { useLogo } from './useLogo';
import { MotionWrapper } from '../ui/MotionWrapper';

export const GoogleLogo = () => {
  const isAntigravityEnabled = useGravityStore((state) => state.isAntigravityEnabled);
  const { staggerDelay, idleAnimation } = useLogo();

  const letters = [
    { id: 'logo-G', letter: 'G', color: CONSTANTS.LOGOTYPE_COLORS.G, width: '60px' },
    { id: 'logo-o1', letter: 'o', color: CONSTANTS.LOGOTYPE_COLORS.o1, width: '40px' },
    { id: 'logo-o2', letter: 'o', color: CONSTANTS.LOGOTYPE_COLORS.o2, width: '40px' },
    { id: 'logo-g', letter: 'g', color: CONSTANTS.LOGOTYPE_COLORS.g, width: '40px' },
    { id: 'logo-l', letter: 'l', color: CONSTANTS.LOGOTYPE_COLORS.l, width: '16px' },
    { id: 'logo-e', letter: 'e', color: CONSTANTS.LOGOTYPE_COLORS.e, width: '40px' },
  ];

  return (
    <div className="flex items-end justify-center h-[92px] sm:h-[110px] w-[192px] sm:w-[272px] mb-8 select-none relative">
      {letters.map((l, i) => (
        <MotionWrapper
          key={l.id}
          id={l.id}
          type="logo"
          as="span"
          initial={{ y: 0 }}
          animate={!isAntigravityEnabled ? ({ ...idleAnimation, transition: { ...idleAnimation.transition, delay: i * staggerDelay } } as never) : {}}
          className="font-product-sans font-bold text-[72px] sm:text-[90px] leading-none drop-shadow-none dark:drop-shadow-[0_0_8px_currentColor]"
          style={{ color: l.color, width: l.width, textAlign: 'center' }}
        >
          {l.letter}
        </MotionWrapper>
      ))}
    </div>
  );
};
