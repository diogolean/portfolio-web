"use client";

import Image from "next/image";
import {
  useState,
  type CSSProperties,
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

const REST_TRANSFORM = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";

function readCssNumber(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

export default function HexCard({ project, onNavigate, isLaunching = false }: HexCardProps) {
  const isRegistry = project.status === "registry";
  const coverSrc = project.cover_image ?? project.image ?? null;
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState<CSSProperties>({
    transform: REST_TRANSFORM,
    transition: "transform 0.4s ease-out",
  });

  function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const max = readCssNumber("--card-tilt-max", 25);
    const scale = readCssNumber("--card-hover-scale", 1.06);
    const rotX = (y / (rect.height / 2)) * -max;
    const rotY = (x / (rect.width / 2)) * max;

    setTilt({
      transform: `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: "none",
    });
  }

  function handleMouseEnter() {
    setHovered(true);
    playHexHoverBeep();
  }

  function handleMouseLeave() {
    setHovered(false);
    setTilt({
      transform: REST_TRANSFORM,
      transition: "transform 0.4s ease-out",
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    onNavigate?.(project.slug);
  }

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onClick={(event) => {
        if (event.detail === 0) onNavigate?.(project.slug);
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hex-hitbox cursor-pointer select-none border-0 bg-transparent p-0 text-inherit pointer-events-auto"
      data-hovered={hovered || undefined}
      suppressHydrationWarning
    >
      <div
        className="hex-frame hex-tilt flex items-center justify-center"
        style={{
          ...tilt,
          transform: isLaunching
            ? "perspective(1000px) rotateX(720deg) rotateY(-1080deg) rotateZ(540deg) scale3d(0.15, 0.15, 0.15)"
            : tilt.transform,
          transition: isLaunching ? "transform 0.65s cubic-bezier(0.7, 0, 0.3, 1)" : tilt.transition,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className={["hex-bg border", isRegistry ? "hex-bg-registry" : "hex-bg-active"].join(" ")}
          style={{ transform: "translateZ(var(--z-bg))" }}
        >
          {coverSrc && (
            <Image
              src={coverSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              style={{ objectFit: "cover" }}
            />
          )}
          {coverSrc && <div className="hex-cover-overlay" />}
        </div>

        <div
          className={[
            "hex-layer-mid relative z-20 flex flex-col items-center gap-1 px-[var(--hex-card-padding)] text-center",
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
          className="hex-layer-top absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-1.5"
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
              "rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]",
              isRegistry ? "hex-badge-registry" : "hex-badge-active",
            ].join(" ")}
          >
            {project.status}
          </span>
        </div>
      </div>
    </button>
  );
}
