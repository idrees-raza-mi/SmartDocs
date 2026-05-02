import { RefObject } from 'react';

export interface MotionElement {
  id: string;
  ref: RefObject<HTMLElement | SVGElement | null>;
  type?: 'logo' | 'nav' | 'search' | 'button' | 'footer' | 'default';
}

export interface GravityState {
  isAntigravityEnabled: boolean;
  isComplete: boolean;
  enableAntigravity: () => void;
  disableAntigravity: () => void;
  setComplete: (complete: boolean) => void;
}
