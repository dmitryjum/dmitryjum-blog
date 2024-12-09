'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
type LayoutContextType = {
  headerTitle: string;
  headerSubtitle?: string;
  logo?: string;
  navLinks: { href: string; label: string }[];
  setHeaderTitle: (title: string) => void;
  setHeaderSubtitle: (subtitle: string) => void;
  setNavLinks: (links: { href: string; label: string }[]) => void;
  setLogo: (logo: string) => void;
};

const LayoutContext = createContext<LayoutContextType>({
  headerTitle: '',
  headerSubtitle: '',
  logo: '',
  navLinks: [],
  setHeaderTitle: () => { },
  setHeaderSubtitle: () => { },
  setNavLinks: () => { },
  setLogo: () => { },
});

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [headerTitle, setHeaderTitle] = useState('');
  const [headerSubtitle, setHeaderSubtitle] = useState('');
  const [logo, setLogo] = useState('/stellar/images/small_logo.png')
  const [navLinks, setNavLinks] = useState([
    { href: '/blog', label: 'Blog' },
  ]);


  return (
    <>
      <LayoutContext.Provider value={{ headerTitle, headerSubtitle, navLinks, logo, setHeaderTitle, setHeaderSubtitle, setLogo, setNavLinks }}>
        {children}
      </LayoutContext.Provider>
    </>
  );
};

export const useLayoutContext = () => useContext(LayoutContext)