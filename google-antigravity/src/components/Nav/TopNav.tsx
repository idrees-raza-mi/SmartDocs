'use client';

import { NavItem } from './NavItem';
import { GridFour, BellSimple, UserCircle } from '@phosphor-icons/react';
import { ThemeToggle } from '../ui/ThemeToggle';
import Link from 'next/link';

export const TopNav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-white/5 dark:bg-[#202124]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4 hidden sm:flex">
        <NavItem id="nav-about">
          <Link href="#" className="text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline">About</Link>
        </NavItem>
        <NavItem id="nav-store">
          <Link href="#" className="text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline">Store</Link>
        </NavItem>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <div className="hidden sm:flex items-center gap-4 mr-2">
          <NavItem id="nav-gmail">
            <Link href="#" className="text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline">Gmail</Link>
          </NavItem>
          <NavItem id="nav-images">
            <Link href="#" className="text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline">Images</Link>
          </NavItem>
        </div>
        
        <ThemeToggle />

        <NavItem id="nav-apps">
          <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" aria-label="Google apps">
            <GridFour size={22} weight="bold" className="text-[var(--text-secondary)]" />
          </button>
        </NavItem>
        
        <NavItem id="nav-bell">
          <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" aria-label="Notifications">
            <BellSimple size={22} weight="bold" className="text-[var(--text-secondary)]" />
          </button>
        </NavItem>
        
        <NavItem id="nav-signin">
          <button className="bg-[#1a73e8] hover:bg-[#1b66c9] hover:shadow-md transition-all text-white font-medium text-[14px] h-[36px] px-6 rounded-[4px]">
            Sign In
          </button>
        </NavItem>
      </div>
    </nav>
  );
};
