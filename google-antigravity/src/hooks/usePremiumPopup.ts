import { create } from 'zustand';

interface PremiumPopupState {
  isOpen: boolean;
  featureName: string;
  requiredPlan: string;
  show: (featureName: string, requiredPlan: string) => void;
  hide: () => void;
}

export const usePremiumPopup = create<PremiumPopupState>((set) => ({
  isOpen: false,
  featureName: '',
  requiredPlan: '',
  show: (featureName, requiredPlan) => set({ isOpen: true, featureName, requiredPlan }),
  hide: () => set({ isOpen: false, featureName: '', requiredPlan: '' }),
}));
