"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { ProjectMediaAsset } from "@/lib/media-discovery";
import type { PipelineNode } from "@/types/project";

interface DynamicMediaContainerProps {
  media: ProjectMediaAsset | null;
  slug: string;
  activeNode: PipelineNode;
}

export default function DynamicMediaContainer({
  media,
  slug,
  activeNode,
}: DynamicMediaContainerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || activeNode.videoTimestamp == null || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(activeNode.videoTimestamp, Math.max(0, video.duration - 0.1));
  }, [activeNode.videoTimestamp]);

  return (
    <div className="relative mx-auto w-[min(78vw,20rem)] rounded-[2.6rem] border border-white/15 bg-white/[0.045] p-2.5 shadow-[0_45px_120px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl sm:w-[min(46vw,21rem)] lg:w-[min(23vw,19rem)] xl:w-[min(22vw,21rem)]">
      <div className="absolute left-1/2 top-4 z-20 h-5 w-20 -translate-x-1/2 rounded-full border border-white/5 bg-black/90">
        <span className="absolute right-3 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400/30" />
      </div>
      <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem] border border-black bg-[#06080a]">
        {media?.kind === "video" ? (
          <video
            ref={videoRef}
            key={media.url}
            src={media.url}
            muted
            autoPlay
            loop
            playsInline
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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-9">
          <span className="rounded-full border border-white/10 bg-black/55 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/70 backdrop-blur">
            {media ? `${media.source} artifact` : "live schematic"}
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-black/55 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-400 backdrop-blur">
            {activeNode.category}
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNode.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
            className="absolute inset-x-0 bottom-0 p-5"
          >
            <div className="mb-3 flex gap-1">
              {activeNode.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="h-0.5 flex-1 bg-emerald-400/50" />
              ))}
            </div>
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-emerald-400">
              Active layer / {activeNode.id}
            </p>
            <p className="mt-2 text-sm font-medium leading-5 text-white">{activeNode.title}</p>
            <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-white/55">
              {activeNode.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AnimatedSchematic({
  slug,
  activeNode,
}: {
  slug: string;
  activeNode: PipelineNode;
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
            {activeNode.category}
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
