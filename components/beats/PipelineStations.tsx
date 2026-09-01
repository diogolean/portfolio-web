import type { ProjectArchitecture } from "@/lib/types";

interface PipelineStationsProps {
  architecture: ProjectArchitecture | null;
  narrativeHtml: { filename: string; html: string }[];
}

export default function PipelineStations({ architecture, narrativeHtml }: PipelineStationsProps) {
  const stages = architecture?.pipeline_stages ?? [];

  return (
    <section className="flex flex-col gap-16 px-6 py-32">
      {stages.length > 0 && (
        <div className="mx-auto flex w-full max-w-5xl gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="min-w-[220px] shrink-0 rounded-lg border border-hairline bg-chrome/60 p-5"
            >
              <span className="font-mono text-[10px] uppercase text-accent/80">{stage.kind}</span>
              <p className="mt-2 text-sm text-foreground">{stage.label}</p>
              {stage.detail && <p className="mt-1 text-xs text-muted">{stage.detail}</p>}
              {(stage.model || stage.provider) && (
                <p className="mt-3 font-mono text-[10px] text-muted">
                  {[stage.provider, stage.model].filter(Boolean).join(" / ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {narrativeHtml.length > 0 && (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
          {narrativeHtml.map((n) => (
            <article
              key={n.filename}
              className="prose prose-invert prose-sm max-w-none prose-headings:font-medium prose-a:text-accent"
              dangerouslySetInnerHTML={{ __html: n.html }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
