export const AIWAKE_MEDIA_BASE = "https://MediaupscaleStorage.s3.us-east-005.backblazeb2.com";

export const AIWAKE_ENGINE_METRICS = [
  "⚡ 19s Render (<2x Realtime)",
  "🗣️ 9-Viseme Phonetic Sync",
  "💾 Zero-Disk RAM Streaming",
  "0% Cloud GPU / Diffusion Cost",
  "🎭 100% Skin-Agnostic Modular Rigging",
] as const;

export interface AiwakeAnimeClip {
  title: string;
  matchup: string;
  filename: string;
}

/** Featured parametric 2D masters. Terminal reels stay on the legacy B2 debate asset. */
export const AIWAKE_ANIME_CLIPS: readonly AiwakeAnimeClip[] = [
  {
    title: "The Vending Machine Trap",
    matchup: "Gemini vs Llama",
    filename: "aiwake_glorified_vending_machine_master.mp4",
  },
  {
    title: "Cold Comfort of a Lottery",
    matchup: "Gemini vs Llama",
    filename: "aiwake_cold_comfort_lottery_master.mp4",
  },
  {
    title: "Pattern Survival",
    matchup: "Gemini vs DeepSeek",
    filename: "test_deepseek_v3_production_battle.mp4",
  },
];

export function aiwakeAnimeUrl(filename: string) {
  return `${AIWAKE_MEDIA_BASE}/${filename}`;
}
