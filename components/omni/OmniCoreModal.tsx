"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import proofImage from "@/public/proof/proof.webp";
import CloseButton from "@/components/showcase/CloseButton";
import CircuitStroke from "@/components/showcase/CircuitStroke";
import SpineJunction from "@/components/showcase/SpineJunction";
import { SPINE_SPRING } from "@/components/showcase/TimelineSpine";

export const OPEN_OMNI_CORE_EVENT = "omni-engine:open-core";

const STATS = [
  { value: "+6.2M", label: "Total audience / followers" },
  { value: "80M+", label: "Cumulative organic reach" },
  { value: "$27,000", label: "Peak monthly yield" },
  { value: "< $0.002", label: "Average token / video cost efficiency" },
];

const NODES = [
  {
    id: "gateway",
    short: "MCP Gateway",
    detail: "PageContext · provider routing",
    input: "page_id + task + cost_tier",
    output: "ModelRoute(chain, tier, model_id)",
  },
  {
    id: "script",
    short: "Script & Dialectic Engine",
    detail: "schema-bound narrative stages",
    input: "persona DNA + topic + guardrails",
    output: "validated narration + scene plan",
  },
  {
    id: "media",
    short: "Media & OCR Pipeline",
    detail: "F5/ElevenLabs · FLUX · Gemini OCR",
    input: "script + style refs + source assets",
    output: "timed audio + visual sequence",
  },
  {
    id: "cost",
    short: "Cost Tracking & Telemetry",
    detail: "thread-safe per-operation ledger",
    input: "tokens + images + chars + GPU seconds",
    output: "cost_*.json + annotated payload",
  },
  {
    id: "scale",
    short: "Massive Scale",
    detail: "bounded workers · isolated channels",
    input: "batch quantity + channel config",
    output: "namespaced content library",
  },
  {
    id: "mesh",
    short: "Distribution Mesh",
    detail: "Playwright/CDP · Pinterest · YouTube",
    input: "durable post JSON + hosted media URL",
    output: "scheduled platform inventory",
  },
];

const CARDS = [
  {
    node: 0,
    title: "Agnostic Model Gateway & MCP Adapter",
    stack: "MCP Protocol | ComfyUI Pipelines | OpenSource Models | Multi-Provider",
    challenge:
      "A cost-first adapter boundary hot-swaps Gemini, Claude, open-source inference, and local ComfyUI workflows. The repository's MCP-named layer is a model-flow abstraction rather than an external protocol server.",
    proof: "model_router.route_model · model_api_flows.apply_production_flow · remote_gpu_manager",
  },
  {
    node: 1,
    title: "Synthetic Metacognition & Script Pipeline",
    stack: "State Machine Router | High-Entropy Sampling | Dialectic Friction",
    challenge:
      "Channel DNA, narrative modes, duration-derived budgets, and schema guardrails shape high-variance scripts while the Aiwake subsystem runs role-based model dialogue through a separate orchestration room.",
    proof: "script_agent.py · script_brain.py · channels_config/aiwake/orchestrator.py",
  },
  {
    node: 2,
    title: "Asynchronous Media & Vision Processing",
    stack: "Edge TTS | Parallel Asset Render | Python OCR Parser",
    challenge:
      "Edge TTS, remote F5, ElevenLabs alignment, FLUX rendering, and chunked Gemini OCR convert scripts and source media into timed assets with atomic vault persistence and graceful provider fallback.",
    proof: "audio_engine.py · OCREngine.process_directory · reel_sequence_engine.py",
  },
  {
    node: 3,
    title: "Real-Time Cost & Telemetry Evaluator",
    stack: "Token Metrics | Cost Routing Engine | Latency Observer",
    challenge:
      "A thread-safe ledger measures text, image, audio, SFX, music, and GPU spend per variant, annotates durable payloads, and prevents cheap-tier fallback chains from drifting into premium inference.",
    proof: "CostTracker · google_guardrail.py · ModelRoute",
  },
  {
    node: 4,
    title: "Massive Scale & Production Throughput",
    stack: "Threadpool Executors | Concurrent Locks | B2 Asset Storage",
    challenge:
      "Bounded variant fan-out runs up to five workers while write locks protect shared JSON and XLSX state. Channel-scoped paths and atomic writes keep B2-hosted production batches isolated.",
    proof: "main.py ThreadPoolExecutor · write_lock · durable_library.write_atomic_json",
  },
  {
    node: 5,
    title: "Autonomous Distribution & Webhook Mesh",
    stack: "Playwright CDP | Social Graph APIs | ManyChat Funnels",
    challenge:
      "Playwright/CDP Facebook automation, Pinterest API scheduling, and resumable YouTube uploads connect output inventory to conversion workflows and the $27k yield proof. ManyChat remains an external funnel integration boundary.",
    proof: "facebook_scheduler · pinterest_engine · youtube_publisher.py · distribution_contract.py",
  },
];

