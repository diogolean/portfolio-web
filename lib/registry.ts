// lib/registry.ts
// Server-only. Reads the SSG data contract from FRONTEND_BLUEPRINT.md §3.
// Never import "channels_config" or "core.economic_reel_lofi" here.

import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { getProjectHighlights } from "./highlight-terms";
import type {
  ProjectArchitecture,
  ProjectMediaKind,
  ProjectMeta,
  ResolvedProject,
  GlobalTimeline,
} from "./types";

const SHOWCASE_ROOT = join(process.cwd(), "content/showcase/projects");
const TIMELINE_PATH = join(process.cwd(), "content/showcase/global_timeline.json");
const PROJECT_ENGINE_PATHS: Record<string, string> = {
  wonder_feed: "core/economic_reel_lofi",
  aiwake: "channels_config/aiwake",
  endless_summer_paradise: "channels_config/endless_summer_paradise",
  anna_protocol: "channels_config/anna_protocol",
  master_mei:
    "channels_config/master_mei + core/reel_sequence_engine.py + agents/media/mei_narrative.py",
  ancient_knowledge:
    "channels_config/ancient_knowledge + core/reel_sequence_engine.py + core/wan_reel_engine.py",
  momma_circle:
    "channels_config/momma_circle + core/reference_reel_engine.py + agents/posting/facebook_scheduler",
};

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
    const meta = JSON.parse(raw) as ProjectMeta;
    return {
      ...meta,
      engine_path: PROJECT_ENGINE_PATHS[meta.slug] ?? meta.engine_path,
    };
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
  awake: "aiwake",
  master_mei: "master_mei",
  mastermei: "master_mei",
  wonder_feed: "wonder_feed",
  wonderfeed: "wonder_feed",
  anna_protocol: "anna_protocol",
  annas_garden: "anna_protocol",
  endless_summer_paradise: "endless_summer_paradise",
  endless_summers_paradise: "endless_summer_paradise",
  endless_summer: "endless_summer_paradise",
  ancient_knowledge: "ancient_knowledge",
  momma_circle: "momma_circle",
};

/**
 * Header-row highlights only — 4–5 high-demand structural AI terms.
 * Generic libraries (Python, FFmpeg, JSON, MoviePy) stay off this surface.
 */
const PROJECT_TECH_STACKS: Record<string, readonly string[]> = {
  wonder_feed: [
    "Agent Orchestration",
    "DSPy Optimization",
    "GraphRAG / RAG",
    "State Machine Router",
    "Human Review Gates",
  ],
  aiwake: [
    "Agent Orchestration",
    "GraphRAG / RAG",
    "State Machine Router",
    "MCP Protocol",
    "Dual-Model Debate",
  ],
  endless_summer_paradise: [
    "Agent Orchestration",
    "State Machine Router",
    "Dynamic World State Engine",
    "Quality Failsafe",
    "SEO Metadata Graph",
  ],
  anna_protocol: [
    "Agent Orchestration",
    "GraphRAG / RAG",
    "MCP Protocol",
    "Persona DNA Router",
    "VisualArchitect",
  ],
  master_mei: [
    "Agent Orchestration",
    "State Machine Router",
    "GraphRAG / RAG",
    "Vision Critic Loop",
    "TTS Master Clock",
  ],
  ancient_knowledge: [
    "Agent Orchestration",
    "GraphRAG / RAG",
    "State Machine Router",
    "Two-Tier Pacing",
    "WAN Reel Engine",
  ],
  momma_circle: [
    "Agent Orchestration",
    "State Machine Router",
    "MCP Protocol",
    "Reference Reel Loop",
    "Browser Automation Host",
  ],
};

const HOME_TILE_CODENAMES: Record<string, string> = {
  aiwake: "Autonomous Multi-Agent Debate Engine",
};

const B2_PUBLIC_BASE = "https://MediaupscaleStorage.s3.us-east-005.backblazeb2.com";

/**
 * Primary hero media mode. Carousel/image projects must never resolve a video URL.
 */
export const PROJECT_MEDIA_KIND: Record<string, ProjectMediaKind> = {
  anna_protocol: "carousel",
};

/**
 * Home hex / thumbnail covers. Independent of the internal project gallery.
 * Do not overwrite these with carousel stills.
 */
export const PROJECT_COVER_IMAGES: Record<string, string> = {
  anna_protocol: "/showcase/images/anna_protocol/cover.webp",
};

