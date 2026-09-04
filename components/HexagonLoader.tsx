"use client";

import { motion } from "framer-motion";

export default function HexagonLoader({
  status = "LOADING PROJECT PIPELINE AGENT...",
  fullscreen = true,
}: {
  status?: string;
  fullscreen?: boolean;
}) {
  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-[110] flex h-screen w-screen flex-col items-center justify-center bg-black"
          : "flex flex-col items-center justify-center"
      }
      role="status"
      aria-live="polite"
    >
      <div className="h-24 w-24 [perspective:1000px]">
        <motion.div
          initial={{ rotateY: 0, rotateX: 15 }}
          animate={{ rotateY: 360, rotateX: 15 }}
          transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
          className="relative h-full w-full transform-gpu [transform-style:preserve-3d] will-change-transform"
        >
          {[0, 90, 180].map((rotation) => (
            <div
              key={rotation}
              className="pointer-events-none absolute inset-0 bg-emerald-400 p-[2px] shadow-[0_0_36px_rgba(16,185,129,0.6)] [backface-visibility:hidden] [clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)]"
              style={{ transform: `rotateY(${rotation}deg) translateZ(8px)` }}
            >
              <div className="relative h-full w-full bg-zinc-950 [clip-path:inherit]">
                <div className="absolute inset-5 border border-emerald-300/70 [clip-path:inherit]" />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      <p className="mt-7 animate-pulse font-mono text-xs tracking-wider text-emerald-400">
        {status}
      </p>
    </div>
  );
}
