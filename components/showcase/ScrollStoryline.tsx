"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import type { ProjectMediaAsset } from "@/lib/media-discovery";
import type { ArchitectureNode } from "@/lib/project-parser";
import ArchitectureCanvas from "./ArchitectureCanvas";
import DynamicMediaContainer from "./DynamicMediaContainer";

interface ScrollStorylineProps {
  slug: string;
  nodes: ArchitectureNode[];
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
    <section ref={containerRef} className="relative px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-16 max-w-2xl lg:mb-24">
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

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <div className="flex h-full flex-col justify-center gap-4">
              <DynamicMediaContainer media={media} slug={slug} activeNode={activeNode} />
              <ArchitectureCanvas nodes={nodes} activeIndex={activeIndex} />
            </div>
          </div>

          <div className="relative">
            <div className="absolute bottom-[12vh] left-5 top-[12vh] w-px bg-neutral-800 sm:left-7">
              <motion.div
                style={{ scaleY: spineScale, transformOrigin: "top" }}
                className="h-full w-full bg-accent shadow-[0_0_12px_rgba(0,255,102,0.4)]"
              />
            </div>

            {nodes.map((item, index) => (
              <StageCard
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

function StageCard({
  node,
  index,
  total,
  active,
  onActivate,
}: {
  node: ArchitectureNode;
  index: number;
  total: number;
  active: boolean;
  onActivate: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0.25, scale: 0.95, y: 24 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ amount: 0.55, margin: "-12% 0px -25% 0px" }}
      onViewportEnter={onActivate}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-[72vh] items-center pl-14 sm:pl-20"
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

      <div
        className={`relative w-full overflow-hidden rounded-2xl border p-6 transition-colors duration-500 sm:p-8 ${
          active
            ? "border-accent/35 bg-neutral-900/90 shadow-[0_24px_80px_rgba(0,255,102,0.06)]"
            : "border-neutral-800 bg-neutral-900/45"
        }`}
      >
        <svg
          className="absolute right-0 top-0 h-28 w-28 text-accent/20"
          viewBox="0 0 112 112"
          fill="none"
          aria-hidden
        >
          <motion.path
            d="M112 1H72C42 1 24 20 24 48v64"
            stroke="currentColor"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 1 }}
          />
        </svg>

        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            {node.kind}
          </span>
          <span className="font-mono text-[10px] text-neutral-600">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <h3 className="mt-7 max-w-lg text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          {node.title}
        </h3>
        <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-400">{node.summary}</p>

        <div className="mt-8 rounded-xl border border-neutral-800 bg-black/30 p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-600">
            I/O contract
          </p>
          <p className="mt-2 font-mono text-[11px] leading-6 text-neutral-300">{node.contract}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {node.technologies.map((technology) => (
            <span
              key={technology}
              className="rounded-full border border-neutral-800 bg-neutral-950/60 px-3 py-1 font-mono text-[9px] text-neutral-500"
            >
              {technology}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
