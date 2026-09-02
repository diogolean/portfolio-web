"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import type { PipelineNode } from "@/types/project";

interface NodeDeepDiveModalProps {
  node: PipelineNode | null;
  onClose: () => void;
}

export default function NodeDeepDiveModal({ node, onClose }: NodeDeepDiveModalProps) {
  useEffect(() => {
    if (!node) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [node, onClose]);

  return (
    <AnimatePresence>
      {node && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8">
          <motion.button
            type="button"
            aria-label="Close node deep dive"
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="node-deep-dive-title"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto border border-emerald-500/40 bg-zinc-950/95 shadow-[0_0_100px_rgba(16,185,129,0.14)] backdrop-blur-2xl [clip-path:polygon(20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px)]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-500/20 bg-zinc-950/90 px-6 py-4 backdrop-blur-xl">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
                {node.category} / node inspection
              </span>
              <button
                type="button"
                onClick={onClose}
                autoFocus
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-emerald-500/50 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="p-6 sm:p-9">
              <h2 id="node-deep-dive-title" className="text-3xl font-semibold text-white">
                {node.title}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{node.description}</p>

              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <Panel title="I/O contract schema">
                  <pre className="overflow-x-auto font-mono text-xs leading-6 text-emerald-100/75">
                    {JSON.stringify(
                      {
                        input: { type: node.ioContract.input, required: true },
                        output: { type: node.ioContract.output, validated: true },
                      },
                      null,
                      2
                    )}
                  </pre>
                </Panel>

                <Panel title="Execution snippet">
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 text-zinc-300">
                    {`const result = await pipeline.execute("${node.id}", {\n  input,\n  validate: true,\n  trace: "${node.category.toLowerCase()}"\n});`}
                  </pre>
                </Panel>

                <Panel title="Prompt & hyperparameters">
                  <div className="flex flex-wrap gap-2">
                    {node.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-1.5 font-mono text-xs text-emerald-200/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-zinc-400">
                    {JSON.stringify(node.payloadSample ?? { mode: "deterministic" }, null, 2)}
                  </pre>
                </Panel>

                <Panel title={`Latency profile / ${node.latency ?? "runtime"}`}>
                  <div className="flex h-32 items-end gap-2">
                    {[32, 48, 74, 42, 88, 58, 67, 39, 81, 52].map((height, index) => (
                      <motion.span
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: index * 0.04, duration: 0.45 }}
                        className="flex-1 bg-gradient-to-t from-emerald-900 to-emerald-400"
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between font-mono text-[10px] text-zinc-600">
                    <span>P50</span>
                    <span>P95</span>
                    <span>P99</span>
                  </div>
                </Panel>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-zinc-800 bg-black/45 p-5 [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]">
      <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">{title}</h3>
      {children}
    </section>
  );
}
