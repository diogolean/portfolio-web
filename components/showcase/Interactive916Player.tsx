"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProjectMediaAsset } from "@/lib/media-discovery";
import type { ProjectMediaKind } from "@/lib/types";
import type { PipelineNode } from "@/types/project";

function videoMimeFromUrl(url: string) {
  if (/\.webm(?:$|\?)/i.test(url)) return "video/webm";
  if (/\.mov(?:$|\?)/i.test(url)) return "video/quicktime";
  return "video/mp4";
}

interface Interactive916PlayerProps {
  assets: ProjectMediaAsset[];
  activeNode: PipelineNode;
  activeIndex: number;
  slug: string;
  mediaKind?: ProjectMediaKind;
}

export default function Interactive916Player({
  assets,
  activeNode,
  activeIndex,
  slug,
  mediaKind = "video",
}: Interactive916PlayerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videos = assets.filter((asset) => asset.kind === "video").slice(0, 5);
  const stills = assets.filter((asset) => asset.kind === "image").slice(0, 18);
  const isCarousel =
    mediaKind === "carousel" || mediaKind === "image" || (videos.length === 0 && stills.length > 0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [assetFilter, setAssetFilter] = useState<"all" | "video" | "image">(
    isCarousel ? "image" : "all"
  );
  const [assetIndex, setAssetIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [failedAssetUrls, setFailedAssetUrls] = useState<Set<string>>(() => new Set());
  const poster = stills[0] ?? assets.find((asset) => asset.kind === "image");
  const availableVideos = videos.filter((asset) => !failedAssetUrls.has(asset.url));
  const filteredAssets = isCarousel
    ? stills
    : assetFilter === "video"
      ? availableVideos
      : assetFilter === "image"
        ? stills
        : [...availableVideos, ...stills];
  const heroAsset = filteredAssets[assetIndex % Math.max(filteredAssets.length, 1)] ?? null;
  const engine = useMemo(
    () =>
      activeNode.tags.find((tag) => /flux|gemini|llama|claude|eleven|moviepy|playwright/i.test(tag)) ??
      activeNode.tags[0] ??
      activeNode.category,
    [activeNode]
  );
  const freezeTimers = useCallback(() => {
    if (slideIntervalRef.current != null) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }
    if (slideTimeoutRef.current != null) {
      clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    setReady(false);
    setCurrentTime(0);
  }, [heroAsset?.url]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isCarousel) return;
    setAssetFilter("image");
  }, [isCarousel]);

  useEffect(() => {
    if (!filteredAssets.length) return;
    setAssetIndex(activeIndex % filteredAssets.length);
  }, [activeIndex, assetFilter, filteredAssets.length]);

  useEffect(() => {
    if (!isCarousel || !playing || filteredAssets.length < 2) return;
    slideIntervalRef.current = setInterval(() => {
      setAssetIndex((index) => (index + 1) % filteredAssets.length);
    }, 4200);
    return () => {
      if (slideIntervalRef.current != null) {
        clearInterval(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
    };
  }, [isCarousel, playing, filteredAssets.length, heroAsset?.url]);

  useEffect(
    () => () => {
      freezeTimers();
    },
    [freezeTimers]
  );

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) {
      setPlaying((value) => !value);
      return;
    }
    if (video.paused) {
      await video.play();
      setPlaying(true);
    } else {
      video.pause();
      freezeTimers();
      setPlaying(false);
    }
  }

  function onLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    video.volume = clampVolume(muted ? 0 : 0.3);
    setDuration(video.duration || 0);
    if (activeNode.videoTimestamp != null && Number.isFinite(video.duration)) {
      video.currentTime = Math.min(activeNode.videoTimestamp, Math.max(0, video.duration - 0.1));
    }
  }

  function toggleAudio() {
    const nextMuted = !muted;
    freezeTimers();
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      videoRef.current.volume = clampVolume(nextMuted ? 0 : 0.3);
      if (!nextMuted) void videoRef.current.play().catch(() => undefined);
    }
    setMuted(nextMuted);
  }

  return (
    <div
      ref={frameRef}
      className="relative mx-auto w-full max-w-[340px] rounded-[2.6rem] border border-white/15 bg-white/[0.055] p-2.5 shadow-[0_45px_120px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl"
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
            {heroAsset?.kind === "video" && !isCarousel && isInViewport ? (
              <video
                ref={videoRef}
                poster={poster?.url}
                muted={muted}
                autoPlay={playing}
                loop
                playsInline
                preload="metadata"
                crossOrigin={heroAsset.source === "external" ? undefined : "anonymous"}
                onCanPlay={() => setReady(true)}
                onLoadedMetadata={onLoadedMetadata}
                onError={() => {
                  setReady(false);
                  setFailedAssetUrls((failed) => {
                    const next = new Set(failed);
                    next.add(heroAsset.url);
                    return next;
                  });
                }}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => {
                  freezeTimers();
                  setPlaying(false);
                }}
                className="h-full w-full object-cover"
              >
                <source src={heroAsset.url} type={videoMimeFromUrl(heroAsset.url)} />
              </video>
            ) : heroAsset?.kind === "video" && !isCarousel && poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster.url}
                alt={`${slug} preview poster`}
                className="h-full w-full object-cover"
              />
            ) : heroAsset?.kind === "image" || (isCarousel && stills[0]) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img
                src={(heroAsset?.kind === "image" ? heroAsset.url : stills[0]?.url) ?? ""}
                alt={`${slug} ${activeNode.title} artwork`}
                onLoad={() => setReady(true)}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1.12 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.45, ease: "easeOut" },
                  scale: { duration: 4.2, ease: "linear" },
                }}
                className="h-full w-full origin-center object-cover"
              />
            ) : (
              <TechnicalFallback node={activeNode} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/3 bg-gradient-to-b from-white/12 via-white/[0.03] to-transparent" />
        <div className="absolute inset-x-0 top-0 z-20 flex flex-wrap gap-1.5 p-4 pt-9">
          {(isCarousel ? ["1080×1440", "CAROUSEL", engine] : ["1080×1920", "30 FPS", engine]).map((badge) => (
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

          {heroAsset?.kind === "video" && !isCarousel && (
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
                    label={muted ? "Unmute audio" : "Mute audio"}
                    onClick={toggleAudio}
                  >
                    <VolumeIcon muted={muted} />
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
          {isCarousel && stills.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-zinc-950/75 p-2.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <ControlButton
                    label={playing ? "Pause carousel" : "Play carousel"}
                    onClick={() => setPlaying((value) => !value)}
                  >
                    {playing ? "Ⅱ" : "▶"}
                  </ControlButton>
                </div>
                <span className="font-mono text-[9px] text-zinc-400">
                  {String((assetIndex % Math.max(stills.length, 1)) + 1).padStart(2, "0")} /{" "}
                  {String(stills.length).padStart(2, "0")}
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

      <div className="px-2 pb-1 pt-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() =>
              setAssetIndex((index) => (index - 1 + filteredAssets.length) % filteredAssets.length)
            }
            disabled={filteredAssets.length < 2}
            aria-label="Previous media asset"
            className="h-8 w-8 border border-zinc-700 font-mono text-sm text-zinc-300 disabled:opacity-30"
          >
            &lt;
          </button>
          <div className="flex min-w-0 flex-1 justify-center gap-1">
            {filteredAssets.slice(0, 9).map((asset, index) => (
              <button
                key={asset.url}
                type="button"
                onClick={() => setAssetIndex(index)}
                aria-label={`Show ${asset.filename}`}
                className={`h-1 flex-1 transition ${
                  index === assetIndex % filteredAssets.length ? "bg-emerald-400" : "bg-zinc-700"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAssetIndex((index) => (index + 1) % filteredAssets.length)}
            disabled={filteredAssets.length < 2}
            aria-label="Next media asset"
            className="h-8 w-8 border border-zinc-700 font-mono text-sm text-zinc-300 disabled:opacity-30"
          >
            &gt;
          </button>
        </div>
        <div className="mt-2 flex justify-center gap-3 font-mono text-[9px] text-zinc-500">
          {isCarousel ? (
            <span className="text-emerald-300">ARTWORK ({stills.length})</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAssetFilter("video")}
                className={assetFilter === "video" ? "text-emerald-300" : "hover:text-zinc-300"}
              >
                VIDEOS ({videos.length})
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setAssetFilter("image")}
                className={assetFilter === "image" ? "text-emerald-300" : "hover:text-zinc-300"}
              >
                STILLS ({stills.length})
              </button>
            </>
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

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h3l4-3v10l-4-3H3z" />
      {muted ? (
        <>
          <path d="m13 8 4 4" />
          <path d="m17 8-4 4" />
        </>
      ) : (
        <>
          <path d="M13 7.5a3.5 3.5 0 0 1 0 5" />
          <path d="M15 5.5a6.2 6.2 0 0 1 0 9" />
        </>
      )}
    </svg>
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

function clampVolume(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
