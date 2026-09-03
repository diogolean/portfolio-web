"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { PipelineNode } from "@/types/project";
import { useT } from "./LanguageProvider";
import NodeDeepDiveModal from "./NodeDeepDiveModal";

export default function StandardPipelineCanvas({ nodes }: { nodes: PipelineNode[] }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);
  const translate = useT();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !selectedNode) setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, selectedNode]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-emerald-500/40 bg-emerald-500/[0.07] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300 transition hover:bg-emerald-500/15"
      >
        ⬡ {translate("explore_pipeline")}
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-8">
            <motion.button
              type="button"
              aria-label="Close pipeline canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-lg"
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Interactive project pipeline canvas"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative max-h-[92vh] w-full max-w-7xl overflow-auto border border-emerald-500/40 bg-zinc-950 p-5 shadow-[0_0_120px_rgba(16,185,129,0.13)] sm:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">
                    Standard architecture canvas
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Project execution data flow
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 w-10 rounded-full border border-zinc-700 text-zinc-400 hover:border-emerald-500/50 hover:text-white"
                  aria-label="Close canvas"
                >
                  ×
                </button>
              </div>

              <div className="relative mt-8 overflow-hidden border border-zinc-800 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:28px_28px] p-5 sm:p-8">
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 1000 500"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    <filter id="wire-glow">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <motion.path
                    d="M40 250 C180 100 300 400 440 250 S700 100 960 250"
                    fill="none"
                    stroke="rgba(16,185,129,0.55)"
                    strokeWidth="2"
                    filter="url(#wire-glow)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, ease: "easeInOut" }}
                  />
                </svg>

                <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {nodes.map((node, index) => (
                    <motion.button
                      key={node.id}
                      type="button"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07 }}
                      onClick={() => setSelectedNode(node)}
                      className="group border border-emerald-500/30 bg-zinc-950/90 p-5 text-left backdrop-blur transition hover:-translate-y-1 hover:border-emerald-400/70 hover:shadow-[0_12px_45px_rgba(16,185,129,0.12)]"
                    >
                      <span className="font-mono text-[10px] text-emerald-400">
                        {String(index + 1).padStart(2, "0")} / {node.category}
                      </span>
                      <h3 className="mt-3 text-base font-medium text-white">{node.title}</h3>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-400">
                        {node.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {(node.primaryTags.length ? node.primaryTags : node.tags.slice(0, 4)).map((tag) => (
                          <span
                            key={tag}
                            className="border border-emerald-500/20 px-2 py-1 font-mono text-[9px] text-emerald-200/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.section>
          </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <NodeDeepDiveModal node={selectedNode} onClose={() => setSelectedNode(null)} />
    </>
  );
}
