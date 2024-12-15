import StellarScripts from "@/app/_components/StellarScripts";
import type { Metadata } from "next";
import { LayoutProvider } from "@/app/context/LayoutContext";
import { Nav } from "@/app/_components/nav";
import { Header } from "@/app/_components/header";
import { Footer } from "@/app/_components/footer";


import "./globals.css";


export const metadata: Metadata = {
  title: `Dmitry Jum software engineer`,
  description: `Dmitry Jum personal page, blog and software development services he provides.`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="msapplication-config"
          content="/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#000" />
        <link rel="stylesheet" href="/stellar/assets/css/main.css" />
        <noscript>
          <link rel="stylesheet" href="/stellar/assets/css/noscript.css" />
        </noscript>
      </head>
      <body className="is-preload">
        <LayoutProvider>
          <div id="wrapper">
            <Header />
            <Nav />
            {children}
            <Footer />
          </div>
        </LayoutProvider>
        <StellarScripts />
      </body>
    </html>
  );
}
