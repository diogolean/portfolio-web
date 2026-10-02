import { AIWAKE_TERMINAL_REEL_URL } from "@/lib/aiwake-showcase";

const journeyCards = [
  {
    number: "01",
    badge: "BRANCH // 01 · COMPUTE",
    branch: "Bypass diffusion",
    title: "The Cloud Diffusion Trap",
    challenge:
      "Sora, Runway, and HeyGen took 5–10 minutes per video, burned $2–$5 per finished minute, and introduced temporal face flicker.",
    breakthrough:
      "A deterministic 2D parametric media pipeline replaced diffusion with Python raster composition: a broadcast-ready reel in 19 seconds, twice real-time speed, with zero GPU cost.",
    tags: ["19s COMPILE", "$0 GPU", "DETERMINISTIC"],
    accent: "#00F0FF",
  },
  {
    number: "02",
    badge: "BRANCH // 02 · AESTHETICS",
    branch: "Cel-shaded rig",
    title: 'The "Uncanny Valley" vs "Crude Vector" Dilemma',
    challenge:
      "Naive geometry looked like a 2004 Flash toy. Photoreal 2D mouth swaps looked worse: texture seams, dead eyes, and uncanny facial motion.",
    breakthrough:
      "A 90s cel-shaded mecha language made the constraints intentional. Rhubarb C++ drives acoustic A–H visemes while shot-reverse-shot staging preserves cinematic lead room.",
    tags: ["9-VISEME SYNC", "CEL-SHADED", "SHOT / REVERSE"],
    accent: "#FFB300",
  },
] as const;

const telemetryRows = [
  ["Event Mesh Latency", "<8ms"],
  ["Token Consumption", "Minimal (Text-State Only)"],
  ["Framing Engine", "Dynamic Typewriter Kinematics"],
  ["Audio Stack", "Edge-TTS + Ambient Sci-Fi Drone BGM"],
] as const;

