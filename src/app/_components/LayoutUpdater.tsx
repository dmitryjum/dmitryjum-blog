'use client';
import { useEffect, ReactNode } from 'react';
import { useLayoutContext } from '@/app/context/LayoutContext';

type LayoutUpdaterProps = {
  children: ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  logo?: string;
  navLinks: { href: string; label: string }[];
}

export function LayoutUpdater({ children, headerTitle, headerSubtitle, logo, navLinks }: LayoutUpdaterProps) {
  const { setHeaderTitle, setHeaderSubtitle, setNavLinks, setLogo } = useLayoutContext();

  useEffect(() => {
    if (logo) setLogo(logo || '');
    if (headerTitle) setHeaderTitle(headerTitle || '');
    if (headerSubtitle) setHeaderSubtitle(headerSubtitle || '');
    setNavLinks(navLinks);
  }, [headerTitle, headerSubtitle, navLinks, setHeaderTitle, setHeaderSubtitle, setNavLinks]);

  return <>{children}</>;
}