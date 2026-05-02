'use client';

import { MotionWrapper } from '../ui/MotionWrapper';
import { ReactNode } from 'react';

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
}

export const NavItem = ({ id, children, className = '' }: Props) => {
  return (
    <MotionWrapper id={id} type="nav" className={`inline-block ${className}`}>
      {children}
    </MotionWrapper>
  );
};