export default function AiwakeEngineeringCaseStudy() {
  return (
    <section
      aria-labelledby="aiwake-engineering-journey"
      className="relative border-y border-white/[0.06] bg-[#0A0E12] px-5 pb-12 pt-20 sm:px-8 md:pb-16 lg:px-12 lg:pt-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="relative mx-auto max-w-[1500px] max-lg:pl-10">
        <header className="max-w-3xl lg:max-w-[44%] lg:pr-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00F0FF]">
            Bridge / architectural decisions
          </p>
          <h2
            id="aiwake-engineering-journey"
            className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            The 19-Second Compile Barrier: Why We Left Cloud Diffusion
          </h2>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            The player above is the current state: a broadcast 2D anime engine that compiles a
            reel in under 19 seconds. These two branches are the decisions that made it possible —
            leaving cloud diffusion, then replacing both crude vectors and photoreal mouth swaps
            with a parametric cel-shaded rig. The trace terminates in the terminal compiler that
            first proved 7× realtime throughput and a sub-10ms event bus, before a diffusion
            credit was ever spent.
          </p>
        </header>

        <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-10 xl:gap-14">
          {journeyCards.map((card, index) => (
            <article
              key={card.number}
              data-spine-branch={card.branch}
              className={`relative overflow-hidden border border-white/10 bg-zinc-950/70 p-5 sm:p-7 ${
                index === 1 ? "lg:ml-10 xl:ml-14" : ""
              }`}
              style={{ boxShadow: `inset 3px 0 0 ${card.accent}66` }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00FF66]">
                {card.badge}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-white">{card.title}</h3>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-rose-300">
                    Challenge
                  </p>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">{card.challenge}</p>
                </div>
                <div className="border-l border-[#00FF66]/40 pl-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#00FF66]">
                    Breakthrough
                  </p>
                  <p className="mt-2 text-xs leading-5 text-zinc-300">{card.breakthrough}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-white/10 bg-white/[0.035] px-2.5 py-1 font-mono text-[8px] tracking-[0.12em] text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <article
          aria-labelledby="aiwake-origins"
          data-spine-terminus="Foundation"
          className="relative mt-20 overflow-hidden border border-[#00FF66]/25 bg-black/45 shadow-[0_28px_100px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF66] to-transparent" />
          <header className="border-b border-white/10 p-5 sm:p-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#00FF66]">
              Foundation layer / pre-animation architecture
            </p>
            <h2
              id="aiwake-origins"
              className="mt-3 max-w-4xl font-mono text-xl font-bold uppercase tracking-tight text-white sm:text-3xl"
            >
              Origins: Real-Time Terminal Telemetry Engine
            </h2>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.13em] text-[#00F0FF] sm:text-xs">
              Deterministic State-Machine Observability &amp; Zero-Token Visual Compiling
            </p>
            <p className="mt-4 max-w-3xl text-xs leading-5 text-zinc-400">
              This is the same pipe before it had a face. A headless CPU rasterizer established
              the 7× compile rate and the sub-10ms bus. The anime rig above is that runtime
              wearing a cel-shaded body.
            </p>
          </header>

          <div className="flex flex-col items-center gap-6 p-4 sm:p-7 lg:flex-row lg:items-center lg:justify-center lg:gap-10">
            <div className="w-full max-w-[360px] shrink-0">
              <div className="border border-[#143024] bg-[#050807] shadow-[inset_0_0_0_1px_rgba(0,255,102,0.08),0_0_42px_rgba(0,255,102,0.07)]">
                <div className="flex h-9 items-center gap-2 border-b border-[#00FF66]/20 bg-[#07110b] px-3">
                  <span className="flex shrink-0 gap-1.5" aria-hidden>
                    <i className="h-1.5 w-1.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
                    <i className="h-1.5 w-1.5 rounded-full bg-[#00FF66]/35" />
                    <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FFB300] shadow-[0_0_8px_#FFB300]" />
                  </span>
                  <span className="min-w-0 flex-1 font-mono text-[7px] uppercase leading-none tracking-[0.04em] text-[#00FF66]/80 sm:text-[8px] sm:tracking-[0.08em]">
                    AIWAKE://TELEMETRY-RENDER-NODE
                  </span>
                  <span className="shrink-0 font-mono text-[8px] text-[#00FF66]/55">9:16</span>
                </div>
                <div className="relative aspect-[9/16] overflow-hidden bg-black">
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={AIWAKE_TERMINAL_REEL_URL}
                    controls
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 bottom-12 opacity-20 [background:repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,255,102,0.16)_4px)]"
                    aria-hidden
                  />
                </div>
              </div>
            </div>

            <aside className="w-full min-w-0 lg:max-w-sm">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#00FF66]">
                  Live inspection
                </p>
                <span className="flex items-center gap-1.5 font-mono text-[8px] text-[#00FF66]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00FF66]" />
                  EVENT BUS ONLINE
                </span>
              </div>

              <div className="mt-5 space-y-2">
                {telemetryRows.map(([label, value]) => (
                  <div key={label} className="border border-white/[0.07] bg-white/[0.025] p-3">
                    <span className="block font-mono text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                      {label}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] leading-4 text-[#00F0FF]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="grid border-t border-white/10 md:grid-cols-3">
            <OriginStat
              value="7.0× REAL-TIME"
              detail="~2.2s compile for a 15-second reel"
              accent="#00FF66"
            />
            <OriginStat
              value="ZERO DIFFUSION"
              detail="Headless CPU rasterization: Pillow matrix + CRT scanlines"
              accent="#00F0FF"
            />
            <OriginStat
              value="SUB-10ms BUS"
              detail="FSM transitions, token latency, and dialectic friction on-screen"
              accent="#FFB300"
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-white/10 p-5 sm:px-8">
            {["⚡ 7x Realtime", "💾 Zero-Disk RAM Pipe", "🗣️ 9-Viseme Sync", "0% Cloud GPU"].map(
              (badge) => (
                <span
                  key={badge}
                  className="border border-[#00FF66]/20 bg-[#00FF66]/[0.045] px-3 py-1.5 font-mono text-[9px] text-[#00FF66]"
                >
                  {badge}
                </span>
              )
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function OriginStat({
  value,
  detail,
  accent,
}: {
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <div className="border-b border-white/10 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:p-7">
      <p className="font-mono text-sm font-bold" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-2 text-[11px] leading-5 text-zinc-500">{detail}</p>
    </div>
  );
}
