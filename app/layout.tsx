import type React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "@/contexts/language-context";
import ScrollToTop from "@/components/ScrollToTop";
import { ScrollRestorationProvider } from "@/components/scroll-restoration-provider";
import GATracker from "../components/ga-tracker";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Santiago Adicto - la guia de santiago",
  description: "",
  generator: "",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="preload"
          href="/Neutra-Book.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Neutra-Demi.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-WVNQLZT5');`}
        </Script>
      </head>
      <body className={`${montserrat.className} font-sans antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WVNQLZT5"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LDF4JN0LDG"
          strategy="lazyOnload"
        />
        <Script id="ga4-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LDF4JN0LDG');
          `}
        </Script>
        <LanguageProvider>
          <Suspense fallback={null}>
            <GATracker />
          </Suspense>
          <ScrollRestorationProvider>
            {children}
          </ScrollRestorationProvider>
          <ScrollToTop />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
