"use client";

import { motion } from "framer-motion";

export default function SpineJunction({ active = false }: { active?: boolean }) {
  return (
    <>
      <svg
        viewBox="0 0 40 2"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 z-[1] h-px w-10 -translate-y-1/2 overflow-visible"
      >
        <path
          d="M0 1 H40"
          fill="none"
          stroke="rgba(16,185,129,0.35)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d="M0 1 H40"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeDasharray="6 10"
          vectorEffect="non-scaling-stroke"
          animate={{ strokeDashoffset: [0, -32], opacity: active ? 1 : 0.55 }}
          transition={{
            strokeDashoffset: { duration: 1.25, repeat: Infinity, ease: "linear" },
            opacity: { duration: 0.25 },
          }}
          className="drop-shadow-[0_0_5px_rgba(52,211,153,0.9)]"
        />
      </svg>
      <div className="pointer-events-none absolute left-0 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2">
        <motion.svg
          viewBox="0 0 16 16"
          aria-hidden
          animate={{ scale: active ? 1.2 : 1, opacity: active ? 1 : 0.6 }}
          className="h-full w-full drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        >
          <polygon
            points="8,1 14,4.5 14,11.5 8,15 2,11.5 2,4.5"
            fill={active ? "#10b981" : "#09090b"}
            stroke={active ? "#6ee7b7" : "#10b981"}
            strokeWidth="1.25"
          />
          {active && <circle cx="8" cy="8" r="2" fill="#020604" />}
        </motion.svg>
      </div>
    </>
  );
}
