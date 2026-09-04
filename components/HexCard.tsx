"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import {
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import type { ProjectMeta } from "@/lib/types";
import { playHexHoverBeep } from "@/lib/audio-fx";

interface HexCardProps {
  project: ProjectMeta;
  onNavigate?: (slug: string) => void;
  isLaunching?: boolean;
}

function readCssNumber(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

export default function HexCard({ project, onNavigate, isLaunching = false }: HexCardProps) {
  const isRegistry = project.status === "registry";
  const coverSrc = project.cover_image ?? project.image ?? null;
  const pointerStart = useRef<{ id: number; x: number; y: number } | null>(null);
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rawScale = useMotionValue(1);
  const springConfig = { stiffness: 200, damping: 20, mass: 0.45 };
  const rotateX = useSpring(rawRotateX, springConfig);
  const rotateY = useSpring(rawRotateY, springConfig);
  const scale = useSpring(rawScale, springConfig);
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const max = readCssNumber("--card-tilt-max", 25);
    const scale = readCssNumber("--card-hover-scale", 1.06);
    const rotX = (y / (rect.height / 2)) * -max;
    const rotY = (x / (rect.width / 2)) * max;

    rawRotateX.set(rotX);
    rawRotateY.set(rotY);
    rawScale.set(scale);
  }

  function handleMouseEnter() {
    setHovered(true);
    rawScale.set(readCssNumber("--card-hover-scale", 1.06));
    playHexHoverBeep();
  }

  function handleMouseLeave() {
    setHovered(false);
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawScale.set(1);
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    pointerStart.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || start.id !== event.pointerId) return;
    const travel = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (travel <= 8) onNavigate?.(project.slug);
  }

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
      onClick={(event) => {
        if (event.detail === 0) onNavigate?.(project.slug);
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hex-hitbox touch-pan-y cursor-pointer select-none border-0 bg-transparent p-0 text-inherit pointer-events-auto [&_*]:pointer-events-none"
      data-hovered={hovered || undefined}
      suppressHydrationWarning
    >
      <motion.div
        animate={
          isLaunching
            ? {
                rotateX: 720,
                rotateY: -1080,
                rotateZ: 540,
                scale: 0.15,
              }
            : undefined
        }
        transition={
          isLaunching
            ? { duration: 0.65, ease: [0.7, 0, 0.3, 1] }
            : undefined
        }
        className="pointer-events-none hex-frame hex-tilt flex transform-gpu items-center justify-center will-change-transform"
        style={{
          rotateX,
          rotateY,
          scale,
          transformPerspective: 1000,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className={[
            "pointer-events-none hex-bg border",
            isRegistry ? "hex-bg-registry" : "hex-bg-active",
          ].join(" ")}
          style={{ transform: "translateZ(var(--z-bg))" }}
        >
          {coverSrc && (
            <Image
              src={coverSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="pointer-events-none"
              style={{ objectFit: "cover" }}
            />
          )}
          {coverSrc && <div className="pointer-events-none hex-cover-overlay" />}
        </div>

        <div
          className={[
            "pointer-events-none hex-layer-mid relative z-20 flex flex-col items-center gap-1 px-[var(--hex-card-padding)] text-center",
            isRegistry ? "hex-title-registry" : "hex-title-active",
          ].join(" ")}
          style={{ transform: "translateZ(var(--z-depth-text))" }}
        >
          <span className="text-xs font-medium text-white opacity-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] [backdrop-filter:none]">
            {project.title}
          </span>
          {project.codename && (
            <span className="hex-codename font-mono text-[10px] drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]">
              {project.codename}
            </span>
          )}
          <span
            className={[
              "mt-1.5 h-px w-8 rounded-full",
              isRegistry ? "hex-registry-line" : "hex-accent-line",
            ].join(" ")}
          />
        </div>

        <div
          className="pointer-events-none hex-layer-top absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-1.5"
          style={{ transform: "translateZ(var(--z-depth-badges))" }}
        >
          {project.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1">
              {project.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="hex-tech-tag font-mono text-[9px] uppercase tracking-wider drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <span
            className={[
              "rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider",
              isRegistry
                ? "drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
                : "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.35)]",
              isRegistry ? "hex-badge-registry" : "hex-badge-active",
            ].join(" ")}
          >
            {project.status}
          </span>
        </div>
      </motion.div>
    </button>
  );
}