/**
 * Curated stills only — no burned-in titles, subtitles, or UI overlays.
 * First image is the hero portrait (Anna's face, natural light).
 * Remaining slides are macro herb / preparation details.
 */
export const PROJECT_CAROUSEL_IMAGES: Record<string, readonly string[]> = {
  anna_protocol: [
    "/images/projects/annas_garden_portrait_clean.webp",
    "/images/projects/annas_garden_herbs_detail_1.webp",
    "/images/projects/annas_garden_herbs_detail_2.webp",
  ],
};

/**
 * Verified live Backblaze objects in MediaupscaleStorage.
 * Keys are canonical project slugs. HTTP URLs win over local fallbacks in
 * resolveHeroMedia / listPublicVideoUrls. anna_protocol is omitted because
 * it is an image-carousel channel with no source .mp4.
 */
export const PROJECT_B2_VIDEOS: Record<string, string> = {
  ancient_knowledge: `${B2_PUBLIC_BASE}/reel_this_geode_hides_a_secret_that_d_v01.mp4`,
  master_mei: `${B2_PUBLIC_BASE}/reel_your_mind_s_true_owner_isn_t_you_v30.mp4`,
  aiwake: `${B2_PUBLIC_BASE}/aiwake_debate_20260902_074022_cc7f88.mp4`,
  wonder_feed: `${B2_PUBLIC_BASE}/lofi_reel_forgiveness_putting_the_weight_down_20260828_004447_v01.mp4`,
  momma_circle: `${B2_PUBLIC_BASE}/lofi_reel_gentle_discipline_20260819_225322_v01.mp4`,
  endless_summer_paradise: `${B2_PUBLIC_BASE}/The_Terminus_1778730630_V4_LIVE_ULTIMATE_MASTER.mp4`,
};

export function canonicalProjectSlug(slug: string): string {
  return PROJECT_SLUG_ALIASES[slug] ?? slug;
}

export function getProjectMediaKind(slug: string): ProjectMediaKind {
  const canonical = canonicalProjectSlug(slug);
  return PROJECT_MEDIA_KIND[canonical] ?? PROJECT_MEDIA_KIND[slug] ?? "video";
}

export function isImageOnlyProject(slug: string) {
  const kind = getProjectMediaKind(slug);
  return kind === "carousel" || kind === "image";
}

export function getProjectCoverImage(slug: string): string | null {
  const canonical = canonicalProjectSlug(slug);
  const declared = PROJECT_COVER_IMAGES[canonical] ?? PROJECT_COVER_IMAGES[slug];
  if (declared && publicAssetExists(declared)) return declared;
  return null;
}

export function getProjectCarouselImages(slug: string): string[] {
  const canonical = canonicalProjectSlug(slug);
  const declared = PROJECT_CAROUSEL_IMAGES[canonical] ?? PROJECT_CAROUSEL_IMAGES[slug] ?? [];
  return declared.filter((url) => publicAssetExists(url));
}

export function getProjectB2Video(slug: string): string | null {
  if (isImageOnlyProject(slug)) return null;
  const canonical = canonicalProjectSlug(slug);
  return PROJECT_B2_VIDEOS[canonical] ?? PROJECT_B2_VIDEOS[slug] ?? null;
}

export function listProjectB2Videos(): Record<string, string | null> {
  return {
    endless_summer_paradise: getProjectB2Video("endless_summer_paradise"),
    ancient_knowledge: getProjectB2Video("ancient_knowledge"),
    master_mei: getProjectB2Video("master_mei"),
    annas_garden: getProjectB2Video("annas_garden"),
    aiwake: getProjectB2Video("aiwake"),
    wonder_feed: getProjectB2Video("wonder_feed"),
    momma_circle: getProjectB2Video("momma_circle"),
  };
}

const HOME_TILE_TAGS: Record<string, readonly string[]> = {
  master_mei: ["AGENT", "LLM"],
  aiwake: ["LLM", "MCP"],
  wonder_feed: ["AVATAR", "RAG"],
  endless_summer_paradise: ["MCP", "SIMULATION"],
  anna_protocol: ["AVATAR", "LLM"],
  ancient_knowledge: ["GraphRAG", "LLM"],
  momma_circle: ["WORKFLOW", "MCP"],
};

