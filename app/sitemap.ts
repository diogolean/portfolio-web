import type { MetadataRoute } from "next";
import { listProjectSlugs } from "@/lib/registry";

const SITE_URL = "https://diogolean.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectSlugs = await listProjectSlugs();

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/omni-engine`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...projectSlugs.map((slug) => ({
      url: `${SITE_URL}/projects/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
