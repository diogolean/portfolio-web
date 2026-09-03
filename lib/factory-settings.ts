import { existsSync, readFileSync } from "fs";
import { join } from "path";

export interface FactoryRuntimeSpec {
  sourcePath: string | null;
  sceneCount: number;
  videoDurationS: number;
  aspectRatio: string;
  extendedScenes: number[];
  assembledRuntimeS: number;
  qualityFailsafe: string;
  shortFormTargets: string[];
  longFormTargets: string[];
  outputParameters: Record<string, unknown>;
}

const DEFAULT_SPEC: Omit<FactoryRuntimeSpec, "sourcePath"> = {
  sceneCount: 9,
  videoDurationS: 7,
  aspectRatio: "9:16",
  extendedScenes: [8],
  assembledRuntimeS: 63,
  qualityFailsafe: "auto_rewrite_and_resubmit",
  shortFormTargets: ["youtube_shorts", "tiktok"],
  longFormTargets: ["youtube", "facebook", "pinterest"],
  outputParameters: {
    liquid_viscosity: 10,
    test_mode: false,
    elevenlabs_sfx_enabled: false,
  },
};

const NETWORK_FACTORY_SETTINGS =
  "G:/My Drive/Z sosFiles/Z_act/@ NETWORK/@ MEDIAUPSCALE_FACTORY/factory_settings_v4.json";

function candidatePaths() {
  return [
    process.env.FACTORY_SETTINGS_PATH,
    NETWORK_FACTORY_SETTINGS,
    join(process.cwd(), "../omni-engine/channels_config/endless_summer_paradise/factory_settings.json"),
    join(process.cwd(), "content/showcase/factory_settings_v4.json"),
    join(process.cwd(), "../omni-engine/factory_settings_v4.json"),
  ].filter((value): value is string => Boolean(value));
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumberArray(value: unknown, fallback: number[]) {
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === "number")
    : fallback;
}

function normalize(raw: Record<string, unknown>, sourcePath: string): FactoryRuntimeSpec {
  const project = (raw.PROJECT_CONFIG ?? {}) as Record<string, unknown>;
  const policy = (raw.CONTENT_POLICY_FAILSAFE ?? {}) as Record<string, unknown>;
  const seo = (raw.seo_metadata_usa_high_rpm ?? {}) as Record<string, unknown>;
  const sceneCount = asNumber(project.scene_count, DEFAULT_SPEC.sceneCount);
  const videoDurationS = asNumber(project.video_duration, DEFAULT_SPEC.videoDurationS);
  const extendedScenes = asNumberArray(project.extended_scenes, DEFAULT_SPEC.extendedScenes);
  const platforms = Object.keys(seo).filter((key) => key !== "target_audience" && key !== "brand" && key !== "project_title");

  return {
    sourcePath,
    sceneCount,
    videoDurationS,
    aspectRatio: asString(project.aspect_ratio, DEFAULT_SPEC.aspectRatio),
    extendedScenes,
    assembledRuntimeS: sceneCount * videoDurationS,
    qualityFailsafe: asString(policy.action, DEFAULT_SPEC.qualityFailsafe),
    shortFormTargets: platforms.filter((name) => /short|tiktok|reels/i.test(name)),
    longFormTargets: platforms.filter((name) => !/short|tiktok|reels/i.test(name)),
    outputParameters: {
      liquid_viscosity: project.liquid_viscosity ?? DEFAULT_SPEC.outputParameters.liquid_viscosity,
      test_mode: project.test_mode ?? false,
      elevenlabs_sfx_enabled: project.elevenlabs_sfx_enabled ?? false,
      music_scenes: project.music_scenes ?? [],
    },
  };
}

export function loadFactorySettingsV4(): FactoryRuntimeSpec {
  for (const path of candidatePaths()) {
    if (!existsSync(path)) continue;
    try {
      const parsed = JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
      return normalize(parsed, path);
    } catch {
      // Keep scanning — a malformed network copy must not break the showcase.
    }
  }
  return { ...DEFAULT_SPEC, sourcePath: null };
}
