"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import type { ProjectMediaAsset } from "@/lib/media-discovery";
import type { PipelineNode } from "@/types/project";
import ArchitectureCanvas from "./ArchitectureCanvas";
import DynamicMediaContainer from "./DynamicMediaContainer";
import MicroMosaicCloud from "./MicroMosaicCloud";

interface ScrollStorylineProps {
  slug: string;
  nodes: PipelineNode[];
  media: ProjectMediaAsset | null;
}

export default function ScrollStoryline({ slug, nodes, media }: ScrollStorylineProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 65%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.25 });
  const spineScale = useTransform(progress, [0, 1], [0, 1]);
  const activeNode = nodes[activeIndex] ?? nodes[0];

  return (
    <section ref={containerRef} className="relative px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-12 max-w-2xl lg:mb-16">
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
                <DynamicMediaContainer media={media} slug={slug} activeNode={activeNode} />
              </MicroMosaicCloud>
              <div className="mx-auto mt-3 hidden w-full max-w-lg xl:block">
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
              <HexStageCard
                key={item.id}
                node={item}
                index={index}
                total={nodes.length}
                active={index === activeIndex}
                onActivate={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HexStageCard({
  node,
  index,
  total,
  active,
  onActivate,
}: {
  node: PipelineNode;
  index: number;
  total: number;
  active: boolean;
  onActivate: () => void;
}) {
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
        className="absolute left-[0.78rem] z-10 flex h-4 w-4 items-center justify-center rounded-full border sm:left-[1.28rem]"
      >
        {active && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
      </motion.span>

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
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className={`relative w-full bg-gradient-to-br p-px transition-shadow duration-500 [clip-path:polygon(18px_0,calc(100%-18px)_0,100%_18px,100%_calc(100%-18px),calc(100%-18px)_100%,18px_100%,0_calc(100%-18px),0_18px)] ${
          active
            ? "from-emerald-400/70 via-emerald-500/25 to-emerald-900/50 shadow-[0_20px_70px_rgba(0,255,102,0.09)]"
            : "from-neutral-700 via-neutral-800 to-neutral-900"
        }`}
      >
        <div
          className="relative overflow-hidden bg-neutral-950/95 p-5 [clip-path:polygon(18px_0,calc(100%-18px)_0,100%_18px,100%_calc(100%-18px),calc(100%-18px)_100%,18px_100%,0_calc(100%-18px),0_18px)] sm:p-6"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-l border-b border-emerald-500/15 bg-emerald-400/[0.03]" />
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-400">
              {node.category}
            </span>
            <span className="font-mono text-[9px] text-neutral-600">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
          <h3 className="mt-4 max-w-lg text-xl font-medium tracking-tight text-foreground sm:text-2xl">
            {node.title}
          </h3>
          <p className="mt-3 max-w-xl text-xs leading-6 text-neutral-400 sm:text-sm">
            {node.description}
          </p>

          <div className="mt-4 grid gap-2 border-t border-neutral-800/80 pt-4 font-mono text-[9px] sm:grid-cols-2">
            <div>
              <span className="text-neutral-600">IN</span>
              <p className="mt-1 truncate text-neutral-300">{node.ioContract.input}</p>
            </div>
            <div>
              <span className="text-neutral-600">OUT</span>
              <p className="mt-1 truncate text-neutral-300">{node.ioContract.output}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {node.tags.slice(0, 4).map((technology) => (
              <span
                key={technology}
                className="border border-emerald-500/15 bg-emerald-500/[0.04] px-2 py-1 font-mono text-[8px] text-neutral-500 [clip-path:polygon(5px_0,100%_0,100%_calc(100%-5px),calc(100%-5px)_100%,0_100%,0_5px)]"
              >
                {technology}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}
