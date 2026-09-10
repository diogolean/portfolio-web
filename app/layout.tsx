import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import Header from "@/components/layout/Header";
import OmniCoreModal from "@/components/omni/OmniCoreModal";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-XP7GD81JJB";

// Two distinct roles, one family each — no default Inter/Geist stand-in.
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diogo Lean Veiga — AI Product Engineer",
  description:
    "Autonomous agent pipelines, generative media engines, and high-performance interfaces.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Header />
        <OmniCoreModal />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
