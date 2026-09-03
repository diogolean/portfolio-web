"use client";

import { motion } from "framer-motion";

export const CIRCUIT_BASE_STROKE = "rgba(16, 185, 129, 0.35)";
export const CIRCUIT_PULSE_STROKE = "#34d399";
export const CIRCUIT_STROKE_WIDTH = 1.5;
export const CIRCUIT_DASHARRAY = "12 40";
export const CIRCUIT_DASHOFFSET: number[] = [0, -104];
export const CIRCUIT_DURATION = 2.5;

export default function CircuitStroke({
  d,
  pathLength,
}: {
  d: string;
  pathLength?: number;
}) {
  return (
    <>
      <path
        d={d}
        pathLength={pathLength}
        fill="none"
        stroke={CIRCUIT_BASE_STROKE}
        strokeWidth={CIRCUIT_STROKE_WIDTH}
        vectorEffect="non-scaling-stroke"
      />
      <motion.path
        d={d}
        pathLength={pathLength}
        fill="none"
        stroke={CIRCUIT_PULSE_STROKE}
        strokeWidth={CIRCUIT_STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={CIRCUIT_DASHARRAY}
        vectorEffect="non-scaling-stroke"
        animate={{ strokeDashoffset: CIRCUIT_DASHOFFSET }}
        transition={{ repeat: Infinity, duration: CIRCUIT_DURATION, ease: "linear" }}
      />
    </>
  );
}
