"use client";

import { motion, type MotionValue } from "framer-motion";

export default function TimelineSpine({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="pointer-events-none absolute bottom-8 left-0 top-0 w-0 -translate-x-1/2 overflow-visible">
      <svg
        viewBox="0 0 2 100"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-y-0 left-1/2 h-full w-0.5 -translate-x-1/2 overflow-visible"
      >
        <path
          d="M1 0 V100"
          fill="none"
          stroke="rgba(16,185,129,0.3)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          className="drop-shadow-[0_0_5px_rgba(16,185,129,0.45)]"
        />
        <motion.path
          d="M1 0 V100"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeDasharray="7 12"
          vectorEffect="non-scaling-stroke"
          animate={{ strokeDashoffset: [0, -38] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="drop-shadow-[0_0_6px_rgba(52,211,153,0.95)]"
        />
      </svg>
      <motion.span
        style={{ scaleY: progress }}
        className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 origin-top bg-emerald-300/70 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
      />
    </div>
  );
}
