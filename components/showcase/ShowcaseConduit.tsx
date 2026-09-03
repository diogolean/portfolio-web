"use client";

import { motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";

interface ConduitGeometry {
  width: number;
  height: number;
  path: string;
}

export default function ShowcaseConduit() {
  const [geometry, setGeometry] = useState<ConduitGeometry | null>(null);

  useLayoutEffect(() => {
    const root = document.getElementById("project-showcase-root");
    const hero = document.getElementById("project-hero-card");
    const graph = document.getElementById("execution-graph-axis");
    if (!root || !hero || !graph) return;

    const update = () => {
      const rootRect = root.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const graphRect = graph.getBoundingClientRect();
      const startX = heroRect.left + heroRect.width / 2 - rootRect.left;
      const startY = heroRect.bottom - rootRect.top;
      const endX = graphRect.left - rootRect.left;
      const endY = graphRect.top - rootRect.top;
      const travel = Math.max(48, endY - startY);
      const bend = Math.min(140, travel * 0.46);

      setGeometry({
        width: root.scrollWidth,
        height: root.scrollHeight,
        path: `M ${startX} ${startY} C ${startX} ${startY + bend}, ${endX} ${
          endY - bend
        }, ${endX} ${endY}`,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    observer.observe(hero);
    observer.observe(graph);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!geometry) return null;

  return (
    <svg
      width={geometry.width}
      height={geometry.height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-[1] overflow-visible"
    >
      <path
        d={geometry.path}
        fill="none"
        stroke="rgba(16,185,129,0.28)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        className="drop-shadow-[0_0_5px_rgba(16,185,129,0.45)]"
      />
      <motion.path
        d={geometry.path}
        fill="none"
        stroke="#34d399"
        strokeWidth="1.5"
        strokeDasharray="8 13"
        vectorEffect="non-scaling-stroke"
        animate={{ strokeDashoffset: [0, -42] }}
        transition={{ duration: 1.55, repeat: Infinity, ease: "linear" }}
        className="drop-shadow-[0_0_6px_rgba(52,211,153,0.95)]"
      />
    </svg>
  );
}
