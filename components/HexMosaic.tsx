"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useEffect,
  useRef,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isTouching = useRef(false);
  const isFinePointer = useRef(false);
  const tiltX = useMotionValue(8);
  const tiltY = useMotionValue(-10);
  const depth = useMotionValue(-20);
  const springConfig = { stiffness: 160, damping: 24, mass: 0.55 };
  const rotateX = useSpring(tiltX, springConfig);
  const rotateY = useSpring(tiltY, springConfig);
  const clusterZ = useSpring(depth, springConfig);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const scrollRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8]);
  const scrollRotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-10, 0, 10]);
  const scrollTranslateZ = useTransform(scrollYProgress, [0, 0.5, 1], [-20, 0, -20]);
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const center = bySlug.get(CENTER_SLUG);
  const ring = RING.map((slot) => ({ ...slot, project: bySlug.get(slot.slug) })).filter(
    (slot): slot is (typeof RING)[number] & { project: ProjectMeta } => Boolean(slot.project)
  );

  const placed = new Set(center ? [CENTER_SLUG, ...RING.map((s) => s.slug)] : []);
  const overflow = projects.filter((p) => !placed.has(p.slug));

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointerMode = () => {
      isFinePointer.current = finePointer.matches;
    };
    updatePointerMode();

    function onWindowMouseMove(e: globalThis.MouseEvent) {
      if (!finePointer.matches) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      const max = readCssDeg("--global-tilt-max", 15);
      const lift = readCssPx("--cluster-z", 20);

      tiltX.set(-y * max);
      tiltY.set(x * max);
      depth.set(lift);
    }

    finePointer.addEventListener("change", updatePointerMode);
    window.addEventListener("mousemove", onWindowMouseMove);
    return () => {
      finePointer.removeEventListener("change", updatePointerMode);
      window.removeEventListener("mousemove", onWindowMouseMove);
    };
  }, [depth, tiltX, tiltY]);

  useMotionValueEvent(scrollRotateX, "change", (value) => {
    if (!isTouching.current && !isFinePointer.current) {
      tiltX.set(value);
    }
  });

  useMotionValueEvent(scrollRotateY, "change", (value) => {
    if (!isTouching.current && !isFinePointer.current) {
      tiltY.set(value);
    }
  });

  useMotionValueEvent(scrollTranslateZ, "change", (value) => {
    if (!isTouching.current && !isFinePointer.current) {
      depth.set(value);
    }
  });

  function updateTilt(clientX: number, clientY: number, element: HTMLDivElement) {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    const max = readCssDeg("--global-tilt-max", 25);

    tiltX.set(-y * max);
    tiltY.set(x * max);
    depth.set(readCssPx("--cluster-z", 20));
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    updateTilt(event.clientX, event.clientY, event.currentTarget);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    isTouching.current = true;
    const touch = event.touches[0];
    if (touch) updateTilt(touch.clientX, touch.clientY, event.currentTarget);
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    if (touch) updateTilt(touch.clientX, touch.clientY, event.currentTarget);
  }

  function restoreScrollTilt() {
    isTouching.current = false;
    tiltX.set(scrollRotateX.get());
    tiltY.set(scrollRotateY.get());
    depth.set(scrollTranslateZ.get());
  }

  function resetPointerTilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    tiltX.set(0);
    tiltY.set(0);
    depth.set(0);
  }

  return (
    <div className="flex flex-col items-center gap-16">
      {center && (
        <motion.div
          ref={containerRef}
          className="hex-cluster touch-pan-y transform-gpu will-change-transform"
          data-testid="home-hex-mosaic"
          onPointerMove={handlePointerMove}
          onPointerUp={resetPointerTilt}
          onPointerCancel={resetPointerTilt}
          onPointerLeave={resetPointerTilt}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={restoreScrollTilt}
          onTouchCancel={restoreScrollTilt}
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
