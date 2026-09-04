import Image from "next/image";
import type { ProjectArchitecture, ProjectMeta } from "@/lib/types";
import { assetUrl, resolveHeroPoster } from "@/lib/registry";

interface ProjectHeroProps {
  meta: ProjectMeta;
  architecture: ProjectArchitecture | null;
}

export default async function ProjectHero({ meta, architecture }: ProjectHeroProps) {
  const reelUrl = assetUrl("videos", meta.slug, architecture?.media_assets?.reel);
  const posterUrl = reelUrl ? null : await resolveHeroPoster(meta.slug, architecture);

  return (
    <section className="flex min-h-screen flex-col justify-center gap-8 px-6 py-24">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-xs text-muted">{meta.codename ?? meta.slug}</p>
        <h1 className="mt-2 text-hero font-semibold">{meta.title}</h1>
        <p className="mt-4 max-w-xl text-sm text-muted">{meta.summary}</p>

        <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-lg border border-hairline bg-chrome">
          {reelUrl ? (
            <video
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              crossOrigin={/^https?:\/\//i.test(reelUrl) ? undefined : "anonymous"}
              className="h-full w-full object-cover motion-reduce:hidden"
            >
              <source src={reelUrl} type={reelUrl.endsWith(".webm") ? "video/webm" : "video/mp4"} />
            </video>
          ) : posterUrl ? (
            // Intrinsic size matches the container's `aspect-video` (16:9) ratio;
            // CSS then stretches it to fill — avoids layout shift while staying responsive.
            <Image
              src={posterUrl}
              alt={`${meta.title} still`}
              width={1600}
              height={900}
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              Output pending — registry stub.
            </div>
          )}
        </div>

        {architecture && (
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
            {architecture.session_id && <span>{architecture.session_id}</span>}
            {architecture.topic && <span>{architecture.topic}</span>}
            {architecture.pipeline_execution_s != null && (
              <span>{architecture.pipeline_execution_s}s</span>
            )}
            {architecture.end_reason && <span>{architecture.end_reason}</span>}
          </div>
        )}
      </div>
    </section>
  );
}
