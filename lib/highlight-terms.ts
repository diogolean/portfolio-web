import type { PipelineCategory } from "@/types/project";

/** High-demand structural AI terms reserved for the top header row. */
export const CORE_AI_TERMS = [
  "Agent Orchestration",
  "GraphRAG / RAG",
  "MCP Protocol",
  "DSPy Optimization",
  "State Machine Router",
] as const;

const GENERIC_LOW_VALUE = new Set(
  [
    "python",
    "ffmpeg",
    "ffprobe",
    "json",
    "moviepy",
    "opencv",
    "durable json queues",
    "durable json queue",
    "lexical json memory",
  ].map((value) => value.toLowerCase())
);

const PRIMARY_PATTERN_MATCHERS: Array<{ test: RegExp; label: string }> = [
  { test: /orchestrat/i, label: "Orchestrator" },
  { test: /agent\s*loop|dual-model|debate runtime/i, label: "Agent Loop" },
  { test: /mcp(\s|$)|model context/i, label: "MCP Host" },
  { test: /graphrag|\brag\b|memory recall|content-library|global library/i, label: "GraphRAG / RAG" },
  { test: /state machine|router|guard decorator|strategy pattern/i, label: "State Machine Router" },
  { test: /dspy|prompt assembl|assemble_v2|optimization/i, label: "DSPy Optimization" },
];

export const PROJECT_HIGHLIGHTS: Record<string, readonly string[]> = {
  aiwake: [
    "Agent Orchestration",
    "GraphRAG / RAG",
    "State Machine Router",
    "MCP Protocol",
    "Dual-Model Debate",
  ],
  wonder_feed: [
    "Agent Orchestration",
    "DSPy Optimization",
    "GraphRAG / RAG",
    "State Machine Router",
    "Human Review Gates",
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

const KIND_PRIMARY: Partial<Record<string, string>> = {
  orchestrator: "Orchestrator",
  rag: "GraphRAG / RAG",
  model: "Agent Loop",
  queue: "State Machine Router",
};

const CATEGORY_PRIMARY: Partial<Record<PipelineCategory, string>> = {
  ORCHESTRATOR: "Orchestrator",
  MODEL: "Agent Loop",
  INFRA: "State Machine Router",
};

export function isLowValueTag(tag: string) {
  return GENERIC_LOW_VALUE.has(tag.trim().toLowerCase());
}

export function getProjectHighlights(slug: string, fallback: string[] = []): string[] {
  const curated = PROJECT_HIGHLIGHTS[slug];
  const source = curated?.length ? curated : fallback;
  return source.filter((tag) => !isLowValueTag(tag)).slice(0, 5);
}

export function classifyArchitectureTags(
  tags: string[],
  kindOrCategory?: string
): { primary: string[]; secondary: string[] } {
  const primary: string[] = [];
  const secondary: string[] = [];
  const seen = new Set<string>();

  function push(list: string[], value: string) {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key) || isLowValueTag(value)) return;
    seen.add(key);
    list.push(value);
  }

  const kindPrimary = kindOrCategory
    ? (KIND_PRIMARY[kindOrCategory.toLowerCase()] ?? CATEGORY_PRIMARY[kindOrCategory as PipelineCategory])
    : undefined;
  if (kindPrimary) push(primary, kindPrimary);

  for (const tag of tags) {
    const match = PRIMARY_PATTERN_MATCHERS.find((entry) => entry.test.test(tag));
    if (match) {
      push(primary, match.label);
    } else {
      push(secondary, tag);
    }
  }

  return { primary, secondary };
}
