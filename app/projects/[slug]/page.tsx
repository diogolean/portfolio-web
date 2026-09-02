import { notFound } from "next/navigation";
import { getProject } from "@/lib/registry";
import { parseProjectShowcase } from "@/lib/project-parser";
import { discoverProjectMedia } from "@/lib/media-discovery";
import ScrollStoryline from "@/components/showcase/ScrollStoryline";
import TerminalTelemetry from "@/components/showcase/TerminalTelemetry";

// Artifact availability changes independently of the application build.
export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { meta, architecture } = project;
  const showcase = parseProjectShowcase(project);
  const media = await discoverProjectMedia(slug, architecture);

  return (
    <main className="min-h-screen overflow-hidden bg-bg">
      <header className="relative isolate px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pb-36 lg:pt-40">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(circle_at_70%_12%,rgba(0,255,102,0.12),transparent_38%),radial-gradient(circle_at_15%_35%,rgba(59,130,246,0.08),transparent_28%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_12px_#00ff66]" />
            {meta.codename ?? meta.slug} / architecture record
          </div>
          <h1 className="mt-7 max-w-5xl text-hero font-semibold text-foreground">{meta.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-400">{meta.summary}</p>

          <div className="mt-14 grid overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/55 backdrop-blur-xl md:grid-cols-2">
            <div className="p-6 sm:p-8">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
                Production challenge
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">{showcase.challenge}</p>
            </div>
            <div className="border-t border-neutral-800 p-6 sm:p-8 md:border-l md:border-t-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
                Engineered outcome
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">{showcase.outcome}</p>
            </div>
            <div className="border-t border-neutral-800 px-6 py-5 sm:px-8 md:col-span-2">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="font-mono text-[10px] text-accent">
                  {showcase.nodes.length} real stages
                </span>
                <span className="font-mono text-[10px] text-neutral-500">
                  {showcase.processingTime}
                </span>
                {showcase.stack.map((technology) => (
                  <span key={technology} className="font-mono text-[10px] text-neutral-400">
                    {technology}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <ScrollStoryline slug={slug} nodes={showcase.nodes} media={media} />
      <TerminalTelemetry lines={showcase.telemetry} sessionId={architecture?.session_id} />
    </main>
  );
}
