import { create } from 'zustand';
import { MotionElement } from '@/types/gravity';

interface RegistryState {
  elements: Map<string, MotionElement>;
  registerElement: (element: MotionElement) => void;
  unregisterElement: (id: string) => void;
  getElements: () => MotionElement[];
}

export const useElementRegistry = create<RegistryState>((set, get) => ({
  elements: new Map(),
  registerElement: (element) => {
    set((state) => {
      const newMap = new Map(state.elements);
      newMap.set(element.id, element);
      return { elements: newMap };
    });
  },
  unregisterElement: (id) => {
    set((state) => {
      const newMap = new Map(state.elements);
      newMap.delete(id);
      return { elements: newMap };
    });
  },
  getElements: () => Array.from(get().elements.values()),
}));
