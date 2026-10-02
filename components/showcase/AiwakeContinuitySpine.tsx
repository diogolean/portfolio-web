"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Branch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}

interface Geom {
  width: number;
  height: number;
  x: number;
  y1: number;
  y2: number;
  total: number;
  branches: Branch[];
  terminus: { x: number; y: number; label: string };
}

const HEX_RADIUS = 7;

function sameGeom(a: Geom | null, b: Geom | null) {
  if (!a || !b) return false;
  const round = (value: number) => Math.round(value * 2) / 2;
  return (
    round(a.width) === round(b.width) &&
    round(a.height) === round(b.height) &&
    round(a.x) === round(b.x) &&
    round(a.y1) === round(b.y1) &&
    round(a.y2) === round(b.y2) &&
    round(a.terminus.x) === round(b.terminus.x) &&
    round(a.terminus.y) === round(b.terminus.y) &&
    a.branches.length === b.branches.length &&
    a.branches.every(
      (branch, index) =>
        round(branch.x2) === round(b.branches[index].x2) &&
        round(branch.y1) === round(b.branches[index].y1)
    )
  );
}

function pixelsAlong(geom: Geom, head: number) {
  if (head <= geom.y1) return 0;
  const vertical = Math.max(0, geom.y2 - geom.y1);
  if (head < geom.y2) return Math.min(vertical, head - geom.y1);
  return vertical + Math.min(Math.max(0, geom.total - vertical), head - geom.y2);
}

