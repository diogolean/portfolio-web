"use client";

import Link from "next/link";
import { useState, type CSSProperties, type MouseEvent } from "react";
import type { ProjectMeta } from "@/lib/types";

interface HexCardProps {
  project: ProjectMeta;
}

const REST_TRANSFORM = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";

function readCssNumber(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

export default function HexCard({ project }: HexCardProps) {
  const isRegistry = project.status === "registry";
  const [tilt, setTilt] = useState<CSSProperties>({
    transform: REST_TRANSFORM,
    transition: "transform 0.4s ease-out",
  });

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const max = readCssNumber("--card-tilt-max", 25);
    const scale = readCssNumber("--card-hover-scale", 1.08);
    const rotX = (y / (rect.height / 2)) * -max;
    const rotY = (x / (rect.width / 2)) * max;

    setTilt({
      transform: `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: "none",
    });
  }

  function handleMouseLeave() {
    setTilt({
      transform: REST_TRANSFORM,
      transition: "transform 0.4s ease-out",
    });
  }

  return (
    <Link
      href={`/projects/${project.slug}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="hex-frame hex-tilt group relative z-10 flex shrink-0 cursor-pointer select-none items-center justify-center"
      style={{ ...tilt, transformStyle: "preserve-3d" }}
      suppressHydrationWarning
    >
      <div
        className={["hex-bg border", isRegistry ? "hex-bg-registry" : "hex-bg-active"].join(" ")}
        style={{ transform: "translateZ(var(--z-bg))" }}
      />

      <div
        className={[
          "pointer-events-none relative z-20 flex flex-col items-center gap-1 px-[var(--hex-card-padding)] text-center",
          isRegistry ? "hex-title-registry" : "hex-title-active",
        ].join(" ")}
        style={{ transform: "translateZ(var(--z-depth-text))" }}
      >
        <span className="text-xs font-medium">{project.title}</span>
        {project.codename && (
          <span className="hex-codename font-mono text-[10px]">{project.codename}</span>
        )}
        <span
          className={[
            "mt-1.5 h-px w-8 rounded-full",
            isRegistry ? "hex-registry-line" : "hex-accent-line",
          ].join(" ")}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-1.5"
        style={{ transform: "translateZ(var(--z-depth-badges))" }}
      >
        {!isRegistry && project.tags[0] && (
          <span className="hex-tech-tag font-mono text-[9px]">{project.tags[0]}</span>
        )}
        <span
          className={[
            "rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider",
            isRegistry ? "hex-badge-registry" : "hex-badge-active",
          ].join(" ")}
        >
          {project.status}
        </span>
      </div>
    </Link>
  );
}
