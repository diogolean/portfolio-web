"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { PipelineNode } from "@/types/project";

type InspectorMode = "contract" | "payload" | "latency";

interface ArchitectureCanvasProps {
  nodes: PipelineNode[];
  activeIndex: number;
}

export default function ArchitectureCanvas({ nodes, activeIndex }: ArchitectureCanvasProps) {
  const [mode, setMode] = useState<InspectorMode>("contract");
  const activeNode = nodes[activeIndex] ?? nodes[0];
  const width = 720;
  const y = 72;
  const startX = 70;
  const endX = width - 70;
  const step = nodes.length > 1 ? (endX - startX) / (nodes.length - 1) : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/85">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_#00ff66]" />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500">
            Architecture runtime
          </span>
        </div>
        <span className="font-mono text-[9px] text-neutral-700">
          {String(activeIndex + 1).padStart(2, "0")} / {String(nodes.length).padStart(2, "0")}
        </span>
      </div>

      <div className="relative h-36 overflow-hidden bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]">
        <svg
          viewBox={`0 0 ${width} 144`}
          className="h-full w-full"
          role="img"
          aria-label="Project architecture node graph"
        >
          {nodes.slice(0, -1).map((item, index) => {
            const active = index < activeIndex;
            return (
              <motion.path
                key={`${item.id}-edge`}
                d={`M ${startX + index * step + 18} ${y} L ${startX + (index + 1) * step - 18} ${y}`}
                fill="none"
                stroke={active ? "#00ff66" : "#27272a"}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: active ? 1 : 0.35 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
            );
          })}
          {nodes.map((item, index) => {
            const x = startX + index * step;
            const active = index === activeIndex;
            const complete = index < activeIndex;
            return (
              <g key={item.id}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={active ? 17 : 13}
                  fill={active ? "rgba(0,255,102,0.13)" : complete ? "#10261a" : "#0b0d10"}
                  stroke={active || complete ? "#00ff66" : "#3f3f46"}
                  strokeWidth={active ? 2 : 1}
                  animate={{
                    r: active ? [16, 18, 16] : 13,
                    opacity: active ? 1 : complete ? 0.8 : 0.45,
                  }}
                  transition={
                    active
                      ? { r: { duration: 2, repeat: Infinity }, opacity: { duration: 0.25 } }
                      : { duration: 0.25 }
                  }
                />
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fill={active || complete ? "#00ff66" : "#71717a"}
                  fontSize="8"
                  fontFamily="var(--font-plex-mono)"
                >
                  {String(index + 1).padStart(2, "0")}
                </text>
                <text
                  x={x}
                  y={y + 36}
                  textAnchor="middle"
                  fill={active ? "#e4e4e7" : "#52525b"}
                  fontSize="7"
                  fontFamily="var(--font-plex-mono)"
                >
                  {item.category}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="border-t border-neutral-800 p-4">
        <div className="flex flex-wrap gap-1.5">
          {(["contract", "payload", "latency"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`rounded-md border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider transition ${
                mode === option
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-neutral-800 text-neutral-600 hover:text-neutral-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeNode.id}-${mode}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-4 min-h-20 rounded-lg border border-neutral-900 bg-black/40 p-3"
          >
            <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
              {activeNode.title} / {mode}
            </p>
            {mode === "payload" ? (
              <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap font-mono text-[9px] leading-5 text-neutral-400">
                {JSON.stringify(activeNode.payloadSample ?? activeNode.ioContract, null, 2)}
              </pre>
            ) : (
              <p className="mt-2 font-mono text-[10px] leading-5 text-neutral-300">
                {mode === "contract"
                  ? `${activeNode.ioContract.input} → ${activeNode.ioContract.output}`
                  : (activeNode.latency ?? "Measured at runtime")}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
