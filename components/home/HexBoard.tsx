"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProjectMeta } from "@/lib/types";
import HexMosaic from "@/components/HexMosaic";
import HexTransitionLoader from "@/components/showcase/HexTransitionLoader";

export default function HexBoard({ projects }: { projects: ProjectMeta[] }) {
  const router = useRouter();
  const [launchingSlug, setLaunchingSlug] = useState<string | null>(null);

  function launch(slug: string) {
    if (launchingSlug) return;
    setLaunchingSlug(slug);
    window.setTimeout(() => router.push(`/projects/${slug}`), 620);
  }

  return (
    <>
      <motion.div
        animate={{
          opacity: launchingSlug ? 0 : 1,
          scale: launchingSlug ? 0.94 : 1,
          filter: launchingSlug ? "blur(12px)" : "blur(0px)",
        }}
        transition={{ duration: 0.55, ease: [0.7, 0, 0.3, 1] }}
      >
        <HexMosaic
          projects={projects}
          onNavigate={launch}
          launchingSlug={launchingSlug}
        />
      </motion.div>
      <AnimatePresence>
        {launchingSlug && (
          <HexTransitionLoader status={`INITIALIZING ${launchingSlug.toUpperCase()} AGENT...`} />
        )}
      </AnimatePresence>
    </>
  );
}
