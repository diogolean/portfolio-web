import "server-only";

import { existsSync } from "fs";
import { readdir, stat } from "fs/promises";
import { extname, join, relative, sep } from "path";
import type { ProjectArchitecture } from "./types";
import {
  getProjectCarouselImages,
  isImageOnlyProject,
  listPublicVideoUrls,
  resolveHeroMedia,
} from "./registry";

export type MediaKind = "video" | "image";

export interface ProjectMediaAsset {
  kind: MediaKind;
  url: string;
  filename: string;
  source: "public" | "external";
}

const EXTERNAL_OUTPUT_ROOT =
  process.env.SHOWCASE_OUTPUT_ROOT ??
  "G:\\My Drive\\Z sosFiles\\Z_act\\@ NETWORK\\@MEDIAUPSCALE_FACTORY_DYNAMIC_CONTENT\\Unified Multi-Page Factory\\outputs";
const ENDLESS_SUMMER_PRODUCTION_ROOT =
  process.env.ENDLESS_SUMMER_PRODUCTION_ROOT ??
  "G:\\My Drive\\Z sosFiles\\Z_act\\@ NETWORK\\@ MEDIAUPSCALE_FACTORY\\Endless_Summers_Paradise - Production";
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);
const IMAGE_EXTENSIONS = new Set([".png", ".webp", ".jpg", ".jpeg"]);

function mediaKind(filename: string): MediaKind | null {
  const extension = extname(filename).toLowerCase();
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  return null;
}

async function newestMediaFiles(root: string, maxDepth = 4, limit = 30) {
  if (!existsSync(root)) return [];
  const candidates: Array<{ path: string; modified: number }> = [];

  async function walk(directory: string, depth: number) {
    if (depth > maxDepth || candidates.length >= 250) return;
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    await Promise.all(
      entries.map(async (entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return walk(path, depth + 1);
        if (!entry.isFile() || !mediaKind(entry.name)) return;
        try {
          const metadata = await stat(path);
          candidates.push({ path, modified: metadata.mtimeMs });
        } catch {
          // A producer may still be atomically moving a file into place.
        }
      })
    );
  }

  await walk(root, 0);
  return candidates
    .filter(({ path }) => !/[\\/](reproved|tests?|temp|work|visualqa_agent_judge)[\\/]/i.test(path))
    .sort((a, b) => {
      const score = (path: string) =>
        (VIDEO_EXTENSIONS.has(extname(path).toLowerCase()) ? 100 : 0) +
        (/[\\/]clips[\\/]/i.test(path) ? 30 : 0) +
        (/(_final|ultimate_master)\./i.test(path) ? 15 : 0);
      return score(b.path) - score(a.path) || b.modified - a.modified;
    })
    .slice(0, limit)
    .map(({ path }) => path);
}

export function getExternalOutputRoot() {
  return EXTERNAL_OUTPUT_ROOT;
}

export function getProjectMediaRoots(slug: string) {
  const roots = [join(EXTERNAL_OUTPUT_ROOT, slug)];
  if (slug === "endless_summer_paradise") roots.push(ENDLESS_SUMMER_PRODUCTION_ROOT);
  return roots;
}

export async function discoverProjectMediaAssets(
  slug: string,
  architecture: ProjectArchitecture | null
): Promise<ProjectMediaAsset[]> {
  const assets: ProjectMediaAsset[] = [];
  const seen = new Set<string>();
  const add = (asset: ProjectMediaAsset) => {
    if (seen.has(asset.url)) return;
    seen.add(asset.url);
    assets.push(asset);
  };

  const publicMedia = await resolveHeroMedia(slug, architecture);
  const imageOnly = isImageOnlyProject(slug);

  for (const url of getProjectCarouselImages(slug)) {
    add({
      kind: "image",
      url,
      filename: url.split("/").at(-1) ?? "still.webp",
      source: "public",
    });
  }

  if (!imageOnly && publicMedia.video) {
    add({
      kind: "video",
      url: publicMedia.video,
      filename: publicMedia.video.split("/").at(-1) ?? "output.mp4",
      source: /^https?:\/\//i.test(publicMedia.video) ? "external" : "public",
    });
  }
  if (!imageOnly) {
    for (const url of await listPublicVideoUrls(slug)) {
      add({
        kind: "video",
        url,
        filename: url.split("/").at(-1) ?? "output.mp4",
        source: /^https?:\/\//i.test(url) ? "external" : "public",
      });
    }
  }

  const publicOutputRoot = join(process.cwd(), "public", "outputs", slug);
  for (const output of await newestMediaFiles(publicOutputRoot)) {
    const kind = mediaKind(output) ?? "image";
    if (imageOnly && kind === "video") continue;
    const relativePath = relative(join(process.cwd(), "public"), output).split(sep).join("/");
    add({
      kind,
      url: `/${relativePath}`,
      filename: output.split(sep).at(-1) ?? "output",
      source: "public",
    });
  }

  if (process.env.NODE_ENV !== "production") {
    const roots = getProjectMediaRoots(slug);
    for (const [rootIndex, root] of roots.entries()) {
      if (!existsSync(root)) continue;
      for (const output of await newestMediaFiles(root)) {
        const kind = mediaKind(output) ?? "image";
        if (imageOnly && kind === "video") continue;
        const relativePath = relative(root, output).split(sep).join("/");
        add({
          kind,
          url: `/api/showcase-media/${slug}?root=${rootIndex}&file=${encodeURIComponent(relativePath)}`,
          filename: output.split(sep).at(-1) ?? "output",
          source: "external",
        });
      }
    }
  }

  if (publicMedia.poster) {
    add({
      kind: "image",
      url: publicMedia.poster,
      filename: publicMedia.poster.split("/").at(-1) ?? "poster",
      source: "public",
    });
  }

  return [
    ...assets.filter((asset) => asset.kind === "video").slice(0, 5),
    ...assets.filter((asset) => asset.kind === "image").slice(0, 18),
  ];
}

export async function discoverProjectMedia(
  slug: string,
  architecture: ProjectArchitecture | null
): Promise<ProjectMediaAsset | null> {
  return (await discoverProjectMediaAssets(slug, architecture))[0] ?? null;
}
