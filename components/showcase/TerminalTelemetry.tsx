interface TerminalTelemetryProps {
  lines: string[];
  sessionId?: string;
}

export default function TerminalTelemetry({ lines, sessionId }: TerminalTelemetryProps) {
  return (
    <section className="px-5 pb-28 pt-10 sm:px-8 lg:px-12 lg:pb-36">
      <div className="mx-auto max-w-7xl">
        <details className="group overflow-hidden border border-emerald-500/20 bg-black/60 shadow-[0_22px_80px_rgba(0,0,0,0.35)] backdrop-blur-md [clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-4 transition hover:bg-emerald-500/[0.035] [&::-webkit-details-marker]:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent shadow-[0_0_12px_rgba(0,255,102,0.7)]" />
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-400/70">
                  Verification layer
                </p>
                <h2 className="mt-1 truncate text-sm font-medium tracking-wide text-zinc-300">
                  Unified telemetry reel
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden font-mono text-[9px] uppercase tracking-widest text-neutral-600 sm:inline">
                {sessionId ?? "registry-preview"} / {lines.length} events
              </span>
              <span className="font-mono text-lg text-neutral-500 transition-transform group-open:rotate-45">
                +
              </span>
            </div>
          </summary>

          <div className="border-t border-emerald-500/15">
            <div className="flex items-center gap-1.5 border-b border-neutral-900 bg-neutral-950 px-5 py-3">
              <span className="h-2 w-2 rounded-full bg-red-500/50" />
              <span className="h-2 w-2 rounded-full bg-amber-500/50" />
              <span className="h-2 w-2 rounded-full bg-accent/50" />
              <span className="ml-3 font-mono text-[9px] uppercase tracking-widest text-neutral-700">
                event stream / read only
              </span>
            </div>
            <pre className="max-h-80 overflow-auto p-5 font-mono text-[10px] leading-6 text-neutral-500 sm:p-7 sm:text-[11px]">
              <code>
                {lines.map((line, index) => (
                  <span key={`${index}-${line}`} className="block hover:text-neutral-300">
                    <span className="mr-4 select-none text-neutral-800">
                      {String(index + 1).padStart(3, "0")}
                    </span>
                    {line}
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </details>
      </div>
    </section>
  );
}
