import { useEffect } from 'react';
import { animate } from 'framer-motion';
import { useGravityStore } from '@/hooks/useGravityStore';
import { useElementRegistry } from '@/hooks/useElementRegistry';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playWhoosh } from '@/lib/sound';
import { calculatePhysicsParams, EASE_CUBIC_BEZIER } from '@/lib/physics';

export const useAntigravity = () => {
  const { isAntigravityEnabled, enableAntigravity, setComplete, disableAntigravity } = useGravityStore();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isAntigravityEnabled) return;

    playWhoosh();

    const animateElements = async () => {
      const elements = useElementRegistry.getState().getElements();
      
      if (reducedMotion) {
        elements.forEach(({ ref }) => {
          if (ref.current) {
            animate(ref.current, { opacity: 0 }, { duration: 0.5 });
          }
        });
        setTimeout(() => setComplete(true), 500);
        return;
      }

      elements.forEach(({ ref, type }) => {
        if (!ref.current) return;
        const { delay, yTarget, xTarget, rotation, scale } = calculatePhysicsParams(type);
        
        animate(
          ref.current,
          {
            y: yTarget,
            x: xTarget,
            rotate: rotation,
            scale: scale,
            opacity: [1, 1, 0],
          } as never,
          {
            duration: 2.4,
            delay: delay,
            ease: EASE_CUBIC_BEZIER,
            opacity: { times: [0, 0.7, 1], duration: 2.4, delay },
          } as never,
        );
      });

      setTimeout(() => {
        setComplete(true);
      }, 2500);
    };

    animateElements();

  }, [isAntigravityEnabled, reducedMotion, setComplete]);

  useEffect(() => {
    if (!isAntigravityEnabled) {
      const elements = useElementRegistry.getState().getElements();
      elements.forEach(({ ref }) => {
        if (ref.current) {
          animate(ref.current, { 
            y: 0, 
            x: 0, 
            rotate: 0, 
            scale: 1, 
            opacity: 1 
          }, { duration: 0 });
        }
      });
    }
  }, [isAntigravityEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAntigravityEnabled) {
        disableAntigravity();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAntigravityEnabled, disableAntigravity]);
};
