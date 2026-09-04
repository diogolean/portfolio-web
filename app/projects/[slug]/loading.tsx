"use client";

import { usePathname } from "next/navigation";
import HexagonLoader from "@/components/HexagonLoader";

function projectNameFromPath(pathname: string) {
  const slug = pathname.match(/^\/projects\/([^/?#]+)/i)?.[1] ?? "pipeline";
  try {
    return decodeURIComponent(slug).replace(/[-_]+/g, " ").trim().toUpperCase();
  } catch {
    return slug.replace(/[-_]+/g, " ").trim().toUpperCase();
  }
}

export default function ProjectLoading() {
  const projectName = projectNameFromPath(usePathname());
  return <HexagonLoader status={`LOADING PROJECT ${projectName} AGENT...`} />;
}