export default function AiwakeContinuitySpine() {
  const [geom, setGeom] = useState<Geom | null>(null);
  const geomRef = useRef<Geom | null>(null);
  const beamRef = useRef<SVGPathElement>(null);
  const [reached, setReached] = useState(0);
  const painted = useRef(0);
  const frame = useRef(0);
  const syncRef = useRef<(snap: boolean) => void>(() => {});

  useLayoutEffect(() => {
    const root = document.getElementById("aiwake-schematic");
    const axis = document.getElementById("execution-graph-axis");
    if (!root || !axis) return;

    const paint = (pixels: number) => {
      const current = geomRef.current;
      const path = beamRef.current;
      if (!current || !path) return;
      const length = path.getTotalLength();
      const shown = Math.max(0, Math.min(length, (pixels * length) / current.total));
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length - shown}`;
      const travel = current.y1 + shown * (current.total / Math.max(length, 1));
      const marks = [...current.branches.map((branch) => branch.y1), current.y2];
      const next = marks.filter((mark) => travel >= mark - 0.5).length;
      setReached((previous) => (previous === next ? previous : next));
    };

    const aim = (target: number) => {
      cancelAnimationFrame(frame.current);
      const step = () => {
        const delta = target - painted.current;
        if (Math.abs(delta) < 0.6) {
          painted.current = target;
          paint(target);
          return;
        }
        painted.current += delta * 0.38;
        paint(painted.current);
        frame.current = requestAnimationFrame(step);
      };
      frame.current = requestAnimationFrame(step);
    };

    const sync = (snap: boolean) => {
      const current = geomRef.current;
      if (!current) return;
      const head = window.innerHeight * 0.42 - root.getBoundingClientRect().top;
      const target = pixelsAlong(current, head);
      if (snap) {
        cancelAnimationFrame(frame.current);
        painted.current = target;
        paint(target);
        return;
      }
      aim(target);
    };
    syncRef.current = sync;

    const measure = () => {
      const rootRect = root.getBoundingClientRect();
      const axisRect = axis.getBoundingClientRect();
      const spineX = axisRect.left - rootRect.left;
      const stages = axis.querySelectorAll<HTMLElement>('[id^="stage-node-"]');
      const lastStage = stages[stages.length - 1];
      const lastRect = lastStage?.getBoundingClientRect();
      const y1 = lastRect
        ? lastRect.top - rootRect.top + lastRect.height / 2
        : axisRect.bottom - rootRect.top;
      const terminusEl = root.querySelector<HTMLElement>("[data-spine-terminus]");
      const terminusRect = terminusEl?.getBoundingClientRect();
      const socketY = terminusRect ? terminusRect.top - rootRect.top : rootRect.height;
      const originsLeft = terminusRect ? terminusRect.left - rootRect.left : spineX;
      const originsRight = terminusRect ? terminusRect.right - rootRect.left : spineX;
      const socketX =
        spineX < originsLeft - 2 ? originsLeft : spineX > originsRight + 2 ? originsRight : spineX;
      const plug = socketY + 8;
      const vertical = Math.max(0, socketY - y1);
      const elbow = Math.abs(socketX - spineX) + Math.max(0, plug - socketY);
      const branches = Array.from(root.querySelectorAll<HTMLElement>("[data-spine-branch]")).map(
        (node) => {
          const rect = node.getBoundingClientRect();
          const y = rect.top - rootRect.top + rect.height / 2;
          const center = rect.left - rootRect.left + rect.width / 2;
          const nodeOnLeft = center < spineX;
          const edge = nodeOnLeft ? rect.right - rootRect.left : rect.left - rootRect.left;
          const end = nodeOnLeft ? Math.min(edge + 1, spineX - 14) : Math.max(edge - 1, spineX + 14);
          return { x1: spineX, y1: y, x2: end, y2: y, label: node.dataset.spineBranch ?? "" };
        }
      );
      const next: Geom = {
        width: Math.max(1, rootRect.width),
        height: Math.max(1, rootRect.height),
        x: spineX,
        y1,
        y2: socketY,
        total: Math.max(1, vertical + elbow),
        branches,
        terminus: {
          x: socketX,
          y: plug,
          label: terminusEl?.dataset.spineTerminus ?? "Foundation",
        },
      };
      geomRef.current = next;
      root.dataset.spine = `${Math.round(y1)}:${Math.round(socketY)}`;
      setGeom((current) => (sameGeom(current, next) ? current : next));
      sync(false);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(axis);
    const lastStage = axis.querySelector<HTMLElement>('[id^="stage-node-"]:last-of-type');
    if (lastStage) observer.observe(lastStage);
    for (const node of root.querySelectorAll<HTMLElement>("[data-spine-branch], [data-spine-terminus]")) {
      observer.observe(node);
    }
    const onScroll = () => sync(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame.current);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    syncRef.current(true);
  }, [geom]);

  if (!geom || geom.y2 <= geom.y1) return null;

  const trunk = `M ${geom.x} ${geom.y1} V ${geom.y2} H ${geom.terminus.x} V ${geom.terminus.y}`;
  const terminusLit = reached > geom.branches.length;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${geom.width} ${geom.height}`}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
    >
      <path d={trunk} fill="none" stroke="rgba(16,185,129,0.22)" strokeWidth="1.5" />
      <path
        ref={beamRef}
        d={trunk}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="butt"
      />
      {geom.branches.map((branch, index) => {
        const lit = reached > index;
        const direction = branch.x2 >= branch.x1 ? 1 : -1;
        const lineEnd = branch.x2 - direction * HEX_RADIUS * Math.cos(Math.PI / 6);
        const length = Math.abs(lineEnd - branch.x1);
        return (
          <g key={branch.label}>
            <path
              d={`M ${branch.x1} ${branch.y1} H ${lineEnd}`}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
            />
            <path
              d={`M ${branch.x1} ${branch.y1} H ${lineEnd}`}
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="butt"
              strokeDasharray={length}
              strokeDashoffset={lit ? 0 : length}
              style={{ transition: "stroke-dashoffset 0.28s linear" }}
            />
            <HexNode x={branch.x2} y={branch.y2} active={lit} />
          </g>
        );
      })}
      <HexNode x={geom.terminus.x} y={geom.y2} active={terminusLit} />
      <text
        x={geom.terminus.x}
        y={geom.y2 - 16}
        textAnchor="middle"
        fill="#67e8f9"
        fontSize="9"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        letterSpacing="1.4"
        opacity={terminusLit ? 1 : 0}
        style={{ transition: "opacity 0.28s linear" }}
      >
        {geom.terminus.label.toUpperCase()}
      </text>
    </svg>
  );
}

function HexNode({ x, y, active }: { x: number; y: number; active: boolean }) {
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    return `${x + HEX_RADIUS * Math.cos(angle)},${y + HEX_RADIUS * Math.sin(angle)}`;
  }).join(" ");

  return (
    <g>
      <polygon
        points={points}
        fill={active ? "#10b981" : "#09090b"}
        stroke={active ? "#6ee7b7" : "rgba(255,255,255,0.28)"}
        strokeWidth="1.25"
        opacity={active ? 1 : 0.45}
        style={active ? { filter: "drop-shadow(0 0 6px rgba(16,185,129,0.85))" } : undefined}
      />
      {active ? <circle cx={x} cy={y} r="2" fill="#020604" /> : null}
    </g>
  );
}
