import Image from "next/image";
import type { ProjectMeta } from "@/lib/types";

interface ProjectHeroPlayerProps {
  meta: ProjectMeta;
  video: string | null;
  poster: string | null;
  productionCost: string;
  processingTime: string;
  stack: string[];
}

export default function ProjectHeroPlayer({
  meta,
  video,
  poster,
  productionCost,
  processingTime,
  stack,
}: ProjectHeroPlayerProps) {
  return (
    <section className="relative isolate overflow-hidden px-5 pb-24 pt-32 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[44rem] bg-[radial-gradient(circle_at_68%_16%,rgba(0,255,102,0.12),transparent_38%),radial-gradient(circle_at_18%_30%,rgba(59,130,246,0.08),transparent_30%)]" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid items-end gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_12px_#00ff66]" />
              Production system / {meta.status}
            </div>
            <h1 className="max-w-4xl text-hero font-semibold text-foreground">{meta.title}</h1>
          </div>
          <p className="max-w-xl text-sm leading-7 text-neutral-400 lg:justify-self-end">
            {meta.summary}
          </p>
        </div>

        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/40 sm:aspect-video">
          {video ? (
            <video
              poster={poster ?? undefined}
              controls
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              className="h-full w-full object-cover"
            >
              <source
                src={video}
                type={video.endsWith(".webm") ? "video/webm" : video.endsWith(".mov") ? "video/quicktime" : "video/mp4"}
              />
            </video>
          ) : poster ? (
            <Image
              src={poster}
              alt={`${meta.title} generated output`}
              fill
              priority
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(135deg,#111827,#09090b_50%,#07110b)] text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                Artifact registry
              </span>
              <p className="mt-3 text-sm text-neutral-400">Output will appear after the first run.</p>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/70 backdrop-blur-md">
            {meta.codename ?? meta.slug}
          </div>
        </div>

        <div className="relative -mt-px grid overflow-hidden rounded-b-2xl border border-neutral-800 bg-neutral-900/70 shadow-xl backdrop-blur-xl md:grid-cols-[0.8fr_1fr_2.2fr]">
          <Metric label="Estimated production" value={productionCost} />
          <Metric label="End-to-end processing" value={processingTime} />
          <div className="border-t border-neutral-800 px-5 py-4 md:border-l md:border-t-0">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
              Runtime stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-neutral-700 bg-neutral-950/70 px-2.5 py-1 font-mono text-[10px] text-neutral-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-neutral-800 px-5 py-4 first:border-t-0 md:border-l md:border-t-0 md:first:border-l-0">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
