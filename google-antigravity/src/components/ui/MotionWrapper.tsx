'use client';

import { useRef, useEffect } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useElementRegistry } from '@/hooks/useElementRegistry';
import { MotionElement } from '@/types/gravity';

interface Props extends Omit<HTMLMotionProps<"div">, 'children'> {
  id: string;
  type?: MotionElement['type'];
  as?: React.ElementType;
  href?: string;
  children?: React.ReactNode;
}

export const MotionWrapper = ({ id, type = 'default', as = 'div', children, ...props }: Props) => {
  const ref = useRef<HTMLElement>(null);
  const registerElement = useElementRegistry((state) => state.registerElement);
  const unregisterElement = useElementRegistry((state) => state.unregisterElement);

  useEffect(() => {
    if (ref.current) {
      registerElement({ id, ref, type });
    }
    return () => unregisterElement(id);
  }, [id, type, registerElement, unregisterElement]);

  const Component = motion[as as keyof typeof motion] as any;

  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
};
