// import Footer from "@/app/_components/footer";
import StellarScripts from "@/app/_components/StellarScripts";
import { CMS_NAME, HOME_OG_IMAGE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { LayoutProvider } from "@/app/context/LayoutContext";
import { Nav } from "@/app/_components/nav";
import { Header } from "@/app/_components/header";
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

            <footer id="footer">
              <section>
                <h2>Let's Create Something Exceptional</h2>
                <p>With a decade of experience in full-stack development and a passion for emerging technologies, I bring both technical expertise and creative problem-solving to every project. Whether you need a scalable web application, smart contract implementation, or real-time platform, I'm ready to help turn your vision into reality.</p>
                <ul className="actions">
                  <li><a href="/blog/posts/about-me" className="button">Learn more about me</a></li>
                </ul>
              </section>
              <section>
                <h2>Contact info</h2>
                <dl className="alt">
                  <dt>Email</dt>
                  <dd><a href="#">dmitryjum@gmail.com</a></dd>
                </dl>
                <ul className="icons">
                  <li><a href="https://www.instagram.com/ddxfiler/" className="icon brands fa-instagram alt"><span className="label">Instagram</span></a></li>
                  <li><a href="https://www.github.com/dmitryjum" className="icon brands fa-github alt"><span className="label">GitHub</span></a></li>
                  <li><a href="https://www.linkedin.com/in/dmitryjum" className="icon brands fa-linkedin alt"><span className="label">Dribbble</span></a></li>
                  <li><a href="/assets/DmitryJumResume.pdf" className="icon fa-file-pdf alt"><span className="label">My Resume</span></a></li>
                </ul>
              </section>
              <p className="copyright">&copy; Developed by Dmitry Jum. Built with Next.js. Design: <a href="https://html5up.net">HTML5 UP</a>.</p>
            </footer>
          </div>
        </LayoutProvider>
        <StellarScripts />
      </body>
    </html>
  );
}
