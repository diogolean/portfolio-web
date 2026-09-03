"use client";

import { motion } from "framer-motion";

export default function SpineJunction({
  active = false,
  lineActive = active,
}: {
  active?: boolean;
  lineActive?: boolean;
}) {
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
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d="M0 1 H40"
          fill="none"
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={{ pathLength: lineActive ? 1 : 0, opacity: lineActive ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={lineActive ? "drop-shadow-[0_0_5px_rgba(52,211,153,0.9)]" : ""}
        />
      </svg>
      <div className="pointer-events-none absolute left-0 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2">
        <motion.svg
          viewBox="0 0 16 16"
          aria-hidden
          animate={{ scale: active ? 1.2 : 1, opacity: active ? 1 : 0.25 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`h-full w-full ${
            active ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : ""
          }`}
        >
          <polygon
            points="8,1 14,4.5 14,11.5 8,15 2,11.5 2,4.5"
            fill={active ? "#10b981" : "#09090b"}
            stroke={active ? "#6ee7b7" : "rgba(255,255,255,0.28)"}
            strokeWidth="1.25"
          />
          {active && <circle cx="8" cy="8" r="2" fill="#020604" />}
        </motion.svg>
      </div>
    </>
  );
}
