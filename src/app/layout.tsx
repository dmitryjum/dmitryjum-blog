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
import "../../public/stellar/assets/css/main.css"

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
                <h2>Aliquam sed mauris</h2>
                <p>Sed lorem ipsum dolor sit amet et nullam consequat feugiat consequat magna adipiscing tempus etiam dolore veroeros. eget dapibus mauris. Cras aliquet, nisl ut viverra sollicitudin, ligula erat egestas velit, vitae tincidunt odio.</p>
                <ul className="actions">
                  <li><a href="generic.html" className="button">Learn More</a></li>
                </ul>
              </section>
              <section>
                <h2>Etiam feugiat</h2>
                <dl className="alt">
                  <dt>Address</dt>
                  <dd>1234 Somewhere Road &bull; Nashville, TN 00000 &bull; USA</dd>
                  <dt>Phone</dt>
                  <dd>(000) 000-0000 x 0000</dd>
                  <dt>Email</dt>
                  <dd><a href="#">information@untitled.tld</a></dd>
                </dl>
                <ul className="icons">
                  <li><a href="#" className="icon brands fa-twitter alt"><span className="label">Twitter</span></a></li>
                  <li><a href="#" className="icon brands fa-facebook-f alt"><span className="label">Facebook</span></a></li>
                  <li><a href="#" className="icon brands fa-instagram alt"><span className="label">Instagram</span></a></li>
                  <li><a href="#" className="icon brands fa-github alt"><span className="label">GitHub</span></a></li>
                  <li><a href="#" className="icon brands fa-dribbble alt"><span className="label">Dribbble</span></a></li>
                </ul>
              </section>
              <p className="copyright">&copy; Untitled. Design: <a href="https://html5up.net">HTML5 UP</a>.</p>
            </footer>
          </div>
        </LayoutProvider>
        <StellarScripts />
      </body>
    </html>
  );
}
