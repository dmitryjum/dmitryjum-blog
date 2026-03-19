"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLayoutContext } from '@/app/context/LayoutContext';

export function useInitializeScripts() {
  const pathname = usePathname();
  const { navLinks } = useLayoutContext();

  useEffect(() => {
    const handleHashLinkClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute('href') || '';

      if (href.length < 2) {
        return;
      }

      const destination = document.querySelector(href);

      if (!destination) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const nav = document.getElementById('nav');
      const navOffset = nav ? nav.offsetHeight : 0;
      const top = destination.getBoundingClientRect().top + window.scrollY - navOffset;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: 'smooth',
      });

      window.history.replaceState(null, '', href);
    };

    const handleRouteChange = () => {
      const $ = (window as any).jQuery;

      if (typeof window !== 'undefined' && $) {
        const $nav = $('#nav');
        const $main = $('#main');

        if ($nav.length > 0) {
          $nav.removeClass('alt');
          $main.scrollex({
            mode: 'top',
            enter: function () {
              if (this.position().top > 0) $nav.addClass('alt');
            },
            leave: function () {
              $nav.removeClass('alt');
            },
          });

          const $nav_a = $nav.find('a');

          $nav_a.off('click');
          $nav_a.off('click.scrolly');
        }
      }
    };

    document.addEventListener('click', handleHashLinkClick, true);
    handleRouteChange();

    return () => {
      document.removeEventListener('click', handleHashLinkClick, true);
    };
  }, [pathname, navLinks]);
}
