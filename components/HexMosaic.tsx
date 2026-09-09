"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  useEffect,
  useRef,
} from "react";
import type { ProjectMeta } from "@/lib/types";
import HexCard from "./HexCard";

interface HexMosaicProps {
  projects: ProjectMeta[];
  onNavigate?: (slug: string) => void;
  launchingSlug?: string | null;
}

const CENTER_SLUG = "aiwake";

interface MosaicTilt {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  z: MotionValue<number>;
}

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
  const tiltFrame = useRef<number | null>(null);
  const pendingPointer = useRef<{
    clientX: number;
    clientY: number;
  } | null>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const depth = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 25, mass: 0.55 };
  const rotateX = useSpring(tiltX, springConfig);
  const rotateY = useSpring(tiltY, springConfig);
  const clusterZ = useSpring(depth, springConfig);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const scrollRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [12, 0, -12]);
  const scrollRotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-14, 0, 14]);
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
    const trackMouse = (event: MouseEvent) => {
      if (!finePointer.matches) return;
      scheduleViewportTilt(event.clientX, event.clientY);
    };
    const trackTouch = (event: globalThis.TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      isTouching.current = true;
      scheduleViewportTilt(touch.clientX, touch.clientY);
    };
    const releaseTouch = () => {
      isTouching.current = false;
      pendingPointer.current = null;
      tiltX.set(scrollRotateX.get());
      tiltY.set(scrollRotateY.get());
      depth.set(scrollTranslateZ.get());
    };
    updatePointerMode();

    finePointer.addEventListener("change", updatePointerMode);
    window.addEventListener("mousemove", trackMouse, { passive: true });
    window.addEventListener("touchstart", trackTouch, { passive: true });
    window.addEventListener("touchmove", trackTouch, { passive: true });
    window.addEventListener("touchend", releaseTouch, { passive: true });
    window.addEventListener("touchcancel", releaseTouch, { passive: true });
    return () => {
      finePointer.removeEventListener("change", updatePointerMode);
      window.removeEventListener("mousemove", trackMouse);
      window.removeEventListener("touchstart", trackTouch);
      window.removeEventListener("touchmove", trackTouch);
      window.removeEventListener("touchend", releaseTouch);
      window.removeEventListener("touchcancel", releaseTouch);
      if (tiltFrame.current !== null) cancelAnimationFrame(tiltFrame.current);
    };
  }, [depth, scrollRotateX, scrollRotateY, scrollTranslateZ, tiltX, tiltY]);

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

  function updateViewportTilt(clientX: number, clientY: number) {
    const halfWidth = Math.max(1, window.innerWidth / 2);
    const halfHeight = Math.max(1, window.innerHeight / 2);
    const xNorm = Math.max(-1, Math.min(1, (clientX - halfWidth) / halfWidth));
    const yNorm = Math.max(-1, Math.min(1, (clientY - halfHeight) / halfHeight));
    const max = readCssDeg("--global-tilt-max", 15);

    tiltX.set(-yNorm * max);
    tiltY.set(xNorm * max);
    depth.set(readCssPx("--cluster-z", 20));
  }

  function scheduleViewportTilt(clientX: number, clientY: number) {
    pendingPointer.current = {
      clientX,
      clientY,
    };
    if (tiltFrame.current !== null) return;
    tiltFrame.current = requestAnimationFrame(() => {
      const pointer = pendingPointer.current;
      tiltFrame.current = null;
      if (pointer) updateViewportTilt(pointer.clientX, pointer.clientY);
    });
  }

  const mosaicTilt: MosaicTilt = {
    rotateX,
    rotateY,
    z: clusterZ,
  };

  return (
    <div className="flex flex-col items-center gap-16">
      {center && (
        <motion.div
          ref={containerRef}
          className="hex-cluster touch-pan-y transform-gpu will-change-transform"
          data-testid="home-hex-mosaic"
          style={{ touchAction: "pan-y" }}
        >
          <RingSlot
            project={center}
            dx={0}
            dy={0}
            onNavigate={onNavigate}
            launchingSlug={launchingSlug}
            mosaicTilt={mosaicTilt}
          />
          {ring.map((slot) => (
            <RingSlot
              key={slot.slug}
              project={slot.project}
              dx={slot.dx}
              dy={slot.dy}
              onNavigate={onNavigate}
              launchingSlug={launchingSlug}
              mosaicTilt={mosaicTilt}
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
  mosaicTilt: MosaicTilt;
}

function RingSlot({
  project,
  dx,
  dy,
  onNavigate,
  launchingSlug,
  mosaicTilt,
}: RingSlotProps) {
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
        mosaicTilt={mosaicTilt}
      />
    </div>
  );
}
