'use client';
import { useLayoutContext } from "@/app/context/LayoutContext";

export function Nav() {
  const { navLinks } = useLayoutContext();

  return (
    <nav id="nav">
      <ul>
        {navLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}