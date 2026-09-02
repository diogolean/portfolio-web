"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ProjectMediaAsset } from "@/lib/media-discovery";
import type { PipelineNode } from "@/types/project";

interface Interactive916PlayerProps {
  assets: ProjectMediaAsset[];
  activeNode: PipelineNode;
  activeIndex: number;
  slug: string;
}

export default function Interactive916Player({
  assets,
  activeNode,
  activeIndex,
  slug,
}: Interactive916PlayerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const poster = assets.find((asset) => asset.kind === "image");
  const asset = assets.length ? assets[activeIndex % assets.length] : null;
  const heroAsset = activeIndex === 0 ? (assets.find((item) => item.kind === "video") ?? asset) : asset;
  const engine = useMemo(
    () =>
      activeNode.tags.find((tag) => /flux|gemini|llama|claude|eleven|moviepy|playwright/i.test(tag)) ??
      activeNode.tags[0] ??
      activeNode.category,
    [activeNode]
  );

  useEffect(() => {
    setReady(false);
    setCurrentTime(0);
  }, [heroAsset?.url]);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function onLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
    if (activeNode.videoTimestamp != null && Number.isFinite(video.duration)) {
      video.currentTime = Math.min(activeNode.videoTimestamp, Math.max(0, video.duration - 0.1));
    }
  }

  return (
    <div
      ref={frameRef}
      className="relative mx-auto w-[min(78vw,20rem)] rounded-[2.6rem] border border-white/15 bg-white/[0.055] p-2.5 shadow-[0_45px_120px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl sm:w-[min(46vw,21rem)] lg:w-[min(23vw,19rem)]"
    >
      <div className="absolute left-1/2 top-4 z-30 h-5 w-20 -translate-x-1/2 rounded-full border border-white/5 bg-black/95" />
      <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem] border border-black bg-zinc-950">
        {poster && !ready && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster.url}
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-55 blur-sm"
          />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={heroAsset?.url ?? activeNode.id}
            initial={{ opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {heroAsset?.kind === "video" ? (
              <video
                ref={videoRef}
                src={heroAsset.url}
                muted={muted}
                autoPlay
                loop
                playsInline
                preload="auto"
                onCanPlay={() => setReady(true)}
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="h-full w-full object-cover"
              />
            ) : heroAsset?.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroAsset.url}
                alt={`${slug} ${activeNode.title} artifact`}
                onLoad={() => setReady(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <TechnicalFallback node={activeNode} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />
        <div className="absolute inset-x-0 top-0 z-20 flex flex-wrap gap-1.5 p-4 pt-9">
          {["1080×1920", "30 FPS", engine].map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-emerald-500/35 bg-zinc-950/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-emerald-300 backdrop-blur"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 p-4">
          <motion.div
            key={activeNode.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-400">
              {activeNode.category} / {activeNode.id}
            </p>
            <p className="mt-1 text-sm font-medium text-white">{activeNode.title}</p>
          </motion.div>

          {heroAsset?.kind === "video" && (
            <div className="rounded-xl border border-white/10 bg-zinc-950/75 p-2.5 backdrop-blur-md">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.05}
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => {
                  const time = Number(event.target.value);
                  if (videoRef.current) videoRef.current.currentTime = time;
                  setCurrentTime(time);
                }}
                aria-label="Video position"
                className="h-1 w-full cursor-pointer accent-emerald-400"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <ControlButton label={playing ? "Pause" : "Play"} onClick={togglePlayback}>
                    {playing ? "Ⅱ" : "▶"}
                  </ControlButton>
                  <ControlButton
                    label={muted ? "Unmute" : "Mute"}
                    onClick={() => setMuted((value) => !value)}
                  >
                    {muted ? "MUTE" : "AUDIO"}
                  </ControlButton>
                </div>
                <span className="font-mono text-[9px] text-zinc-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <ControlButton
                  label="Enter fullscreen"
                  onClick={() => frameRef.current?.requestFullscreen?.()}
                >
                  ⛶
                </ControlButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="min-w-8 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[9px] text-white transition hover:border-emerald-500/50 hover:text-emerald-300"
    >
      {children}
    </button>
  );
}

function TechnicalFallback({ node }: { node: PipelineNode }) {
  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),transparent_45%),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,24px_24px,24px_24px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="flex h-32 w-32 items-center justify-center rounded-full border border-dashed border-emerald-400/40"
      >
        <span className="font-mono text-xs text-emerald-300">{node.category}</span>
      </motion.div>
    </div>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}
