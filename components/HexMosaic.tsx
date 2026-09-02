"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { ProjectMeta } from "@/lib/types";
import HexCard from "./HexCard";

interface HexMosaicProps {
  projects: ProjectMeta[];
  onNavigate?: (slug: string) => void;
  launchingSlug?: string | null;
}

const CENTER_SLUG = "aiwake";
const REST_CLUSTER = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)";

const RING: { slug: string; dx: number; dy: number }[] = [
  { slug: "ancient_knowledge", dx: 0, dy: -1 },
  { slug: "anna_protocol", dx: 0.866, dy: -0.5 },
  { slug: "wonder_feed", dx: 0.866, dy: 0.5 },
  { slug: "endless_summer_paradise", dx: 0, dy: 1 },
  { slug: "momma_circle", dx: -0.866, dy: 0.5 },
  { slug: "master_mei", dx: -0.866, dy: -0.5 },
];

function readCssDeg(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

function readCssPx(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

export default function HexMosaic({
  projects,
  onNavigate,
  launchingSlug,
}: HexMosaicProps) {
  const [clusterTilt, setClusterTilt] = useState<CSSProperties>({
    transform: REST_CLUSTER,
    transition: "transform 0.25s ease-out",
  });
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const center = bySlug.get(CENTER_SLUG);
  const ring = RING.map((slot) => ({ ...slot, project: bySlug.get(slot.slug) })).filter(
    (slot): slot is (typeof RING)[number] & { project: ProjectMeta } => Boolean(slot.project)
  );

  const placed = new Set(center ? [CENTER_SLUG, ...RING.map((s) => s.slug)] : []);
  const overflow = projects.filter((p) => !placed.has(p.slug));

  useEffect(() => {
    function onWindowMouseMove(e: globalThis.MouseEvent) {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      const max = readCssDeg("--global-tilt-max", 15);
      const lift = readCssPx("--cluster-z", 20);

      setClusterTilt({
        transform: `perspective(1200px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(${lift}px)`,
        transition: "none",
      });
    }

    window.addEventListener("mousemove", onWindowMouseMove);
    return () => window.removeEventListener("mousemove", onWindowMouseMove);
  }, []);

  return (
    <div className="flex flex-col items-center gap-16">
      {center && (
        <div
          className="hex-cluster"
          style={{ ...clusterTilt, transformStyle: "preserve-3d" }}
        >
          <RingSlot
            project={center}
            dx={0}
            dy={0}
            onNavigate={onNavigate}
            launchingSlug={launchingSlug}
          />
          {ring.map((slot) => (
            <RingSlot
              key={slot.slug}
              project={slot.project}
              dx={slot.dx}
              dy={slot.dy}
              onNavigate={onNavigate}
              launchingSlug={launchingSlug}
            />
          ))}
        </div>
      )}

      {overflow.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6" style={{ transformStyle: "preserve-3d" }}>
          {overflow.map((project) => (
            <HexCard
              key={project.slug}
              project={project}
              onNavigate={onNavigate}
              isLaunching={launchingSlug === project.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RingSlotProps {
  project: ProjectMeta;
  dx: number;
  dy: number;
  onNavigate?: (slug: string) => void;
  launchingSlug?: string | null;
}

function RingSlot({ project, dx, dy, onNavigate, launchingSlug }: RingSlotProps) {
  return (
    <div
      className="hex-slot"
      style={{
        transform: `translate(calc(-50% + ${dx} * var(--hex-ring-distance)), calc(-50% + ${dy} * var(--hex-ring-distance)))`,
        transformStyle: "preserve-3d",
        pointerEvents: "auto",
      }}
    >
      <HexCard
        project={project}
        onNavigate={onNavigate}
        isLaunching={launchingSlug === project.slug}
      />
    </div>
  );
}
