"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export const SPINE_SPRING = {
  stiffness: 140,
  damping: 24,
  mass: 0.4,
  restDelta: 0.001,
} as const;

export default function TimelineSpine({
  progress,
  onReachedNodeChange,
}: {
  progress: MotionValue<number>;
  onReachedNodeChange: (stageIndex: number) => void;
}) {
  const [axisHeight, setAxisHeight] = useState(1);
  const geometryVersion = useMotionValue(0);
  const scrollStops = useRef([0, 1]);
  const pathStops = useRef([0, 1]);
  const nodeAnchors = useRef<number[]>([]);
  const axisElement = useRef<HTMLElement | null>(null);
  const anchorElements = useRef<HTMLElement[]>([]);
  const lastReportedNode = useRef<number | null>(null);
  const beamTarget = useTransform(
    [progress, geometryVersion],
    ([value]) => {
      const scrollValue = Number(value);
      const inputs = scrollStops.current;
      const axisRect = axisElement.current?.getBoundingClientRect();
      const outputs =
        axisRect && axisRect.height > 0
          ? anchorElements.current.map((node) => {
              const nodeRect = node.getBoundingClientRect();
              return (
                nodeRect.top -
                axisRect.top +
                nodeRect.height / 2
              ) / axisRect.height;
            })
          : pathStops.current;

      if (outputs.length) {
        pathStops.current = outputs;
        nodeAnchors.current = outputs;
      }

      let activeStop = 0;
      for (let index = 1; index < inputs.length; index++) {
        if (scrollValue >= inputs[index]) activeStop = index;
        else break;
      }
      return outputs[activeStop] ?? outputs[0];
    }
  );
  const easedBeamProgress = useSpring(beamTarget, SPINE_SPRING);
  const beamProgress = useTransform(easedBeamProgress, (value) => {
    const target = beamTarget.get();
    return Math.abs(value - target) <= 0.001 ? target : value;
  });

  const reportReachedNode = useCallback(
    (beamLength: number) => {
      let reachedVisualNode = 0;
      for (let index = 1; index < nodeAnchors.current.length; index++) {
        if (beamLength >= nodeAnchors.current[index]) reachedVisualNode = index;
        else break;
      }
      const stageIndex = reachedVisualNode - 1;
      if (lastReportedNode.current === stageIndex) return;
      lastReportedNode.current = stageIndex;
      onReachedNodeChange(stageIndex);
    },
    [onReachedNodeChange]
  );

  useEffect(
    () => beamProgress.on("change", reportReachedNode),
    [beamProgress, reportReachedNode]
  );

  useLayoutEffect(() => {
    const axis = document.getElementById("execution-graph-axis");
    const headerNode = document.getElementById("execution-graph-header");
    const storyline = axis?.closest("section");
    if (!axis || !headerNode || !storyline) return;
    axisElement.current = axis;

    const update = () => {
      const axisRect = axis.getBoundingClientRect();
      const headerNodeRect = headerNode.getBoundingClientRect();
      const storylineRect = storyline.getBoundingClientRect();
      const headerNodeCenter =
        headerNodeRect.top - axisRect.top + headerNodeRect.height / 2;
      const stageNodes = Array.from(
        axis.querySelectorAll<HTMLElement>('[id^="stage-node-"]')
      );
      anchorElements.current = [headerNode, ...stageNodes];
      const anchors = [
        headerNodeCenter / axisRect.height,
        ...stageNodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return (rect.top - axisRect.top + rect.height / 2) / axisRect.height;
        }),
      ];
      nodeAnchors.current = anchors;
      pathStops.current = anchors;

      const scrollRange = Math.max(
        1,
        storylineRect.height - window.innerHeight + window.innerHeight * 0.42
      );
      const storylineStartY =
        window.scrollY + storylineRect.top - window.innerHeight * 0.42;
      const measuredStops = stageNodes.map((node) => {
        const rect = node.getBoundingClientRect();
        const activationScrollY =
          window.scrollY + rect.top - window.innerHeight * 0.42;
        return Math.min(
          1,
          Math.max(0, (activationScrollY - storylineStartY) / scrollRange)
        );
      });
      scrollStops.current = [0, ...measuredStops].map((stop, index, stops) =>
        index === 0 ? stop : Math.max(stop, stops[index - 1] + 0.0001)
      );

      const nextHeight = Math.max(1, Math.round(axisRect.height));
      setAxisHeight(nextHeight);
      geometryVersion.set(geometryVersion.get() + 1);
      reportReachedNode(beamProgress.get());
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(axis);
    observer.observe(headerNode);
    for (const node of axis.querySelectorAll<HTMLElement>('[id^="stage-node-"]')) {
      observer.observe(node);
    }
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [
    beamProgress,
    geometryVersion,
    reportReachedNode,
  ]);

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 w-8 -translate-x-1/2 overflow-visible">
      <svg
        viewBox={`0 0 32 ${axisHeight}`}
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-y-0 left-1/2 h-full w-8 -translate-x-1/2 overflow-visible"
      >
        <path
          d={`M16 0 V${axisHeight}`}
          fill="none"
          stroke="rgba(16, 185, 129, 0.45)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d={`M16 0 V${axisHeight}`}
          fill="none"
          stroke="rgba(52, 211, 153, 0.9)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="10 24"
          vectorEffect="non-scaling-stroke"
          animate={{ strokeDashoffset: [0, -68] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "linear" }}
          className="drop-shadow-[0_0_6px_rgba(52,211,153,0.75)]"
        />
        <motion.path
          d={`M16 0 V${axisHeight}`}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={false}
          style={{ pathLength: beamProgress }}
          className="drop-shadow-[0_0_8px_rgba(52,211,153,0.95)]"
        />
      </svg>
    </div>
  );
}
