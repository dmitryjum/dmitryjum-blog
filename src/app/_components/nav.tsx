'use client';
import { useLayoutContext } from "@/app/context/LayoutContext";
import { useState, useEffect } from "react";

export function Nav() {
  const { navLinks } = useLayoutContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    const navElement = document.getElementById('nav');
    if(navElement) {
      const height = navElement.offsetHeight;
      setNavHeight(height);
      const main = document.getElementById('main');
      if (main) {
        main.style.paddingTop = `${height}px`;
      }
    }
  }, [navLinks]);

  const toggleNavbar = () => {
    const main = document.getElementById('main');
    const navElement = document.getElementById('nav');
    if (main && navElement) {
      if (isCollapsed) {
        // Calculate the height of the uncollapsed navbar
        main.style.paddingTop = `${navHeight}px`;
      } else {
        main.style.paddingTop = '3em';
        // Set padding for collapsed navbar
      }
      navElement.classList.toggle('collapsed');
    }
    
    setIsCollapsed(!isCollapsed);
  };

  return (
    <nav id="nav">
      <div className="arrow-icon" onClick={toggleNavbar}>
        {isCollapsed ? '▼' : '▲'}
      </div>
      <ul className={isCollapsed ? 'hidden' : 'open'}>
        {navLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href} className={link.className}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}