import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, getProjectMediaKind, getProjectTechStack } from "@/lib/registry";
import { getProjectPipeline } from "@/lib/projects-data";
import { discoverProjectMediaAssets } from "@/lib/media-discovery";
import {
  LanguageProvider,
  LocalizedLabel,
} from "@/components/showcase/LanguageProvider";
import ScrollStoryline from "@/components/showcase/ScrollStoryline";
import ProjectHeaderControls from "@/components/showcase/ProjectHeaderControls";
import ShowcaseConduit from "@/components/showcase/ShowcaseConduit";
import TerminalTelemetry from "@/components/showcase/TerminalTelemetry";

// Artifact availability changes independently of the application build.
export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const { meta, architecture } = project;
  const showcase = getProjectPipeline(project);
  const media = await discoverProjectMediaAssets(meta.slug, architecture);
  const mediaKind = getProjectMediaKind(meta.slug);
  if (!showcase.nodes.length) notFound();
  const graphTechnologies = getProjectTechStack(meta.slug);

  return (
    <LanguageProvider>
      <main id="project-showcase-root" className="relative min-h-screen bg-bg">
        <header className="relative z-10 isolate px-5 pb-3 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pt-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_70%_12%,rgba(0,255,102,0.12),transparent_38%),radial-gradient(circle_at_15%_35%,rgba(59,130,246,0.08),transparent_28%)]" />
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-3 pr-16">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_12px_#00ff66]" />
                {meta.codename ?? meta.slug} / architecture record
              </div>
              <Link
                href="/"
                aria-label="Return home"
                className="group absolute right-8 top-4 z-50 grid h-12 w-12 place-items-center text-zinc-500 transition hover:text-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <svg
                  viewBox="0 0 100 100"
                  aria-hidden
                  className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                >
                  <polygon
                    points="50,3 90.7,26.5 90.7,73.5 50,97 9.3,73.5 9.3,26.5"
                    fill="rgba(9,9,11,0.94)"
                    stroke="rgba(52,211,153,0.55)"
                    strokeWidth="2"
                    className="transition group-hover:stroke-emerald-300"
                  />
                </svg>
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden
                  className="relative h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3.5 9 6.5-5.5L16.5 9" />
                  <path d="M5.5 8v8h9V8M8.5 16v-5h3v5" />
                </svg>
                <span className="sr-only">Home</span>
              </Link>
            </div>
            <div className="mt-3 grid items-end gap-3 lg:grid-cols-[1.1fr_0.9fr]">
              <h1 className="max-w-5xl pr-16 text-2xl font-bold text-foreground sm:pr-0 sm:text-3xl">
                {meta.title}
              </h1>
              <p className="max-w-2xl text-xs leading-5 text-neutral-400">{meta.summary}</p>
            </div>

            <div
              id="project-hero-card"
              className="relative z-10 mt-4 grid overflow-hidden border border-emerald-500/20 bg-neutral-900/55 backdrop-blur-xl md:grid-cols-2"
              style={{
                clipPath:
                  "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
              }}
            >
              <div className="p-3 sm:px-4 sm:py-3">
                <LocalizedLabel
                  k="production_challenge"
                  className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500"
                />
                <p className="mt-2 text-xs leading-5 text-neutral-300">{showcase.challenge}</p>
              </div>
              <div className="border-t border-neutral-800 p-3 sm:px-4 sm:py-3 md:border-l md:border-t-0">
                <LocalizedLabel
                  k="engineered_outcome"
                  className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500"
                />
                <p className="mt-2 text-xs leading-5 text-neutral-300">{showcase.outcome}</p>
              </div>
              <div className="border-t border-neutral-800 px-3 py-2.5 sm:px-4 md:col-span-2">
                <ProjectHeaderControls
                  nodes={showcase.nodes}
                  stack={graphTechnologies}
                  processingTime={showcase.processingTime}
                />
              </div>
            </div>
          </div>
        </header>

        <ScrollStoryline
          slug={meta.slug}
          nodes={showcase.nodes}
          media={media}
          mediaKind={mediaKind}
        />
        <TerminalTelemetry lines={showcase.telemetry} sessionId={architecture?.session_id} />
        <ShowcaseConduit />
      </main>
    </LanguageProvider>
  );
}
