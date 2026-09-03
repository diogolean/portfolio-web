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
        className="relative isolate"
      >
        <HexMosaic
          projects={projects}
          onNavigate={launch}
          launchingSlug={launchingSlug}
        />
        <div
          inert
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[calc(100%-1rem)] -z-10 origin-top scale-y-[-1] opacity-20 blur-[2px]"
          style={{
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 80%)",
          }}
        >
          <HexMosaic projects={projects} launchingSlug={launchingSlug} />
        </div>
      </motion.div>
      <AnimatePresence>
        {launchingSlug && (
          <HexTransitionLoader status={`INITIALIZING ${launchingSlug.toUpperCase()} AGENT...`} />
        )}
      </AnimatePresence>
    </>
  );
}
