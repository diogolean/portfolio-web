"use client";

import { motion } from "framer-motion";

export default function HexTransitionLoader({
  status = "INITIALIZING PIPELINE AGENT...",
  fullscreen = true,
}: {
  status?: string;
  fullscreen?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center bg-[#050708]/95 backdrop-blur-xl ${
        fullscreen ? "fixed inset-0 z-[100]" : "min-h-72"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="relative h-24 w-24 [perspective:800px]">
        <motion.div
          animate={{ rotateX: [0, 220, 360], rotateY: [0, -300, -720], rotateZ: [0, 160, 360] }}
          transition={{ duration: 1.35, repeat: Infinity, ease: [0.7, 0, 0.3, 1] }}
          className="absolute inset-0 bg-emerald-400 p-[2px] shadow-[0_0_45px_rgba(16,185,129,0.65)] [clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)] [transform-style:preserve-3d]"
        >
          <div className="h-full w-full bg-zinc-950 [clip-path:inherit]">
            <div className="absolute inset-5 border border-emerald-400/70 [clip-path:inherit]" />
          </div>
        </motion.div>
        <motion.div
          animate={{ scale: [0.75, 1.35], opacity: [0.45, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="absolute inset-0 border border-emerald-400 [clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)]"
        />
      </div>
      <p className="mt-8 font-mono text-xs font-medium tracking-[0.2em] text-emerald-300">
        {status}
      </p>
      <div className="mt-3 h-px w-52 overflow-hidden bg-zinc-800">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-1/2 bg-emerald-400 shadow-[0_0_10px_#10b981]"
        />
      </div>
    </motion.div>
  );
}
