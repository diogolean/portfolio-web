// lib/types.ts
// Mirrors FRONTEND_BLUEPRINT.md §4. Do not add fields the blueprint doesn't list.

export const SHOWCASE_SCHEMA = "1.0" as const;

export type ProjectStatus = "active" | "registry" | "archived";
export type ProjectMediaKind = "video" | "image" | "carousel";

/** data/projects/[slug]/project.json — registry card, always present */
export interface ProjectMeta {
  slug: string;
  title: string;
  codename?: string;
  status: ProjectStatus;
  summary: string;
  engine_path: string;
  tags: string[];
  narrative?: string[]; // md filenames, display order
  telemetry?: string; // json filename, default "architecture.json"
  cover_image?: string; // public path or filename under /showcase/images/[slug]/
  image?: string; // alias for cover_image
}

export interface PipelineStage {
  id: string;
  kind:
    | "llm"
    | "rag"
    | "tts"
    | "mix"
    | "render"
    | "comfyui"
    | "heygen"
    | "kling"
    | "qa"
    | "scheduler"
    | string;
  label: string;
  detail?: string;
  model?: string;
  provider?: string;
}

export interface DesignPattern {
  name: "Observer" | "Strategy" | "Factory" | "Pub/Sub" | "SOLID" | string;
  applied: boolean;
  where: string;
  principle?: "SRP" | "OCP" | "LSP" | "ISP" | "DIP";
}

export interface MediaAssets {
  poster?: string; // filename under /showcase/images/[slug]/
  reel?: string; // filename under /showcase/videos/[slug]/
  diagrams?: string[]; // filenames under /showcase/images/[slug]/
}

export interface AgentSeat {
  id: string;
  role: string;
  display_name: string;
  model: string;
  provider: string;
  persona?: string;
}

export interface RagRecall {
  turn_index: number | null;
  role: string | null;
  blocks: number;
  chars: number;
  preview: string[];
  applied: boolean;
}

export interface DecisionNode {
  step: string;
  pattern?: string;
  [key: string]: unknown;
}

export interface Milestone {
  event: string;
  t_s: number;
  [key: string]: unknown;
}

/** Optional machine telemetry (architecture.json) */
export interface ProjectArchitecture {
  schema_version: "1.0";
  project_meta?: Partial<ProjectMeta>;
  tech_stack: string[];
  pipeline_stages: PipelineStage[];
  design_patterns: DesignPattern[];
  media_assets: MediaAssets;
  frontend?: { consumer: string; framework: string; showcase: string };
  session_id?: string;
  topic?: string;
  started_at?: string;
  ended_at?: string;
  pipeline_execution_s?: number;
  end_reason?: string;
  agents?: AgentSeat[];
  models?: Record<string, string>;
  llm_providers?: Record<string, string>;
  rag?: { applied: boolean; recalls: RagRecall[] };
  decision_tree?: DecisionNode[];
  milestones?: Milestone[];
  media?: Record<string, unknown>;
  patterns?: Record<string, unknown>;
}

/** Fully resolved project — what the page components actually receive */
export interface ResolvedProject {
  meta: ProjectMeta;
  architecture: ProjectArchitecture | null;
  narrativeHtml: { filename: string; html: string }[];
}

export interface TimelineEntry {
  date: string;
  what: string;
  why: string;
  kind: "module_close" | "root_cause_fix" | "architecture_decision" | "milestone" | string;
}

export interface TimelineNode {
  entries: TimelineEntry[];
}

export interface GlobalTimeline {
  pipeline_nodes: TimelineNode[];
}
