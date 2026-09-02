import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { extname, resolve, sep } from "path";
import { NextRequest } from "next/server";
import { getProjectMediaRoots } from "@/lib/media-discovery";

const CONTENT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const filename = request.nextUrl.searchParams.get("file");
  const rootIndex = Number(request.nextUrl.searchParams.get("root") ?? "0");
  if (!/^[a-z0-9_]+$/.test(slug) || !filename) {
    return new Response("Invalid media request", { status: 400 });
  }

  const roots = getProjectMediaRoots(slug);
  if (!Number.isInteger(rootIndex) || rootIndex < 0 || rootIndex >= roots.length) {
    return new Response("Invalid media root", { status: 400 });
  }
  const projectRoot = resolve(roots[rootIndex]);
  const path = resolve(projectRoot, filename);
  if (!path.toLowerCase().startsWith(`${projectRoot.toLowerCase()}${sep}`)) {
    return new Response("Invalid media path", { status: 403 });
  }

  const contentType = CONTENT_TYPES[extname(path).toLowerCase()];
  if (!contentType) return new Response("Unsupported media type", { status: 415 });

  let metadata;
  try {
    metadata = await stat(path);
    if (!metadata.isFile()) throw new Error("Not a file");
  } catch {
    return new Response("Media not found", { status: 404 });
  }

  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) return new Response("Invalid range", { status: 416 });
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : metadata.size - 1;
    if (start > end || end >= metadata.size) {
      return new Response("Range not satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${metadata.size}` },
      });
    }
    const stream = createReadStream(path, { start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=60",
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${metadata.size}`,
        "Content-Type": contentType,
      },
    });
  }

  const stream = createReadStream(path);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=60",
      "Content-Length": String(metadata.size),
      "Content-Type": contentType,
    },
  });
}
