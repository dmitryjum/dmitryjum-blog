'use client';
import { useLayoutContext } from "@/app/context/LayoutContext";
import { useState, useEffect } from "react";

export function Nav() {
  const { navLinks } = useLayoutContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const syncMainPadding = () => {
    const navElement = document.getElementById('nav');
    const main = document.getElementById('main');

    if (navElement && main) {
      main.style.paddingTop = `${navElement.offsetHeight}px`;
    }
  };

  useEffect(() => {
    syncMainPadding();

    const handleResize = () => syncMainPadding();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [navLinks]);

  const toggleNavbar = () => {
    const navElement = document.getElementById('nav');

    if (navElement) {
      const nextCollapsed = !isCollapsed;
      navElement.classList.toggle('collapsed', nextCollapsed);
      setIsCollapsed(nextCollapsed);

      requestAnimationFrame(() => {
        syncMainPadding();
      });
    }
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
