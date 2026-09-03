"use client";

import { motion, useMotionValue } from "framer-motion";
import type { PipelineNode } from "@/types/project";
import { useT } from "./LanguageProvider";
import SpineJunction from "./SpineJunction";

interface HexagonNodeCardProps {
  node: PipelineNode;
  index: number;
  total: number;
  active: boolean;
  onOpen: () => void;
}

export default function HexagonNodeCard({
  node,
  index,
  total,
  active,
  onOpen,
}: HexagonNodeCardProps) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const translate = useT();
  const primary = node.primaryTags.length ? node.primaryTags : node.architecture.slice(0, 1);
  const secondary = node.secondaryTags;

  return (
    <motion.article
      id={`stage-node-${index + 1}`}
      initial={{ opacity: 0.25, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.35, margin: "-12% 0px -20% 0px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative scroll-mt-24"
    >
      <SpineJunction active={active} />

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
        className={`group relative ml-10 w-[calc(100%-2.5rem)] bg-gradient-to-br p-px text-left transition-shadow duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 [clip-path:polygon(18px_0,calc(100%-18px)_0,100%_18px,100%_calc(100%-18px),calc(100%-18px)_100%,18px_100%,0_calc(100%-18px),0_18px)] ${
          active
            ? "from-emerald-400/70 via-emerald-500/25 to-emerald-900/50 shadow-[0_20px_70px_rgba(0,255,102,0.09)]"
            : "from-neutral-700 via-neutral-800 to-neutral-900"
        }`}
      >
        <div className="relative overflow-hidden bg-zinc-950/95 p-5 [clip-path:polygon(18px_0,calc(100%-18px)_0,100%_18px,100%_calc(100%-18px),calc(100%-18px)_100%,18px_100%,0_calc(100%-18px),0_18px)] sm:p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-b border-l border-emerald-500/20 bg-emerald-400/[0.04]" />
          <span className="absolute right-4 top-3 z-10 font-mono text-[10px] text-emerald-400/60">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="flex items-center pr-16">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">
              {node.category}
            </span>
          </div>
          <h3 className="mt-4 max-w-lg text-xl font-medium tracking-tight text-white sm:text-2xl">
            {node.title}
          </h3>

          <div className="mt-4 grid gap-3">
            <DetailBlock label={translate("architecture_stack")}>
              <div className="flex flex-wrap gap-1.5">
                {primary.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-full border border-emerald-400/50 bg-emerald-500/15 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                  >
                    {technology}
                  </span>
                ))}
                {secondary.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-full border border-zinc-800 bg-zinc-900/70 px-2 py-1 font-mono text-[10px] text-zinc-500"
                  >
                    {technology}
                  </span>
                ))}
              </div>
            </DetailBlock>
            <DetailBlock label={translate("production_challenge")}>
              <p className="text-sm leading-6 text-zinc-400">{node.problemSolved}</p>
            </DetailBlock>
            <DetailBlock label={translate("engineered_outcome")}>
              <p className="font-mono text-xs leading-5 text-emerald-100/70">
                {node.engineeredOutcome}
              </p>
            </DetailBlock>
          </div>

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

          <span className="mt-5 inline-flex items-center gap-2 text-xs text-zinc-500 transition group-hover:text-emerald-300">
            {translate("open_inspection")} <span aria-hidden>↗</span>
          </span>
        </div>
      </motion.button>
    </motion.article>
  );
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 border-l border-emerald-500/25 bg-black/20 px-3 py-2.5">
      <p className="mb-2 font-mono text-[9px] tracking-[0.16em] text-emerald-400">{label}</p>
      {children}
    </section>
  );
}
