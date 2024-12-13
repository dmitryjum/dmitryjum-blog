// import Footer from "@/app/_components/footer";
import StellarScripts from "@/app/_components/StellarScripts";
// import { CMS_NAME, HOME_OG_IMAGE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { LayoutProvider } from "@/app/context/LayoutContext";
import { Nav } from "@/app/_components/nav";
import { Header } from "@/app/_components/header";
import { Footer } from "@/app/_components/footer";
// import { Inter } from "next/font/google";
// import cn from "classnames";
// import { ThemeSwitcher } from "./_components/theme-switcher";
// import Script from "next/script";


import "./globals.css";
// import "../../public/stellar/assets/css/main.css"

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `Dmitry Jum software engineer`,
  description: `Dmitry Jum personal page, blog and software development services he provides.`,
  // openGraph: {
  //   images: [HOME_OG_IMAGE_URL],
  // },
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
