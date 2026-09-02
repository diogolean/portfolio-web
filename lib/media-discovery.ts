import "server-only";

import { existsSync } from "fs";
import { readdir, stat } from "fs/promises";
import { extname, join, relative, sep } from "path";
import type { ProjectArchitecture } from "./types";
import { resolveHeroMedia } from "./registry";

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
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);
const IMAGE_EXTENSIONS = new Set([".png", ".webp", ".jpg", ".jpeg"]);

function mediaKind(filename: string): MediaKind | null {
  const extension = extname(filename).toLowerCase();
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  return null;
}

async function newestMediaFile(root: string, maxDepth = 3) {
  if (!existsSync(root)) return null;
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
  return candidates.sort((a, b) => b.modified - a.modified)[0]?.path ?? null;
}

export function getExternalOutputRoot() {
  return EXTERNAL_OUTPUT_ROOT;
}

export async function discoverProjectMedia(
  slug: string,
  architecture: ProjectArchitecture | null
): Promise<ProjectMediaAsset | null> {
  const publicMedia = await resolveHeroMedia(slug, architecture);
  if (publicMedia.video) {
    return {
      kind: "video",
      url: publicMedia.video,
      filename: publicMedia.video.split("/").at(-1) ?? "output.mp4",
      source: "public",
    };
  }

  const publicOutputRoot = join(process.cwd(), "public", "outputs", slug);
  const publicOutput = await newestMediaFile(publicOutputRoot);
  if (publicOutput) {
    const relativePath = relative(join(process.cwd(), "public"), publicOutput).split(sep).join("/");
    return {
      kind: mediaKind(publicOutput) ?? "image",
      url: `/${relativePath}`,
      filename: publicOutput.split(sep).at(-1) ?? "output",
      source: "public",
    };
  }

  const externalProjectRoot = join(EXTERNAL_OUTPUT_ROOT, slug);
  const externalOutput = await newestMediaFile(externalProjectRoot);
  if (externalOutput) {
    const relativePath = relative(externalProjectRoot, externalOutput).split(sep).join("/");
    return {
      kind: mediaKind(externalOutput) ?? "image",
      url: `/api/showcase-media/${slug}?file=${encodeURIComponent(relativePath)}`,
      filename: externalOutput.split(sep).at(-1) ?? "output",
      source: "external",
    };
  }

  if (publicMedia.poster) {
    return {
      kind: "image",
      url: publicMedia.poster,
      filename: publicMedia.poster.split("/").at(-1) ?? "poster",
      source: "public",
    };
  }

  return null;
}
