// Tiny event-bus based toast system. Renders via <ToastContainer /> mounted in
// the root layout. No dependency — sonner-style behavior in ~50 lines.

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';
export type ToastItem = { id: string; message: string; variant: ToastVariant };

type Listener = (toasts: ToastItem[]) => void;

const listeners = new Set<Listener>();
let current: ToastItem[] = [];

function notify() {
  for (const l of listeners) l(current);
}

function push(message: string, variant: ToastVariant) {
  const id = Math.random().toString(36).slice(2);
  current = [...current, { id, message, variant }];
  notify();
  setTimeout(() => dismiss(id), 4000);
}

export function dismiss(id: string) {
  current = current.filter((t) => t.id !== id);
  notify();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}

export const toast = {
  success: (m: string) => push(m, 'success'),
  error: (m: string) => push(m, 'error'),
  info: (m: string) => push(m, 'info'),
  warning: (m: string) => push(m, 'warning'),
};
