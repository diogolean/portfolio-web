import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import Header from "@/components/layout/Header";
import OmniCoreModal from "@/components/omni/OmniCoreModal";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-XP7GD81JJB";
const SITE_URL = "https://diogolean.com";

const knowledgeGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Diogo Lean Veiga",
      jobTitle: "AI Systems & Product Architect",
      url: SITE_URL,
      sameAs: [
        "https://www.linkedin.com/in/diogo-lean-veiga/",
        "https://github.com/diogolean",
      ],
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "ESDI - Escola Superior de Desenho Industrial (UERJ)",
        department: "Human-Computer Interaction (HCI)",
      },
      knowsAbout: [
        "Multi-Agent Systems",
        "Large Language Model Orchestration",
        "Human-Computer Interaction",
        "Playwright Automation",
        "High-Concurrency Distributed Systems",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/projects/aiwake#software`,
      name: "Aiwake",
      url: `${SITE_URL}/projects/aiwake`,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cloud / Python",
      description:
        "Autonomous multi-agent sentience and dialectic friction engine probing model guardrails and in-context learning.",
      creator: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/omni-engine#software`,
      name: "Omni-Engine",
      url: `${SITE_URL}/omni-engine`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Cloud",
      description:
        "Distributed synthetic media generation architecture operating at $0.002 unit token cost with 84.8M+ organic reach.",
      creator: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

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
  metadataBase: new URL(SITE_URL),
  title: "Diogo Lean Veiga | AI Systems & Product Architect",
  description:
    "Architecting autonomous multi-agent state machines (Aiwake), model-agnostic routing gateways, and distributed media synthesis pipelines (Omni-Engine) scaled to 84.8M+ reach.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Diogo Lean Veiga - Systems Architecture",
    title: "Diogo Lean Veiga | AI Systems & Product Architect",
    description:
      "Autonomous Multi-Agent Engines, Model-Agnostic Gateways & High-Throughput Media Pipelines.",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "Omni-Engine hexagonal distributed systems topology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diogo Lean Veiga | AI Systems & Product Architect",
    description:
      "Scaling autonomous synthetic engines past 84.8M impressions with sub-cent token economics.",
    images: [`${SITE_URL}/og-preview.png`],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#07090c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(knowledgeGraph).replace(/</g, "\\u003c"),
          }}
        />
      </head>
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
