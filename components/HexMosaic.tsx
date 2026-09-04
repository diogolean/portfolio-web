"use client";

import { motion, useSpring } from "framer-motion";
import {
  useEffect,
  type PointerEvent,
  type TouchEvent,
} from "react";
import type { ProjectMeta } from "@/lib/types";
import HexCard from "./HexCard";

interface HexMosaicProps {
  projects: ProjectMeta[];
  onNavigate?: (slug: string) => void;
  launchingSlug?: string | null;
}

const CENTER_SLUG = "aiwake";

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
  const rotateX = useSpring(0, { stiffness: 200, damping: 20, mass: 0.45 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20, mass: 0.45 });
  const clusterZ = useSpring(0, { stiffness: 200, damping: 20, mass: 0.45 });
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const center = bySlug.get(CENTER_SLUG);
  const ring = RING.map((slot) => ({ ...slot, project: bySlug.get(slot.slug) })).filter(
    (slot): slot is (typeof RING)[number] & { project: ProjectMeta } => Boolean(slot.project)
  );

  const placed = new Set(center ? [CENTER_SLUG, ...RING.map((s) => s.slug)] : []);
  const overflow = projects.filter((p) => !placed.has(p.slug));

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    function onWindowMouseMove(e: globalThis.MouseEvent) {
      if (!finePointer.matches) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      const max = readCssDeg("--global-tilt-max", 15);
      const lift = readCssPx("--cluster-z", 20);

      rotateX.set(-y * max);
      rotateY.set(x * max);
      clusterZ.set(lift);
    }

    window.addEventListener("mousemove", onWindowMouseMove);
    return () => window.removeEventListener("mousemove", onWindowMouseMove);
  }, [clusterZ, rotateX, rotateY]);

  function updateTilt(clientX: number, clientY: number, element: HTMLDivElement) {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    const max = readCssDeg("--global-tilt-max", 25);

    rotateX.set(-y * max);
    rotateY.set(x * max);
    clusterZ.set(readCssPx("--cluster-z", 20));
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    updateTilt(event.clientX, event.clientY, event.currentTarget);
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    if (touch) updateTilt(touch.clientX, touch.clientY, event.currentTarget);
  }

  function resetTilt() {
    rotateX.set(0);
    rotateY.set(0);
    clusterZ.set(0);
  }

  return (
    <div className="flex flex-col items-center gap-16">
      {center && (
        <motion.div
          className="hex-cluster touch-pan-y transform-gpu will-change-transform"
          data-testid="home-hex-mosaic"
          onPointerMove={handlePointerMove}
          onPointerUp={resetTilt}
          onPointerCancel={resetTilt}
          onPointerLeave={resetTilt}
          onTouchMove={handleTouchMove}
          onTouchEnd={resetTilt}
          onTouchCancel={resetTilt}
          style={{
            rotateX,
            rotateY,
            z: clusterZ,
            transformPerspective: 1200,
            transformStyle: "preserve-3d",
            touchAction: "pan-y",
          }}
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
        </motion.div>
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
