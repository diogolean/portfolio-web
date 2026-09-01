import type { ProjectArchitecture } from "@/lib/types";

interface AutomationCloseProps {
  architecture: ProjectArchitecture | null;
}

const DEFAULT_STEPS = ["Generate", "Queue", "Publish"];

export default function AutomationClose({ architecture }: AutomationCloseProps) {
  const schedulerStage = architecture?.pipeline_stages.find((s) => s.kind === "scheduler");

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-32">
      <h2 className="text-sm text-muted">Automation</h2>
      <p className="text-sm text-foreground">
        Generation is not the product; unattended ship is.
      </p>

      <div className="flex items-center gap-3 font-mono text-xs text-muted">
        {(schedulerStage ? [schedulerStage.label] : DEFAULT_STEPS).map((step, i, arr) => (
          <span key={step} className="flex items-center gap-3">
            <span className="rounded border border-hairline px-3 py-1.5 text-foreground">
              {step}
            </span>
            {i < arr.length - 1 && <span>→</span>}
          </span>
        ))}
      </div>

      {schedulerStage?.detail && <p className="text-xs text-muted">{schedulerStage.detail}</p>}
    </section>
  );
}
