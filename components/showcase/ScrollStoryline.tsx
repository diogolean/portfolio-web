"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import type { ProjectMediaAsset } from "@/lib/media-discovery";
import type { PipelineNode } from "@/types/project";
import ArchitectureCanvas from "./ArchitectureCanvas";
import HexagonNodeCard from "./HexagonNodeCard";
import Interactive916Player from "./Interactive916Player";
import MicroMosaicCloud from "./MicroMosaicCloud";
import NodeDeepDiveModal from "./NodeDeepDiveModal";

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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 65%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.25 });
  const spineScale = useTransform(progress, [0, 1], [0, 1]);
  const activeNode = nodes[activeIndex] ?? nodes[0];

  return (
    <section ref={containerRef} className="relative px-5 pb-20 pt-6 sm:px-8 lg:px-12 lg:pb-28">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7 max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
            Scroll-linked execution graph
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Follow the real data path.
          </h2>
          <p className="mt-5 text-sm leading-7 text-neutral-400">
            Each stage activates its matching runtime node. Inspect contracts, payload shape, and
            measured or expected latency without leaving the execution context.
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
            <div className="flex h-full flex-col justify-center">
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

          <div className="relative space-y-8 pb-8">
            <svg
              className="pointer-events-none absolute bottom-8 left-[1.12rem] top-8 h-[calc(100%-4rem)] w-3 overflow-visible sm:left-[1.62rem]"
              viewBox="0 0 12 1000"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d="M6 0V1000" vectorEffect="non-scaling-stroke" stroke="#27272a" strokeWidth="1" />
              <motion.path
                d="M6 0V1000"
                vectorEffect="non-scaling-stroke"
                stroke="#00ff66"
                strokeWidth="2"
                style={{ pathLength: spineScale }}
                className="drop-shadow-[0_0_6px_rgba(0,255,102,0.8)]"
              />
            </svg>

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
      <NodeDeepDiveModal node={selectedNode} onClose={closeModal} />
    </section>
  );
}
