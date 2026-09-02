"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { MosaicAsset, PipelineNode } from "@/types/project";

const POSITIONS = [
  "-left-10 top-[12%] xl:-left-20",
  "-right-8 top-[24%] xl:-right-16",
  "-left-12 bottom-[24%] xl:-left-24",
  "-right-10 bottom-[10%] xl:-right-20",
];

export default function MicroMosaicCloud({
  node,
  children,
}: {
  node: PipelineNode;
  children: React.ReactNode;
}) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 90, damping: 18 });
  const springY = useSpring(pointerY, { stiffness: 90, damping: 18 });
  const assets = [
    ...(node.mosaicAssets ?? []),
    {
      type: "code" as const,
      label: "Runtime tags",
      src: node.tags.slice(0, 4).join("\n"),
    },
  ].slice(0, 4);

  return (
    <div
      className="relative mx-auto flex w-full max-w-xl items-center justify-center py-3 [perspective:1200px]"
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
        pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
      }}
      onMouseLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {assets.map((asset, index) => (
          <MosaicTile
            key={`${node.id}-${asset.label}`}
            asset={asset}
            index={index}
            x={springX}
            y={springY}
          />
        ))}
      </div>
    </div>
  );
}

function MosaicTile({
  asset,
  index,
  x,
  y,
}: {
  asset: MosaicAsset;
  index: number;
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const depth = 28 + index * 10;
  const translateX = useTransform(x, (value) => value * depth);
  const translateY = useTransform(y, (value) => value * depth);
  const rotateY = useTransform(x, (value) => value * 12);
  const rotateX = useTransform(y, (value) => value * -12);

  return (
    <motion.div
      style={{ x: translateX, y: translateY, rotateX, rotateY, translateZ: index * 8 }}
      animate={{ y: [0, index % 2 ? 8 : -7, 0] }}
      transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
      className={`pointer-events-auto absolute z-20 w-40 cursor-crosshair overflow-hidden border border-emerald-500/40 bg-zinc-950/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-md [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)] ${POSITIONS[index]}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-400">
          {asset.type}
        </span>
        <span className="h-1 w-1 rounded-full bg-emerald-400" />
      </div>
      <p className="mt-2 truncate font-mono text-xs text-zinc-200">{asset.label}</p>
      {asset.type === "audio" ? (
        <Waveform values={asset.src} />
      ) : asset.type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset.src} alt="" className="mt-2 h-14 w-full object-cover opacity-70" />
      ) : (
        <pre className="mt-2 max-h-20 overflow-hidden whitespace-pre-wrap font-mono text-[10px] leading-4 text-zinc-500">
          {asset.src}
        </pre>
      )}
    </motion.div>
  );
}

function Waveform({ values }: { values: string }) {
  const bars = values.split(",").map(Number);
  return (
    <div className="mt-3 flex h-10 items-center gap-1">
      {bars.map((value, index) => (
        <motion.span
          key={index}
          animate={{ scaleY: [0.45, 1, 0.45] }}
          transition={{ duration: 0.8 + index * 0.06, repeat: Infinity }}
          style={{ height: `${Math.max(15, value * 100)}%` }}
          className="w-1 flex-1 origin-center bg-emerald-400/55"
        />
      ))}
    </div>
  );
}
