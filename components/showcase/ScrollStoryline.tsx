"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import type { ProjectMediaAsset } from "@/lib/media-discovery";
import type { PipelineNode } from "@/types/project";
import { useT } from "./LanguageProvider";
import ArchitectureCanvas from "./ArchitectureCanvas";
import HexagonNodeCard from "./HexagonNodeCard";
import Interactive916Player from "./Interactive916Player";
import MicroMosaicCloud from "./MicroMosaicCloud";
import NodeDeepDiveModal from "./NodeDeepDiveModal";
import SpineJunction from "./SpineJunction";
import TimelineSpine from "./TimelineSpine";

interface ScrollStorylineProps {
  slug: string;
  nodes: PipelineNode[];
  media: ProjectMediaAsset[];
}

export default function ScrollStoryline({ slug, nodes, media }: ScrollStorylineProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);
  const closeModal = useCallback(() => setSelectedNode(null), []);
  const translate = useT();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 65%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.25 });
  const spineScale = useTransform(progress, [0, 1], [0, 1]);
  const activeNode = nodes[activeIndex] ?? nodes[0];

  return (
    <section ref={containerRef} className="relative px-5 pb-20 pt-2 sm:px-8 lg:px-12 lg:pb-28">
      <div className="relative z-10 mx-auto max-w-[1500px]">
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10 xl:gap-14">
          <div className="relative overflow-visible lg:sticky lg:top-4">
            <div className="relative flex w-full flex-col items-center overflow-visible pt-2">
              <MicroMosaicCloud node={activeNode}>
                <Interactive916Player
                  assets={media}
                  slug={slug}
                  activeNode={activeNode}
                  activeIndex={activeIndex}
                />
              </MicroMosaicCloud>
              <div className="mx-auto mt-3 hidden w-full max-w-lg lg:block">
                <ArchitectureCanvas nodes={nodes} activeIndex={activeIndex} />
              </div>
            </div>
          </div>

          <div className="relative">
            <div id="execution-graph-axis" className="relative space-y-6 pb-8">
              <TimelineSpine progress={spineScale} />

              <ExecutionGraphHeader
                eyebrow={translate("execution_graph")}
                title={translate("follow_data_path")}
                hint={translate("execution_graph_hint")}
                total={nodes.length}
              />

              {nodes.map((item, index) => (
                <HexagonNodeCard
                  key={item.id}
                  node={item}
                  index={index}
                  total={nodes.length}
                  active={index === activeIndex}
                  onActivate={() => setActiveIndex(index)}
                  onOpen={() => {
                    setActiveIndex(index);
                    setSelectedNode(item);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <NodeDeepDiveModal node={selectedNode} onClose={closeModal} />
    </section>
  );
}

function ExecutionGraphHeader({
  eyebrow,
  title,
  hint,
  total,
}: {
  eyebrow: string;
  title: string;
  hint: string;
  total: number;
}) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  return (
    <article className="relative">
      <SpineJunction active />

      <motion.div
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
        className="relative ml-10 w-[calc(100%-2.5rem)] bg-gradient-to-br from-emerald-400/70 via-emerald-500/25 to-emerald-900/50 p-px text-left shadow-[0_20px_70px_rgba(0,255,102,0.09)] [clip-path:polygon(18px_0,calc(100%-18px)_0,100%_18px,100%_calc(100%-18px),calc(100%-18px)_100%,18px_100%,0_calc(100%-18px),0_18px)]"
      >
        <div className="relative overflow-hidden bg-zinc-950/95 p-5 [clip-path:polygon(18px_0,calc(100%-18px)_0,100%_18px,100%_calc(100%-18px),calc(100%-18px)_100%,18px_100%,0_calc(100%-18px),0_18px)] sm:p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-b border-l border-emerald-500/20 bg-emerald-400/[0.04]" />
          <span className="absolute right-4 top-3 z-10 font-mono text-[10px] text-emerald-400/60">
            00 / {String(total).padStart(2, "0")}
          </span>
          <div className="flex items-center pr-16">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
              {eyebrow}
            </p>
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 text-xs leading-5 text-neutral-400">{hint}</p>
        </div>
      </motion.div>
    </article>
  );
}
