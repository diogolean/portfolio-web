"use client";

import { useMemo, useState } from "react";
import type { PipelineNode } from "@/types/project";
import { getProjectHighlights } from "@/lib/highlight-terms";
import { useT } from "./LanguageProvider";
import NodeDeepDiveModal from "./NodeDeepDiveModal";
import StandardPipelineCanvas from "./StandardPipelineCanvas";

interface ProjectHeaderControlsProps {
  nodes: PipelineNode[];
  stack: string[];
  processingTime: string;
}

function matchingNode(technology: string, nodes: PipelineNode[]) {
  const tokens = technology
    .toLowerCase()
    .split(/[^a-z0-9.]+/)
    .filter((token) => token.length > 2 && !["default", "optional", "pipeline"].includes(token));

  return (
    nodes
      .map((node) => {
        const haystack = `${node.title} ${node.description} ${node.tags.join(" ")}`.toLowerCase();
        return { node, score: tokens.filter((token) => haystack.includes(token)).length };
      })
      .sort((a, b) => b.score - a.score)[0]?.node ?? nodes[0]
  );
}

export default function ProjectHeaderControls({
  nodes,
  stack,
  processingTime,
}: ProjectHeaderControlsProps) {
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);
  const translate = useT();
  const highlightStack = useMemo(
    () => getProjectHighlights("", stack).slice(0, 5),
    [stack]
  );
  const stageBadges = useMemo(
    () => nodes.map((node, index) => ({ node, index, label: node.title })),
    [nodes]
  );

  function scrollToNode(index: number) {
    document
      .getElementById(`stage-node-${index + 1}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] text-accent">
          {nodes.length} {translate("real_stages")}
        </span>
        <span className="font-mono text-[10px] text-neutral-500">{processingTime}</span>
        {highlightStack.map((technology) => (
          <button
            key={technology}
            type="button"
            onClick={() => setSelectedNode(matchingNode(technology, nodes))}
            className="rounded-full border border-neutral-700 bg-black/20 px-2 py-1 font-mono text-[9px] text-neutral-300 transition hover:border-emerald-500/50 hover:text-emerald-300"
          >
            {technology}
          </button>
        ))}
        <div className="ml-auto">
          <StandardPipelineCanvas nodes={nodes} />
        </div>
      </div>

      <nav aria-label="Pipeline stage shortcuts" className="mt-3 flex flex-wrap gap-2">
        {stageBadges.map(({ label, node, index }) => (
          <button
            key={node.id}
            type="button"
            onClick={() => scrollToNode(index)}
            className="border border-zinc-700 px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] text-zinc-400 transition hover:border-emerald-500/50 hover:text-emerald-300"
          >
            {String(index + 1).padStart(2, "0")} · {label}
          </button>
        ))}
      </nav>

      <NodeDeepDiveModal node={selectedNode} onClose={() => setSelectedNode(null)} />
    </>
  );
}
