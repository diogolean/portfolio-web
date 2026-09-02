export type PipelineCategory = "ORCHESTRATOR" | "MEDIA" | "MODEL" | "INFRA" | "ECONOMICS";

export interface MosaicAsset {
  type: "image" | "code" | "audio";
  src: string;
  label: string;
}

export interface PipelineNode {
  id: string;
  title: string;
  category: PipelineCategory;
  description: string;
  ioContract: {
    input: string;
    output: string;
  };
  tags: string[];
  videoTimestamp?: number;
  mosaicAssets?: MosaicAsset[];
  payloadSample?: Record<string, unknown>;
  latency?: string;
}

export interface ProjectPipeline {
  slug: string;
  stack: string[];
  productionCost: string;
  processingTime: string;
  challenge: string;
  outcome: string;
  nodes: PipelineNode[];
  telemetry: string[];
}
