import { getAllProjectsMeta, getGlobalTimeline } from "@/lib/registry";
import HexMosaic from "@/components/HexMosaic";

export default async function HomePage() {
  const projects = await getAllProjectsMeta();
  const timeline = await getGlobalTimeline();

  const entries = timeline.pipeline_nodes
    .flatMap((n) => n.entries)
    .filter((e) =>
      ["module_close", "root_cause_fix", "architecture_decision", "milestone"].includes(e.kind)
    )
    .slice(0, 6);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center px-6 py-24">
      <p className="mb-4 text-xs text-muted">Omni Engine</p>
      <h1 className="text-hero max-w-3xl text-center font-semibold">
        An ecosystem of automated pipelines.
      </h1>
      <p className="mt-6 max-w-lg text-center text-sm text-muted">
        Each channel is a swappable engine. This site is a static registry of how they
        are built — not a CMS.
      </p>

      <div className="mt-20">
        {projects.length > 0 ? (
          <HexMosaic projects={projects} />
        ) : (
          <p className="text-sm text-muted">No channels registered yet.</p>
        )}
      </div>

      {entries.length > 0 && (
        <section className="mt-28 w-full max-w-2xl border-t border-hairline pt-10">
          <ul className="flex flex-col gap-6">
            {entries.map((e, i) => (
              <li key={i} className="flex flex-col gap-1">
                <span className="font-mono text-xs text-muted">{e.date}</span>
                <span className="text-sm text-foreground">{e.what}</span>
                <span className="text-xs text-muted">{e.why}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
