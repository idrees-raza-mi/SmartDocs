import { create } from 'zustand';
import { GravityState } from '@/types/gravity';

export const useGravityStore = create<GravityState>((set) => ({
  isAntigravityEnabled: false,
  isComplete: false,
  enableAntigravity: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('antigravity', 'true');
    }
    set({ isAntigravityEnabled: true, isComplete: false });
  },
  disableAntigravity: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('antigravity');
    }
    set({ isAntigravityEnabled: false, isComplete: false });
  },
  setComplete: (complete) => set({ isComplete: complete }),
}));
