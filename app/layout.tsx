import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/language-context";
import ScrollToTop from "@/components/ScrollToTop";

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
      <body className={`${montserrat.className} font-sans antialiased`}>
        <LanguageProvider>
          {children}
          <ScrollToTop />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
