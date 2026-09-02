interface TerminalTelemetryProps {
  lines: string[];
  sessionId?: string;
}

export default function TerminalTelemetry({ lines, sessionId }: TerminalTelemetryProps) {
  return (
    <section className="px-5 pb-32 pt-16 sm:px-8 lg:px-12 lg:pb-44">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
            Verification layer
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            Unified telemetry reel
          </h2>
          <p className="mt-3 text-sm leading-7 text-neutral-500">
            The presentation is editorial. The event stream below is the execution record.
          </p>
        </div>

        <details className="group overflow-hidden rounded-2xl border border-neutral-800 bg-[#050607] shadow-2xl shadow-black/30">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.025] [&::-webkit-details-marker]:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_12px_rgba(0,255,102,0.7)]" />
              <span className="truncate font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                {sessionId ?? "registry-preview"} / {lines.length} events
              </span>
            </div>
            <span className="font-mono text-lg text-neutral-600 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>

          <div className="border-t border-neutral-800">
            <div className="flex items-center gap-1.5 border-b border-neutral-900 bg-neutral-950 px-5 py-3">
              <span className="h-2 w-2 rounded-full bg-red-500/50" />
              <span className="h-2 w-2 rounded-full bg-amber-500/50" />
              <span className="h-2 w-2 rounded-full bg-accent/50" />
              <span className="ml-3 font-mono text-[9px] uppercase tracking-widest text-neutral-700">
                event stream / read only
              </span>
            </div>
            <pre className="max-h-[32rem] overflow-auto p-5 font-mono text-[10px] leading-6 text-neutral-500 sm:p-7 sm:text-[11px]">
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
