'use client';

import Script from "next/script";
import { useEffect } from "react";
import { useInitializeScripts } from "../hooks/useInitializeScripts";

export default function StellarScripts() {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.classList.remove('is-preload');
    }, 100);

    return () => clearTimeout(timer);
  }, []);
  useInitializeScripts();
  return (
    <>
      <Script src="/stellar/assets/js/jquery.min.js" strategy="beforeInteractive" />
      <Script src="/stellar/assets/js/jquery.scrollex.min.js" strategy="beforeInteractive" />
      <Script src="/stellar/assets/js/jquery.scrolly.min.js" strategy="beforeInteractive" />
      <Script src="/stellar/assets/js/browser.min.js" strategy="afterInteractive" />
      <Script src="/stellar/assets/js/breakpoints.min.js" strategy="afterInteractive" />
      <Script src="/stellar/assets/js/util.js" strategy="afterInteractive" />
      <Script src="/stellar/assets/js/main.js" strategy="afterInteractive" />
    </>
  );
}