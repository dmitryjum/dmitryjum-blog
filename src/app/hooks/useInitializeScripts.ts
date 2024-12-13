"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useInitializeScripts() {
  const pathname = usePathname();

  useEffect(() => {
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
          $nav_a.scrolly({
            speed: 1000,
            offset: function () {
              return $nav.height();
            },
          });
        }
      }
    };
    
    handleRouteChange()

  }, [pathname]);
}