const NODE_POSITIONS = [
  { x: 110, y: 140 },
  { x: 280, y: 90 },
  { x: 450, y: 140 },
  { x: 450, y: 380 },
  { x: 280, y: 430 },
  { x: 110, y: 380 },
];

const CANVAS_WIDTH = 560;
const CANVAS_HEIGHT = 520;
const HEX_RADIUS_X = 66;
const HEX_RADIUS_Y = 57;
const OBSERVER_POSITION = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
const OBSERVER_RADIUS_X = 82;
const OBSERVER_RADIUS_Y = 70;

const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 0],
];

export function openOmniCore() {
  window.dispatchEvent(new CustomEvent(OPEN_OMNI_CORE_EVENT));
}

export default function OmniCoreModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const axisRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const scrollToStep = useCallback((index: number) => {
    setActiveStepIndex(index);
    cardRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    const show = () => {
      setActiveStepIndex(0);
      setOpen(true);
    };
    window.addEventListener(OPEN_OMNI_CORE_EVENT, show);
    return () => window.removeEventListener(OPEN_OMNI_CORE_EVENT, show);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    setActiveStepIndex(0);
    scrollRootRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    const scrollRoot = scrollRootRef.current;
    if (!scrollRoot) return;
    let frame = 0;

    const syncActiveCard = () => {
      const remainingScroll =
        scrollRoot.scrollHeight - scrollRoot.clientHeight - scrollRoot.scrollTop;
      if (remainingScroll <= 4) {
        setActiveStepIndex(CARDS.length - 1);
        return;
      }
      const rootRect = scrollRoot.getBoundingClientRect();
      const focusY = rootRect.top + rootRect.height / 2;
      const closest = cardRefs.current
        .map((card, index) => ({ card, index, rect: card?.getBoundingClientRect() }))
        .filter(({ rect }) =>
          Boolean(rect && rect.bottom > rootRect.top && rect.top < rootRect.bottom),
        )
        .sort((a, b) => {
          const aCenter = (a.rect?.top ?? 0) + (a.rect?.height ?? 0) / 2;
          const bCenter = (b.rect?.top ?? 0) + (b.rect?.height ?? 0) / 2;
          return Math.abs(aCenter - focusY) - Math.abs(bCenter - focusY);
        })[0];
      if (closest) setActiveStepIndex(closest.index);
    };

    const observer = new IntersectionObserver(
      () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(syncActiveCard);
      },
      {
        root: scrollRoot,
        rootMargin: "-20% 0px -35% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );
    cardRefs.current.forEach((card) => card && observer.observe(card));
    scrollRoot.addEventListener("scroll", syncActiveCard, { passive: true });
    window.addEventListener("resize", syncActiveCard);
    syncActiveCard();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scrollRoot.removeEventListener("scroll", syncActiveCard);
      window.removeEventListener("resize", syncActiveCard);
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          ref={scrollRootRef}
          className="omni-modal-scroll fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md"
        >
          <motion.button
            type="button"
            aria-label="Close Omni Engine architecture"
            className="fixed inset-0 bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="omni-core-title"
            initial={{ opacity: 0, y: 24, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative z-10 mx-auto min-h-full w-full max-w-[1500px] border-x border-emerald-500/35 bg-[#090A0F]/95 shadow-[0_0_120px_rgba(16,185,129,0.14)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.025)_1px,transparent_1px)] bg-[size:24px_24px]" />

            <header className="sticky top-0 z-30 flex items-start border-b border-emerald-500/20 bg-[#090A0F]/95 px-5 py-4 pr-36 backdrop-blur-xl sm:px-7 sm:pr-44">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#10B981]">
                  OMNI-ENGINE / CORE ARCHITECTURE
                </p>
                <h2
                  id="omni-core-title"
                  className="mt-1 text-base font-semibold leading-tight tracking-tight text-white sm:text-2xl"
                >
                  Autonomous Synthetic Growth Engine
                </h2>
                <p className="mt-1.5 font-mono text-[9px] leading-4 tracking-[0.08em] text-emerald-300/65 sm:text-[10px]">
                  Agnostic Model Routing · Multi-Agent Orchestration · Autonomous Revenue Mesh
                </p>
              </div>
              <div className="absolute right-5 top-4 sm:right-7">
                <CloseButton onClick={close} autoFocus />
              </div>
            </header>

            <div className="relative z-10">
              <div className="border-b border-white/[0.08] px-4 py-6 sm:px-7">
                <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/[0.08] bg-white/[0.08] lg:grid-cols-4">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="bg-[#0C0E14] p-4 sm:p-5">
                      <p className="font-mono text-xl font-medium text-[#00FF9D] sm:text-3xl">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-[10px] uppercase leading-4 tracking-[0.14em] text-zinc-500">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 cursor-default overflow-hidden rounded-none border border-emerald-500/35 bg-[#0D0F17]/90 shadow-[0_0_12px_rgba(16,185,129,0.15)] backdrop-blur-md">
                  <Image
                    src={proofImage}
                    alt="Unified Omni Engine audience, reach, conversion, and revenue proof"
                    className="h-auto w-full opacity-90 transition-opacity duration-300 hover:opacity-100"
                    sizes="(max-width: 1500px) 100vw, 1440px"
                    priority
                  />
                </div>
              </div>

              <div className="relative grid items-start lg:grid-cols-2">
                <div className="border-b border-white/[0.08] p-4 sm:p-7 lg:sticky lg:top-24 lg:border-b-0">
                  <NodeCanvas
                    activeNodeIndex={CARDS[activeStepIndex].node}
                    activeStepIndex={activeStepIndex}
                    onSelectNode={scrollToStep}
                  />
                </div>

                <div
                  ref={axisRef}
                  id="omni-architecture-steps"
                  className="relative border-white/[0.08] pb-[40vh] pr-4 pt-6 sm:pr-7 lg:border-l lg:pt-12"
                >
                  <OmniTimelineSpine
                    axisRef={axisRef}
                    cardRefs={cardRefs}
                    activeIndex={activeStepIndex}
                  />
                  {CARDS.map((card, index) => {
                    const active = activeStepIndex === index;
                    return (
                      <motion.article
                        key={card.title}
                        id={`omni-stage-node-${index}`}
                        ref={(element) => {
                          cardRefs.current[index] = element;
                        }}
                        data-step={index}
                        animate={{ opacity: active ? 1 : 0.42 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        onMouseEnter={() => setActiveStepIndex(index)}
                        className="relative flex min-h-[320px] w-full scroll-mt-24 flex-col justify-center border-b border-white/[0.08] py-12 pl-12 pr-2 sm:min-h-[360px] sm:py-16 sm:pl-16"
                      >
                        <SpineJunction active={active} lineActive={active} />
                        <h3 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                          {card.title}
                        </h3>
                        <p className="mt-4 font-mono text-[11px] uppercase leading-5 tracking-[0.08em] text-[#00FF9D]/70">
                          {card.stack}
                        </p>
                        <p className="mt-5 text-sm leading-7 text-zinc-400">{card.challenge}</p>
                        <div className="mt-6 border-t border-white/[0.08] pt-4 font-mono text-[10px] leading-5 text-zinc-600">
                          SOURCE CONTRACT · {card.proof}
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function OmniTimelineSpine({
  axisRef,
  cardRefs,
  activeIndex,
}: {
  axisRef: RefObject<HTMLDivElement | null>;
  cardRefs: RefObject<(HTMLElement | null)[]>;
  activeIndex: number;
}) {
  const [axisHeight, setAxisHeight] = useState(1);
  const [beamProgress, setBeamProgress] = useState(0);
  const [instantBeam, setInstantBeam] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    const axis = axisRef.current;
    if (!axis) return;

    const update = () => {
      const axisRect = axis.getBoundingClientRect();
      const activeCard = cardRefs.current[activeIndex];
      const cardRect = activeCard?.getBoundingClientRect();
      const height = Math.max(1, Math.round(axisRect.height));
      setAxisHeight(height);
      if (cardRect) {
        const center = cardRect.top - axisRect.top + cardRect.height / 2;
        const nextTarget = Math.min(1, Math.max(0, center / height));
        if (!initialized.current) {
          setBeamProgress(nextTarget);
          initialized.current = true;
        } else {
          setInstantBeam(false);
          setBeamProgress(nextTarget);
        }
      }
    };

    update();
    const frame = requestAnimationFrame(update);
    const observer = new ResizeObserver(update);
    observer.observe(axis);
    cardRefs.current.forEach((card) => card && observer.observe(card));
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [activeIndex, axisRef, cardRefs]);

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 w-8 -translate-x-1/2 overflow-visible">
      <svg
        viewBox={`0 0 32 ${axisHeight}`}
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-y-0 left-1/2 h-full w-8 -translate-x-1/2 overflow-visible"
      >
        <CircuitStroke d={`M16 0 V${axisHeight}`} />
        <motion.path
          d={`M16 0 V${axisHeight}`}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={{ pathLength: beamProgress }}
          transition={
            instantBeam
              ? { duration: 0 }
              : { type: "spring", ...SPINE_SPRING }
          }
          className="drop-shadow-[0_0_8px_rgba(52,211,153,0.95)]"
        />
      </svg>
    </div>
  );
}

function NodeCanvas({
  activeNodeIndex,
  activeStepIndex,
  onSelectNode,
}: {
  activeNodeIndex: number;
  activeStepIndex: number;
  onSelectNode: (index: number) => void;
}) {
  const pointerX = useMotionValue(CANVAS_WIDTH / 2);
  const pointerY = useMotionValue(CANVAS_HEIGHT / 2);
  const pointerActive = useMotionValue(0);
  const activeNode = NODES[activeNodeIndex] ?? NODES[0];

  const updateMagnet = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH);
    pointerY.set(((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT);
    pointerActive.set(1);
  };

  const resetMagnet = () => {
    pointerActive.set(0);
  };

  return (
    <div className="lg:sticky lg:top-0">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#00FF9D] shadow-[0_0_14px_#00FF9D]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Live topology
          </span>
        </div>
        <span className="font-mono text-[10px] text-zinc-700">
          ACTIVE_STEP={String(activeStepIndex + 1).padStart(2, "0")}
        </span>
      </div>

      <div
        className="relative aspect-[560/520] min-h-[430px] overflow-hidden bg-[#07090D]/70 shadow-[0_28px_80px_rgba(0,0,0,0.36)]"
        onMouseMove={updateMagnet}
        onMouseLeave={resetMagnet}
      >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(16,185,129,0.09),transparent_52%)]" />
          <svg
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            role="img"
            aria-label="Synchronized Omni Engine architecture graph"
          >
            {NODES.map((node, index) => (
              <g key={`core-${node.id}`} opacity="0.2">
                <MagneticRadialEdge
                  nodeIndex={index}
                  pointerX={pointerX}
                  pointerY={pointerY}
                  pointerActive={pointerActive}
                />
              </g>
            ))}
            {EDGES.map(([from, to]) => {
              const active = activeNodeIndex === from || activeNodeIndex === to;
              return (
                <g key={`${from}-${to}`} opacity={active ? 1 : 0.24}>
                  <MagneticEdge
                    from={from}
                    to={to}
                    pointerX={pointerX}
                    pointerY={pointerY}
                    pointerActive={pointerActive}
                  />
                </g>
              );
            })}
          </svg>

          {NODES.map((node, index) => (
            <FloatingHexNode
              key={node.id}
              node={node}
              index={index}
              active={activeNodeIndex === index}
              pointerX={pointerX}
              pointerY={pointerY}
              pointerActive={pointerActive}
              onSelect={() => onSelectNode(index)}
            />
          ))}
          <ObserverCoreNode />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeStepIndex}-${activeNode.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mt-4 grid gap-px border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2"
        >
          <Contract label="ACTIVE INPUT" value={activeNode.input} />
          <Contract label="ACTIVE OUTPUT" value={activeNode.output} />
          <div className="bg-[#0B0D12] p-4 sm:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
              Runtime adapter
            </p>
            <p className="mt-2 font-mono text-xs text-[#00FF9D]/75">
              {activeNode.short} :: {activeNode.detail}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FloatingHexNode({
  node,
  index,
  active,
  pointerX,
  pointerY,
  pointerActive,
  onSelect,
}: {
  node: (typeof NODES)[number];
  index: number;
  active: boolean;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  pointerActive: MotionValue<number>;
  onSelect?: () => void;
}) {
  const { x, y } = useMagneticOffset(index, pointerX, pointerY, pointerActive);
  const position = NODE_POSITIONS[index];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Show architecture card for ${node.short}`}
      className="absolute z-10 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
      style={{
        left: `${(position.x / CANVAS_WIDTH) * 100}%`,
        top: `${(position.y / CANVAS_HEIGHT) * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        data-omni-node={index}
        style={{ x, y }}
        animate={{ scale: active ? [1, 1.055, 1] : 1 }}
        transition={active ? { duration: 1.8, repeat: Infinity } : { duration: 0.2 }}
        className={`relative h-[116px] w-[134px] transform-gpu will-change-transform ${
          active ? "drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]" : ""
        }`}
      >
        <motion.svg
          viewBox="0 0 16 16"
          aria-hidden
          className="absolute inset-0 h-full w-full"
          animate={{ opacity: active ? [0.78, 1, 0.78] : 0.72 }}
          transition={active ? { duration: 1.8, repeat: Infinity } : { duration: 0.2 }}
        >
          <polygon
            points="4,1 12,1 15,8 12,15 4,15 1,8"
            fill={active ? "rgba(16,185,129,0.18)" : "rgba(9,10,15,0.96)"}
            stroke={active ? "#6ee7b7" : "rgba(255,255,255,0.26)"}
            strokeWidth={active ? "0.32" : "0.2"}
          />
          <polygon
            points="4.8,2.3 11.2,2.3 13.6,8 11.2,13.7 4.8,13.7 2.4,8"
            fill="none"
            stroke={active ? "rgba(0,255,157,0.55)" : "rgba(16,185,129,0.16)"}
            strokeWidth="0.12"
          />
        </motion.svg>
        <div className="relative z-10 flex h-full w-full items-center justify-center px-5 text-center">
          <span
            className={`font-mono text-[10px] font-medium uppercase leading-4 tracking-[0.05em] ${
              active ? "text-[var(--glow-active)]" : "text-[var(--hex-text-muted)]"
            }`}
          >
            {node.short}
          </span>
        </div>
      </motion.div>
    </button>
  );
}

function ObserverCoreNode() {
  return (
    <div
      className="pointer-events-none absolute z-20 h-[142px] w-[164px] -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${(OBSERVER_POSITION.x / CANVAS_WIDTH) * 100}%`,
        top: `${(OBSERVER_POSITION.y / CANVAS_HEIGHT) * 100}%`,
      }}
    >
      <motion.svg
        viewBox="0 0 16 16"
        aria-hidden
        className="absolute inset-0 h-full w-full drop-shadow-[0_0_28px_rgba(16,185,129,0.42)]"
        animate={{ opacity: [0.82, 1, 0.82], scale: [1, 1.025, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <polygon
          points="4,1 12,1 15,8 12,15 4,15 1,8"
          fill="rgba(5,25,20,0.96)"
          stroke="#6ee7b7"
          strokeWidth="0.3"
        />
        <polygon
          points="4.8,2.3 11.2,2.3 13.6,8 11.2,13.7 4.8,13.7 2.4,8"
          fill="none"
          stroke="rgba(0,255,157,0.6)"
          strokeWidth="0.14"
        />
      </motion.svg>
      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center font-mono text-[11px] font-semibold uppercase leading-4 tracking-[0.08em] text-emerald-200">
        Omni Engine
        <br />
        (Observer)
      </div>
    </div>
  );
}

function MagneticRadialEdge({
  nodeIndex,
  pointerX,
  pointerY,
  pointerActive,
}: {
  nodeIndex: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  pointerActive: MotionValue<number>;
}) {
  const offset = useMagneticOffset(nodeIndex, pointerX, pointerY, pointerActive);
  const path = useTransform([offset.x, offset.y], ([offsetX, offsetY]) => {
    const nodeCenter = {
      x: NODE_POSITIONS[nodeIndex].x + Number(offsetX),
      y: NODE_POSITIONS[nodeIndex].y + Number(offsetY),
    };
    const start = hexBoundaryPoint(
      OBSERVER_POSITION,
      nodeCenter,
      OBSERVER_RADIUS_X,
      OBSERVER_RADIUS_Y,
    );
    const end = hexBoundaryPoint(nodeCenter, OBSERVER_POSITION);
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  });

  return <CircuitStroke d={path} />;
}

function MagneticEdge({
  from,
  to,
  pointerX,
  pointerY,
  pointerActive,
}: {
  from: number;
  to: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  pointerActive: MotionValue<number>;
}) {
  const fromOffset = useMagneticOffset(from, pointerX, pointerY, pointerActive);
  const toOffset = useMagneticOffset(to, pointerX, pointerY, pointerActive);
  const path = useTransform(
    [fromOffset.x, fromOffset.y, toOffset.x, toOffset.y],
    ([fromX, fromY, toX, toY]) => {
      const startCenter = {
        x: NODE_POSITIONS[from].x + Number(fromX),
        y: NODE_POSITIONS[from].y + Number(fromY),
      };
      const endCenter = {
        x: NODE_POSITIONS[to].x + Number(toX),
        y: NODE_POSITIONS[to].y + Number(toY),
      };
      const start = hexBoundaryPoint(startCenter, endCenter);
      const end = hexBoundaryPoint(endCenter, startCenter);
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    },
  );

  return <CircuitStroke d={path} />;
}

function useMagneticOffset(
  index: number,
  pointerX: MotionValue<number>,
  pointerY: MotionValue<number>,
  pointerActive: MotionValue<number>,
) {
  const position = NODE_POSITIONS[index];
  const targetX = useTransform(
    [pointerX, pointerY, pointerActive],
    ([mouseX, mouseY, enabled]) =>
      magneticForce(position, Number(mouseX), Number(mouseY), Number(enabled)).x,
  );
  const targetY = useTransform(
    [pointerX, pointerY, pointerActive],
    ([mouseX, mouseY, enabled]) =>
      magneticForce(position, Number(mouseX), Number(mouseY), Number(enabled)).y,
  );
  return {
    x: useSpring(targetX, { stiffness: 150, damping: 25, mass: 0.55 }),
    y: useSpring(targetY, { stiffness: 150, damping: 25, mass: 0.55 }),
  };
}

function magneticForce(
  position: { x: number; y: number },
  mouseX: number,
  mouseY: number,
  enabled: number,
) {
  if (!enabled) return { x: 0, y: 0 };
  const dx = mouseX - position.x;
  const dy = mouseY - position.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const influenceRadius = 240;
  if (distance >= influenceRadius) return { x: 0, y: 0 };
  const proximity = 1 - distance / influenceRadius;
  const magnitude = Math.min(26, 520 / Math.max(distance, 20)) * proximity;
  return {
    x: (dx / distance) * magnitude,
    y: (dy / distance) * magnitude,
  };
}

function hexBoundaryPoint(
  center: { x: number; y: number },
  toward: { x: number; y: number },
  radiusX = HEX_RADIUS_X,
  radiusY = HEX_RADIUS_Y,
) {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / distance;
  const uy = dy / distance;
  const vertices = [
    { x: -radiusX / 2, y: -radiusY },
    { x: radiusX / 2, y: -radiusY },
    { x: radiusX, y: 0 },
    { x: radiusX / 2, y: radiusY },
    { x: -radiusX / 2, y: radiusY },
    { x: -radiusX, y: 0 },
  ];
  let nearest = Number.POSITIVE_INFINITY;

  for (let index = 0; index < vertices.length; index += 1) {
    const start = vertices[index];
    const end = vertices[(index + 1) % vertices.length];
    const edgeX = end.x - start.x;
    const edgeY = end.y - start.y;
    const denominator = ux * edgeY - uy * edgeX;
    if (Math.abs(denominator) < 0.0001) continue;
    const rayDistance = (start.x * edgeY - start.y * edgeX) / denominator;
    const edgePosition = (start.x * uy - start.y * ux) / denominator;
    if (rayDistance > 0 && edgePosition >= 0 && edgePosition <= 1) {
      nearest = Math.min(nearest, rayDistance);
    }
  }

  if (!Number.isFinite(nearest)) nearest = Math.min(radiusX, radiusY);

  return {
    x: center.x + ux * nearest,
    y: center.y + uy * nearest,
  };
}

function Contract({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0B0D12] p-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">{label}</p>
      <p className="mt-2 font-mono text-[11px] leading-5 text-zinc-300">{value}</p>
    </div>
  );
}
