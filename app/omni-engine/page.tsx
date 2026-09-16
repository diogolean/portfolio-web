import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";

export const metadata: Metadata = {
  title: "Omni-Engine | Distributed Media Synthesis Architecture",
  description:
    "MCP gateway, generative pipelines, cost telemetry, and the distribution mesh behind Omni Engine.",
  alternates: {
    canonical: "/omni-engine",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/omni-engine",
    siteName: "Diogo Lean Veiga - Systems Architecture",
    title: "Omni-Engine | Distributed Media Synthesis Architecture",
    description:
      "MCP gateway, generative pipelines, cost telemetry, and the distribution mesh behind Omni Engine.",
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
    title: "Omni-Engine | Distributed Media Synthesis Architecture",
    description:
      "MCP gateway, generative pipelines, cost telemetry, and the distribution mesh behind Omni Engine.",
    images: ["/og-preview.png"],
  },
};

export default HomePage;
