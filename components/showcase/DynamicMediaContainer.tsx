"use client";

import { motion } from "framer-motion";
import type { ProjectMediaAsset } from "@/lib/media-discovery";
import type { ArchitectureNode } from "@/lib/project-parser";

interface DynamicMediaContainerProps {
  media: ProjectMediaAsset | null;
  slug: string;
  activeNode: ArchitectureNode;
}

export default function DynamicMediaContainer({
  media,
  slug,
  activeNode,
}: DynamicMediaContainerProps) {
  return (
    <div className="relative aspect-video min-h-[13rem] overflow-hidden rounded-2xl border border-neutral-800 bg-[#06080a]">
      {media?.kind === "video" ? (
        <video
          key={media.url}
          src={media.url}
          muted
          autoPlay
          loop
          playsInline
          controls
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : media?.kind === "image" ? (
        // Native img supports both static public paths and the guarded local-output route.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.url} alt={`${slug} output`} className="h-full w-full object-cover" />
      ) : (
        <AnimatedSchematic slug={slug} activeNode={activeNode} />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <span className="rounded-full border border-white/10 bg-black/55 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/70 backdrop-blur">
          {media ? `${media.source} artifact` : "live schematic"}
        </span>
        <span className="rounded-full border border-accent/20 bg-black/55 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-accent backdrop-blur">
          {media?.kind ?? "generated UI"}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500">
            Active execution
          </p>
          <p className="mt-1 truncate text-xs text-white">{activeNode.title}</p>
        </div>
        <span className="shrink-0 font-mono text-[9px] text-neutral-500">
          {media?.filename ?? `${slug}.graph`}
        </span>
      </div>
    </div>
  );
}

function AnimatedSchematic({
  slug,
  activeNode,
}: {
  slug: string;
  activeNode: ArchitectureNode;
}) {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,102,0.08),transparent_48%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:auto,24px_24px,24px_24px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          key={activeNode.id}
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex h-24 w-24 items-center justify-center rounded-full border border-accent/30 bg-accent/[0.06] shadow-[0_0_70px_rgba(0,255,102,0.14)]"
        >
          <motion.span
            className="absolute inset-2 rounded-full border border-dashed border-accent/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 14, ease: "linear", repeat: Infinity }}
          />
          <span className="font-mono text-[9px] uppercase tracking-widest text-accent">
            {activeNode.kind}
          </span>
        </motion.div>
      </div>
      <div className="absolute left-4 top-16 font-mono text-[9px] leading-5 text-neutral-700">
        <p>$ load {slug}</p>
        <p>$ bind {activeNode.id}</p>
        <motion.p
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="text-accent/70"
        >
          $ execution.ready_
        </motion.p>
      </div>
    </div>
  );
}
