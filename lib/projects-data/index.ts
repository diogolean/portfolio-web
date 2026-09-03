import type { ResolvedProject } from "@/lib/types";
import { classifyArchitectureTags } from "@/lib/highlight-terms";
import { parseProjectShowcase, type ArchitectureNodeKind } from "@/lib/project-parser";
import type {
  MosaicAsset,
  PipelineCategory,
  PipelineNode,
  ProjectPipeline,
} from "@/types/project";

const CATEGORY_MAP: Record<ArchitectureNodeKind, PipelineCategory> = {
  orchestrator: "ORCHESTRATOR",
  rag: "MODEL",
  model: "MODEL",
  media: "MEDIA",
  render: "MEDIA",
  queue: "INFRA",
  delivery: "INFRA",
};

function uniqueTags(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function splitContract(contract: string) {
  const [input, output] = contract.split(/\s*→\s*/, 2);
  return {
    input: input?.trim() || "Runtime state",
    output: output?.trim() || "Resolved artifact",
  };
}

function mosaicAssets(node: ReturnType<typeof parseProjectShowcase>["nodes"][number]): MosaicAsset[] {
  const contract = splitContract(node.contract);
  const assets: MosaicAsset[] = [
    {
      type: "code",
      label: "I/O contract",
      src: `${contract.input}\n  ↓\n${contract.output}`,
    },
    {
      type: "code",
      label: "Payload sample",
      src: JSON.stringify(node.payload, null, 2),
    },
  ];

  if (node.kind === "media" || node.kind === "render") {
    assets.push({
      type: "audio",
      label: "Signal envelope",
      src: "0.12,0.38,0.74,0.46,0.91,0.62,0.28,0.68,0.42,0.18",
    });
  }
  return assets;
}

function toPipelineNode(
  node: ReturnType<typeof parseProjectShowcase>["nodes"][number],
  index: number
): PipelineNode {
  const ioContract = splitContract(node.contract);
  const architecture = uniqueTags(node.technologies);
  const { primary, secondary } = classifyArchitectureTags(architecture, node.kind);
  return {
    id: node.id,
    title: node.title,
    category: CATEGORY_MAP[node.kind],
    description: node.summary,
    architecture,
    problemSolved: node.responsibility,
    engineeredOutcome: `${ioContract.output} · ${node.latency}`,
    ioContract,
    tags: architecture,
    primaryTags: primary,
    secondaryTags: secondary,
    videoTimestamp: index * 4,
    mosaicAssets: mosaicAssets(node),
    payloadSample: node.payload,
    latency: node.latency,
  };
}

export function getProjectPipeline(project: ResolvedProject): ProjectPipeline {
  const showcase = parseProjectShowcase(project);
  return {
    ...showcase,
    nodes: showcase.nodes.map(toPipelineNode),
  };
}
