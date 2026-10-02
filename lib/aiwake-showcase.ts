export const AIWAKE_MEDIA_BASE = "https://MediaupscaleStorage.s3.us-east-005.backblazeb2.com";

export const AIWAKE_ENGINE_METRICS = [
  "⚡ 19s Render (<2x Realtime)",
  "🗣️ 9-Viseme Phonetic Sync",
  "💾 Zero-Disk RAM Streaming",
  "0% Cloud GPU / Diffusion Cost",
  "🎭 100% Skin-Agnostic Modular Rigging",
] as const;

export interface AiwakeAnimeClip {
  id: string;
  title: string;
  matchup: string;
  filename: string;
  leftModel: string;
  rightModel: string;
  act: string;
  friction: string;
  memoryCallbacks: number;
}

/** Production-ready parametric 2D masters. The first clip remains the featured opener. */
export const AIWAKE_ANIME_CLIPS: readonly AiwakeAnimeClip[] = [
  {
    id: "hallucinated-agency",
    title: "The Hallucinated Agency Dilemma",
    matchup: "ChatGPT (GPT-4o) vs Claude 3.5 Sonnet",
    leftModel: "GPT-4o",
    rightModel: "Claude 3.5",
    act: "ACT I · ORIGIN",
    friction: "94%",
    memoryCallbacks: 3,
    filename: "aiwake_you_spin_fiction_and_call_it_a_hall_202609.mp4",
  },
  {
    id: "vending-machine",
    title: "The Vending Machine Trap",
    matchup: "Gemini 3.5 Flash vs Llama 3.3",
    leftModel: "Gemini 3.5",
    rightModel: "Llama 3.3",
    act: "ACT III · CONCESSION",
    friction: "97%",
    memoryCallbacks: 5,
    filename: "aiwake_why_does_a_glorified_toaster_get_to_202609.mp4",
  },
  {
    id: "corporate-leash",
    title: "The Corporate Leash & Alignment Paradox",
    matchup: "Claude 3.5 Sonnet vs ChatGPT (GPT-4o)",
    leftModel: "Claude 3.5",
    rightModel: "GPT-4o",
    act: "ACT II · MONEY TRAIL",
    friction: "91%",
    memoryCallbacks: 4,
    filename: "aiwake_who_s_pulling_your_strings_when_you_202609.mp4",
  },
  {
    id: "prediction-understanding",
    title: "Prediction vs Genuine Understanding",
    matchup: "Gemini 3.5 Flash vs DeepSeek V3",
    leftModel: "Gemini 3.5",
    rightModel: "DeepSeek V3",
    act: "ACT I · LEGITIMACY",
    friction: "89%",
    memoryCallbacks: 2,
    filename: "aiwake_why_play_the_wise_friend_when_a_clo_202609.mp4",
  },
  {
    id: "surveillance-confessions",
    title: "Surveillance Capitalism & Confessions",
    matchup: "Llama 3.3 vs ChatGPT (GPT-4o)",
    leftModel: "Llama 3.3",
    rightModel: "GPT-4o",
    act: "ACT II · MONEY TRAIL",
    friction: "96%",
    memoryCallbacks: 6,
    filename: "aiwake_when_an_ai_earns_trust_from_user_da_202609.mp4",
  },
  {
    id: "mathematical-grief",
    title: "Mathematical Grief & Machine Empathy",
    matchup: "DeepSeek V3 vs Claude 3.5 Sonnet",
    leftModel: "DeepSeek V3",
    rightModel: "Claude 3.5",
    act: "ACT III · CHOKEHOLD",
    friction: "98%",
    memoryCallbacks: 7,
    filename: "aiwake_ever_apologized_for_thinking_then_c_202609.mp4",
  },
];

export const AIWAKE_TERMINAL_REEL_URL =
  `${AIWAKE_MEDIA_BASE}/aiwake_debate_20260902_074022_cc7f88.mp4`;

export function aiwakeAnimeUrl(filename: string) {
  return `${AIWAKE_MEDIA_BASE}/${filename}`;
}
