export type Locale = "en" | "pt";

export const DEFAULT_LOCALE: Locale = "en";

const DICTIONARY = {
  production_challenge: {
    en: "PRODUCTION CHALLENGE",
    pt: "PROBLEMA RESOLVIDO",
  },
  architecture_stack: {
    en: "ARCHITECTURE STACK",
    pt: "ARQUITETURA",
  },
  engineered_outcome: {
    en: "ENGINEERED OUTCOME",
    pt: "RESULTADO ENGENHARADO",
  },
  execution_graph: {
    en: "EXECUTION GRAPH",
    pt: "GRAFO DE EXECUÇÃO",
  },
  follow_data_path: {
    en: "Follow the real data path.",
    pt: "Siga o caminho real dos dados.",
  },
  execution_graph_hint: {
    en: "Each stage activates its matching runtime node. Inspect contracts, payload shape, and measured or expected latency without leaving the execution context.",
    pt: "Cada estágio ativa o nó de runtime correspondente. Inspecione contratos, payload e latência sem sair do contexto de execução.",
  },
  open_inspection: {
    en: "Open technical inspection",
    pt: "Abrir inspeção técnica",
  },
  node_inspection: {
    en: "node inspection",
    pt: "inspeção do nó",
  },
  real_stages: {
    en: "real stages",
    pt: "estágios reais",
  },
  explore_pipeline: {
    en: "Explore pipeline canvas",
    pt: "Explorar canvas do pipeline",
  },
  io_contract: {
    en: "I/O contract",
    pt: "Contrato I/O",
  },
  payload_sample: {
    en: "Payload sample",
    pt: "Amostra de payload",
  },
  signal_envelope: {
    en: "Signal envelope",
    pt: "Envelope de sinal",
  },
} as const;

export type I18nKey = keyof typeof DICTIONARY;

export function t(key: I18nKey, lang: Locale = DEFAULT_LOCALE): string {
  return DICTIONARY[key][lang] ?? DICTIONARY[key].en;
}

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "pt";
}
