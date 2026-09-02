"use client";

import { motion, useMotionValue } from "framer-motion";
import type { PipelineNode } from "@/types/project";

interface HexagonNodeCardProps {
  node: PipelineNode;
  index: number;
  total: number;
  active: boolean;
  onActivate: () => void;
  onOpen: () => void;
}

export default function HexagonNodeCard({
  node,
  index,
  total,
  active,
  onActivate,
  onOpen,
}: HexagonNodeCardProps) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  return (
    <motion.article
      initial={{ opacity: 0.25, scale: 0.95, y: 18 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ amount: 0.48, margin: "-8% 0px -18% 0px" }}
      onViewportEnter={onActivate}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-14 sm:pl-20"
    >
      <motion.span
        animate={{
          scale: active ? 1.2 : 1,
          backgroundColor: active ? "#00ff66" : "#18181b",
          borderColor: active ? "#00ff66" : "#3f3f46",
        }}
        className="absolute left-[0.78rem] top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border sm:left-[1.28rem]"
      >
        {active && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
      </motion.span>

      <motion.button
        type="button"
        onClick={onOpen}
        aria-label={`Inspect ${node.title}`}
        style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: "preserve-3d" }}
        onMouseMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          rotateY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 8);
          rotateX.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -8);
        }}
        onMouseLeave={() => {
          rotateX.set(0);
          rotateY.set(0);
        }}
        className={`group relative w-full bg-gradient-to-br p-px text-left transition-shadow duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 [clip-path:polygon(18px_0,calc(100%-18px)_0,100%_18px,100%_calc(100%-18px),calc(100%-18px)_100%,18px_100%,0_calc(100%-18px),0_18px)] ${
          active
            ? "from-emerald-400/70 via-emerald-500/25 to-emerald-900/50 shadow-[0_20px_70px_rgba(0,255,102,0.09)]"
            : "from-neutral-700 via-neutral-800 to-neutral-900"
        }`}
      >
        <div className="relative overflow-hidden bg-zinc-950/95 p-5 [clip-path:polygon(18px_0,calc(100%-18px)_0,100%_18px,100%_calc(100%-18px),calc(100%-18px)_100%,18px_100%,0_calc(100%-18px),0_18px)] sm:p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-b border-l border-emerald-500/20 bg-emerald-400/[0.04]" />
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">
              {node.category}
            </span>
            <span className="font-mono text-xs text-zinc-600">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
          <h3 className="mt-4 max-w-lg text-xl font-medium tracking-tight text-white sm:text-2xl">
            {node.title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">{node.description}</p>

          <div className="mt-4 grid gap-3 border-t border-zinc-800 pt-4 font-mono text-xs sm:grid-cols-2">
            <div>
              <span className="text-zinc-600">IN</span>
              <p className="mt-1 truncate text-zinc-300">{node.ioContract.input}</p>
            </div>
            <div>
              <span className="text-zinc-600">OUT</span>
              <p className="mt-1 truncate text-zinc-300">{node.ioContract.output}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {node.tags.slice(0, 4).map((technology) => (
              <span
                key={technology}
                className="border border-emerald-500/25 bg-emerald-500/[0.05] px-2.5 py-1 font-mono text-[10px] text-zinc-400"
              >
                {technology}
              </span>
            ))}
          </div>
          <span className="mt-5 inline-flex items-center gap-2 text-xs text-zinc-500 transition group-hover:text-emerald-300">
            Open technical inspection <span aria-hidden>↗</span>
          </span>
        </div>
      </motion.button>
    </motion.article>
  );
}
