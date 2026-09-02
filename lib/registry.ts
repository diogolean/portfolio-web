// lib/registry.ts
// Server-only. Reads the SSG data contract from FRONTEND_BLUEPRINT.md §3.
// Never import "channels_config" or "core.economic_reel_lofi" here.

import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { marked } from "marked";
import type { ProjectArchitecture, ProjectMeta, ResolvedProject, GlobalTimeline } from "./types";

const SHOWCASE_ROOT = join(process.cwd(), "content/showcase/projects");
const TIMELINE_PATH = join(process.cwd(), "content/showcase/global_timeline.json");

/** §3.1 — the scan rule. Unknown slugs 404; missing folder → empty list, not a crash. */
export async function listProjectSlugs(): Promise<string[]> {
  if (!existsSync(SHOWCASE_ROOT)) return [];
  const dirs = await readdir(SHOWCASE_ROOT, { withFileTypes: true });
  const slugs: string[] = [];
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    if (existsSync(join(SHOWCASE_ROOT, d.name, "project.json"))) slugs.push(d.name);
  }
  return slugs;
}

async function readProjectMeta(slug: string): Promise<ProjectMeta | null> {
  try {
    const raw = await readFile(join(SHOWCASE_ROOT, slug, "project.json"), "utf-8");
    return JSON.parse(raw) as ProjectMeta;
  } catch {
    // Malformed project.json must not take down the whole registry scan.
    return null;
  }
}

/** Adapter: derive pipeline_stages from Aiwake-shaped agents/patterns when absent (§4). */
function deriveStagesFromAgents(arch: ProjectArchitecture): ProjectArchitecture {
  if (arch.pipeline_stages?.length || !arch.agents?.length) return arch;
  const derived = arch.agents.map((a) => ({
    id: a.id,
    kind: "llm" as const,
    label: a.display_name,
    detail: a.role,
    model: a.model,
    provider: a.provider,
  }));
  return { ...arch, pipeline_stages: derived };
}

async function readArchitecture(
  slug: string,
  telemetryFile = "architecture.json"
): Promise<ProjectArchitecture | null> {
  const path = join(SHOWCASE_ROOT, slug, telemetryFile);
  if (!existsSync(path)) return null;
  try {
    const raw = await readFile(path, "utf-8");
    const parsed = JSON.parse(raw) as ProjectArchitecture;
    // §9 checklist: schema mismatch → skip graphs, keep project.json working.
    if (parsed.schema_version !== "1.0") return null;
    return deriveStagesFromAgents(parsed);
  } catch {
    return null;
  }
}

async function readNarrative(slug: string, filenames: string[] = []) {
  const out: { filename: string; html: string }[] = [];
  for (const filename of filenames) {
    const path = join(SHOWCASE_ROOT, slug, filename);
    if (!existsSync(path)) continue;
    const raw = await readFile(path, "utf-8");
    const { content } = matter(raw);
    out.push({ filename, html: await marked.parse(content) });
  }
  return out;
}

export async function getProject(slug: string): Promise<ResolvedProject | null> {
  if (!existsSync(join(SHOWCASE_ROOT, slug, "project.json"))) return null;
  const meta = await readProjectMeta(slug);
  if (!meta) return null;
  const architecture = await readArchitecture(slug, meta.telemetry);
  const narrativeHtml = await readNarrative(slug, meta.narrative);
  return { meta, architecture, narrativeHtml };
}

const PROJECT_SLUG_ALIASES: Record<string, string> = {
  aiwake: "aiwake",
  master_mei: "master_mei",
  mastermei: "master_mei",
  wonder_feed: "wonder_feed",
  wonderfeed: "wonder_feed",
  anna_protocol: "anna_protocol",
  annas_garden: "anna_protocol",
  endless_summer_paradise: "endless_summer_paradise",
  endless_summers_paradise: "endless_summer_paradise",
  ancient_knowledge: "ancient_knowledge",
  momma_circle: "momma_circle",
};

/** Resolve URL-safe aliases to a registered filesystem slug without allowing path traversal. */
export async function getProjectBySlug(slug: string): Promise<ResolvedProject | null> {
  const normalized = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/-+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  const registered = await listProjectSlugs();
  const canonical = PROJECT_SLUG_ALIASES[normalized] ?? normalized;
  if (!registered.includes(canonical)) return null;
  return getProject(canonical);
}

