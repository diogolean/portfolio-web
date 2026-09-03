"use client";

import { motion, useMotionValue } from "framer-motion";
import type { MosaicAsset, PipelineNode } from "@/types/project";
import { useT } from "./LanguageProvider";

export default function MicroMosaicCloud({
  node,
  children,
}: {
  node: PipelineNode;
  children: React.ReactNode;
}) {
  const translate = useT();
  const sourceAssets = [...(node.mosaicAssets ?? [])];
  if (!sourceAssets.some((asset) => asset.label === "Signal envelope")) {
    sourceAssets.push({
      type: "audio",
      label: "Signal envelope",
      src: "0.12,0.38,0.74,0.46,0.91,0.62,0.28,0.68,0.42,0.18",
    });
  }
  const assets = sourceAssets
    .map((asset) => ({
      ...asset,
      label:
        asset.label === "I/O contract"
          ? translate("io_contract")
          : asset.label === "Payload sample"
            ? translate("payload_sample")
            : asset.label === "Signal envelope"
              ? translate("signal_envelope")
              : asset.label,
    }))
    .slice(0, 3);

  return (
    <div className="relative mx-auto flex w-full min-w-0 justify-center overflow-visible py-2 [perspective:1000px]">
      <div className="relative z-10 w-[min(88vw,340px)] shrink-0">{children}</div>
      <div className="pointer-events-none absolute inset-0 z-20 hidden overflow-visible xl:block">
        {assets.map((asset, index) => (
          <div
            key={`${node.id}-${asset.label}`}
            className={`pointer-events-auto absolute w-[clamp(6rem,8vw,7rem)] ${
              index === 0
                ? "-left-[10px] top-[12%]"
                : index === 1
                  ? "-right-[10px] top-[38%]"
                  : "-left-[10px] bottom-[9%]"
            }`}
          >
            <MosaicTile asset={asset} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MosaicTile({
  asset,
  index,
}: {
  asset: MosaicAsset;
  index: number;
}) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        rotateY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 12);
        rotateX.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -12);
      }}
      onMouseLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
      className="min-w-0 overflow-hidden border border-emerald-500/30 bg-zinc-950/90 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.4)] transition-shadow duration-300 hover:border-emerald-400/60 hover:shadow-[0_18px_45px_rgba(16,185,129,0.16)] [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]"
    >
      <div className="flex items-center justify-between [transform:translateZ(18px)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-400">
          {asset.type}
        </span>
        <span className="h-1 w-1 rounded-full bg-emerald-400" />
      </div>
      <p className="mt-2 truncate font-mono text-xs text-zinc-200 [transform:translateZ(26px)]">
        {asset.label}
      </p>
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
