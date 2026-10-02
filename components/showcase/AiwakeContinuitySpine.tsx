"use client";

import { motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";

interface Branch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}

interface Geom {
  width: number;
  height: number;
  x: number;
  y1: number;
  y2: number;
  branches: Branch[];
  terminus: { x: number; y: number; label: string };
}

export default function AiwakeContinuitySpine() {
  const [geom, setGeom] = useState<Geom | null>(null);

  useLayoutEffect(() => {
    const root = document.getElementById("aiwake-schematic");
    const axis = document.getElementById("execution-graph-axis");
    if (!root || !axis) return;

    const measure = () => {
      const rootRect = root.getBoundingClientRect();
      const axisRect = axis.getBoundingClientRect();
      const spineX = axisRect.left - rootRect.left;
      const branches = Array.from(root.querySelectorAll<HTMLElement>("[data-spine-branch]")).map(
        (node) => {
          const rect = node.getBoundingClientRect();
          const y = rect.top - rootRect.top + rect.height / 2;
          const center = rect.left - rootRect.left + rect.width / 2;
          const nodeOnLeft = center < spineX;
          const edge = nodeOnLeft ? rect.right - rootRect.left : rect.left - rootRect.left;
          const end = nodeOnLeft ? Math.min(edge + 1, spineX - 14) : Math.max(edge - 1, spineX + 14);
          return {
            x1: spineX,
            y1: y,
            x2: end,
            y2: y,
            label: node.dataset.spineBranch ?? "",
          };
        }
      );
      const terminusEl = root.querySelector<HTMLElement>("[data-spine-terminus]");
      const terminusRect = terminusEl?.getBoundingClientRect();
      const socketY = terminusRect ? terminusRect.top - rootRect.top : rootRect.height;
      const originsLeft = terminusRect ? terminusRect.left - rootRect.left : spineX;
      const originsRight = terminusRect ? terminusRect.right - rootRect.left : spineX;
      const socketX =
        spineX < originsLeft - 2 ? originsLeft : spineX > originsRight + 2 ? originsRight : spineX;

      setGeom({
        width: Math.max(1, rootRect.width),
        height: Math.max(1, rootRect.height),
        x: spineX,
        y1: axisRect.bottom - rootRect.top - 1,
        y2: socketY,
        branches,
        terminus: {
          x: socketX,
          y: socketY + 8,
          label: terminusEl?.dataset.spineTerminus ?? "Foundation",
        },
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(axis);
    for (const node of root.querySelectorAll<HTMLElement>("[data-spine-branch], [data-spine-terminus]")) {
      observer.observe(node);
    }
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  if (!geom || geom.y2 <= geom.y1) return null;

  const trunk = `M ${geom.x} ${geom.y1} V ${geom.y2} H ${geom.terminus.x} V ${geom.terminus.y}`;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${geom.width} ${geom.height}`}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
    >
      <path d={trunk} fill="none" stroke="rgba(16,185,129,0.45)" strokeWidth="1.5" />
      <path
        d={trunk}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        className="drop-shadow-[0_0_8px_rgba(52,211,153,0.95)]"
      />
      <motion.path
        d={trunk}
        fill="none"
        stroke="rgba(167,243,208,0.95)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="10 24"
        animate={{ strokeDashoffset: [0, -68] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "linear" }}
        className="drop-shadow-[0_0_6px_rgba(52,211,153,0.75)]"
      />
      {geom.branches.map((branch) => {
        const path = `M ${branch.x1} ${branch.y1} H ${branch.x2}`;
        return (
          <g key={branch.label}>
            <path d={path} fill="none" stroke="rgba(16,185,129,0.45)" strokeWidth="1.5" />
            <path
              d={path}
              fill="none"
              stroke="#34d399"
              strokeWidth="1.5"
              className="drop-shadow-[0_0_5px_rgba(52,211,153,0.9)]"
            />
            <HexNode x={branch.x2} y={branch.y2} />
          </g>
        );
      })}
      <HexNode x={geom.terminus.x} y={geom.y2} />
      <text
        x={geom.terminus.x}
        y={geom.y2 - 16}
        textAnchor="middle"
        fill="#67e8f9"
        fontSize="9"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        letterSpacing="1.4"
      >
        {geom.terminus.label.toUpperCase()}
      </text>
    </svg>
  );
}

function HexNode({ x, y }: { x: number; y: number }) {
  const radius = 7;
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    return `${x + radius * Math.cos(angle)},${y + radius * Math.sin(angle)}`;
  }).join(" ");

  return (
    <polygon
      points={points}
      fill="#09090b"
      stroke="#6ee7b7"
      strokeWidth="1.25"
      className="drop-shadow-[0_0_8px_rgba(16,185,129,0.55)]"
    />
  );
}
