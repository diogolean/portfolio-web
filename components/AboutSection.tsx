import profile from "@/data/profile.json";

export default function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative w-full max-w-4xl bg-gradient-to-br from-emerald-400/60 via-emerald-500/15 to-zinc-900 p-px shadow-[0_28px_100px_rgba(0,255,102,0.08)] [clip-path:polygon(18px_0,100%_0,100%_calc(100%-18px),calc(100%-18px)_100%,0_100%,0_18px)]"
    >
      <div className="relative overflow-hidden bg-zinc-950/90 p-6 backdrop-blur-xl [clip-path:polygon(18px_0,100%_0,100%_calc(100%-18px),calc(100%-18px)_100%,0_100%,0_18px)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(0,255,102,0.09),transparent_32%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:auto,24px_24px,24px_24px]" />
        <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 border-b border-l border-emerald-500/20 bg-emerald-400/[0.035]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_#00ff66]" />
              Executive profile / online
            </div>
            <h2 id="about-heading" className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {profile.name}
            </h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-emerald-300/70">
              {profile.role}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-200">{profile.tagline}</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">{profile.summary}</p>
          </div>

          <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {profile.metrics.map((metric, index) => (
              <div
                key={metric.label}
                className="border-l border-emerald-500/40 bg-black/35 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">
                  <span>Telemetry {String(index + 1).padStart(2, "0")}</span>
                  <span className="text-emerald-500/60">Live</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-emerald-300">{metric.value}</p>
                <p className="mt-1 text-xs text-zinc-400">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-8 border-t border-zinc-800/80 pt-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
            Core systems capability matrix
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {profile.competencies.map((competency, index) => (
              <li
                key={competency}
                className="flex items-center gap-3 border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5 text-xs text-zinc-300"
              >
                <span className="font-mono text-[9px] text-emerald-400/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {competency}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