export async function resolveCoverImage(slug: string, meta: ProjectMeta): Promise<string | null> {
  const named = meta.cover_image ?? meta.image;
  if (named) {
    if (named.startsWith("/")) return named;
    return assetUrl("images", slug, named);
  }
  return resolveHeroPoster(slug, null);
}

export async function getAllProjectsMeta(): Promise<ProjectMeta[]> {
  const slugs = await listProjectSlugs();
  const metas = await Promise.all(slugs.map(readProjectMeta));
  const present = metas.filter((m): m is ProjectMeta => m !== null);
  return Promise.all(
    present.map(async (meta) => {
      const cover = await resolveCoverImage(meta.slug, meta);
      return cover ? { ...meta, cover_image: cover } : meta;
    })
  );
}

/**
 * §9 checklist — a schema mismatch on optional data must degrade gracefully,
 * never crash `/`. The engine's own writer (portfolio_log.py) keys
 * `pipeline_nodes` as an object (`{ [nodeId]: { entries: [...] } }`), not the
 * array the blueprint sketches — normalize both shapes here so callers can
 * always treat it as `TimelineNode[]`.
 */
export async function getGlobalTimeline(): Promise<GlobalTimeline> {
  if (!existsSync(TIMELINE_PATH)) return { pipeline_nodes: [] };
  try {
    const raw = await readFile(TIMELINE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { pipeline_nodes?: unknown };
    const nodes = parsed?.pipeline_nodes;
    const pipeline_nodes: GlobalTimeline["pipeline_nodes"] = Array.isArray(nodes)
      ? nodes
      : nodes && typeof nodes === "object"
        ? Object.values(nodes as Record<string, unknown>)
        : [];
    return { pipeline_nodes: pipeline_nodes as GlobalTimeline["pipeline_nodes"] };
  } catch {
    return { pipeline_nodes: [] };
  }
}

/** §3.3 — resolve a public asset path; never trust absolute machine paths from telemetry. */
export function assetUrl(kind: "images" | "videos" | "canvas", slug: string, filename?: string) {
  if (!filename) return null;
  if (/^https?:/i.test(filename)) return null; // reject remote URLs per §3.3
  return `/showcase/${kind}/${slug}/${filename}`;
}

const IMAGE_EXT = /\.(png|webp|jpe?g)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

async function firstPublicAsset(
  kind: "images" | "videos",
  slug: string,
  matcher: RegExp,
  preferredTerm?: string
) {
  const dir = join(process.cwd(), "public/showcase", kind, slug);
  if (!existsSync(dir)) return null;
  try {
    const files = (await readdir(dir)).filter((filename) => matcher.test(filename));
    if (!files.length) return null;
    const preferred = preferredTerm
      ? files.find((filename) => filename.toLowerCase().includes(preferredTerm))
      : null;
    return assetUrl(kind, slug, preferred ?? [...files].sort()[0]);
  } catch {
    return null;
  }
}

export async function resolveHeroMedia(slug: string, architecture: ProjectArchitecture | null) {
  const declaredVideo = assetUrl("videos", slug, architecture?.media_assets?.reel);
  const video = declaredVideo ?? (await firstPublicAsset("videos", slug, VIDEO_EXT));
  const poster = await resolveHeroPoster(slug, architecture);
  return { video, poster };
}

/**
 * §5.1 Beat 1 — telemetry's `media_assets` wins when present; otherwise fall
 * back to whatever CI actually copied into public/showcase/images/[slug]
 * (dark variant preferred — the documented Wonder Feed v1 fallback, since it
 * ships narrative markdown + diagrams but no architecture.json).
 */
export async function resolveHeroPoster(
  slug: string,
  architecture: ProjectArchitecture | null
): Promise<string | null> {
  const fromTelemetry =
    assetUrl("images", slug, architecture?.media_assets?.poster) ??
    assetUrl("images", slug, architecture?.media_assets?.diagrams?.[0]);
  if (fromTelemetry) return fromTelemetry;

  return firstPublicAsset("images", slug, IMAGE_EXT, "dark");
}