export function getProjectTechStack(slug: string): string[] {
  return getProjectHighlights(slug, [...(PROJECT_TECH_STACKS[slug] ?? [])]);
}

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
  const registryCover = getProjectCoverImage(slug);
  if (registryCover) return registryCover;
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
      return {
        ...meta,
        status: "active" as const,
        tags: [...(HOME_TILE_TAGS[meta.slug] ?? meta.tags)],
        ...(HOME_TILE_CODENAMES[meta.slug]
          ? { codename: HOME_TILE_CODENAMES[meta.slug] }
          : {}),
        ...(cover ? { cover_image: cover } : {}),
      };
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

/** Public web path, CDN URL, or null. Machine paths are never returned. */
export function assetUrl(kind: "images" | "videos" | "canvas", slug: string, filename?: string) {
  if (!filename) return null;
  const trimmed = filename.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/showcase/${kind}/${slug}/${trimmed}`;
}

const IMAGE_EXT = /\.(png|webp|jpe?g)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

export function publicAssetExists(url: string) {
  if (/^https?:\/\//i.test(url)) return true;
  if (!url.startsWith("/")) return false;
  return existsSync(join(process.cwd(), "public", ...url.replace(/^\//, "").split("/")));
}

export function videoMimeType(url: string) {
  if (/\.webm(?:$|\?)/i.test(url)) return "video/webm";
  if (/\.mov(?:$|\?)/i.test(url)) return "video/quicktime";
  return "video/mp4";
}

async function listPublicDir(kind: "images" | "videos", slug: string, matcher: RegExp) {
  const roots = [
    {
      dir: join(process.cwd(), "public/showcase", kind, slug),
      prefix: `/showcase/${kind}/${slug}`,
      flat: false,
    },
    {
      dir: join(process.cwd(), "public", kind, slug),
      prefix: `/${kind}/${slug}`,
      flat: false,
    },
    {
      dir: join(process.cwd(), "public", kind),
      prefix: `/${kind}`,
      flat: true,
    },
  ];
  const urls: string[] = [];
  for (const { dir, prefix, flat } of roots) {
    if (!existsSync(dir)) continue;
    try {
      const files = (await readdir(dir)).filter(
        (filename) =>
          matcher.test(filename) &&
          (!flat || filename.replace(/\.[^.]+$/, "") === slug)
      );
      for (const filename of files) urls.push(`${prefix}/${filename}`);
    } catch {
      // Directory can disappear while CI is still copying artifacts.
    }
  }
  return urls;
}

async function firstPublicAsset(
  kind: "images" | "videos",
  slug: string,
  matcher: RegExp,
  preferredTerm?: string
) {
  const files = await listPublicDir(kind, slug, matcher);
  if (!files.length) return null;
  const preferred = preferredTerm
    ? files.find((url) => url.toLowerCase().includes(preferredTerm))
    : null;
  return preferred ?? files[0];
}

export async function listPublicVideoUrls(slug: string) {
  const urls = await listPublicDir("videos", slug, VIDEO_EXT);
  const remote = getProjectB2Video(slug);
  return remote ? [remote, ...urls.filter((url) => url !== remote)] : urls;
}

export async function resolveHeroMedia(slug: string, architecture: ProjectArchitecture | null) {
  const images = getProjectCarouselImages(slug);
  if (isImageOnlyProject(slug)) {
    const poster =
      images[0] ??
      (await resolveHeroPoster(slug, architecture)) ??
      (await firstPublicAsset("images", slug, IMAGE_EXT));
    return { video: null, poster, images: images.length ? images : poster ? [poster] : [] };
  }

  const remote = getProjectB2Video(slug);
  const declaredVideo = assetUrl("videos", slug, architecture?.media_assets?.reel);
  const declaredOk =
    declaredVideo && (declaredVideo.startsWith("http") || publicAssetExists(declaredVideo))
      ? declaredVideo
      : null;
  const video = remote ?? declaredOk ?? (await firstPublicAsset("videos", slug, VIDEO_EXT));
  const poster = await resolveHeroPoster(slug, architecture);
  return { video, poster, images: images.length ? images : poster ? [poster] : [] };
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
  if (fromTelemetry && publicAssetExists(fromTelemetry)) return fromTelemetry;

  const videoPosterExtensions = ["webp", "jpg", "jpeg", "png"];
  for (const extension of videoPosterExtensions) {
    const videoPoster = `/videos/posters/${slug}.${extension}`;
    if (publicAssetExists(videoPoster)) return videoPoster;
  }

  return firstPublicAsset("images", slug, IMAGE_EXT, "dark");
}
