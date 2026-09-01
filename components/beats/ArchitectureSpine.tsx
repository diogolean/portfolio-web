"use client";

import { motion } from "framer-motion";
import type { ProjectArchitecture } from "@/lib/types";

interface ArchitectureSpineProps {
  architecture: ProjectArchitecture | null;
}

export default function ArchitectureSpine({ architecture }: ArchitectureSpineProps) {
  if (!architecture) return null;

  const nodes = architecture.milestones?.length
    ? [...architecture.milestones].sort((a, b) => a.t_s - b.t_s).map((m) => m.event)
    : architecture.pipeline_stages.map((s) => s.label);

  const patterns = architecture.design_patterns?.filter((p) => p.applied) ?? [];

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-32">
      <h2 className="text-sm text-muted">Architecture spine</h2>

      <ol className="relative flex flex-col gap-8 border-l border-hairline pl-8">
        {nodes.map((node, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative text-sm text-foreground"
          >
            <span className="absolute -left-[2.15rem] top-1 h-2 w-2 rounded-full bg-accent" />
            {node}
          </motion.li>
        ))}
      </ol>

      {patterns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {patterns.map((p) => (
            <span
              key={p.name}
              className="rounded-full border border-hairline px-3 py-1 font-mono text-[10px] text-muted"
              title={p.where}
            >
              {p.name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
