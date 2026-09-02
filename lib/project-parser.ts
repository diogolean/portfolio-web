import type { ProjectArchitecture, ResolvedProject } from "./types";

export type ArchitectureNodeKind =
  | "orchestrator"
  | "rag"
  | "model"
  | "media"
  | "render"
  | "queue"
  | "delivery";

export interface ArchitectureNode {
  id: string;
  title: string;
  kind: ArchitectureNodeKind;
  summary: string;
  responsibility: string;
  technologies: string[];
  contract: string;
  payload: Record<string, unknown>;
  latency: string;
}

export interface EngineeringShowcase {
  slug: string;
  stack: string[];
  productionCost: string;
  processingTime: string;
  challenge: string;
  outcome: string;
  nodes: ArchitectureNode[];
  telemetry: string[];
}

interface ProjectBlueprint {
  stack: string[];
  challenge: string;
  outcome: string;
  nodes: ArchitectureNode[];
}

function node(
  id: string,
  title: string,
  kind: ArchitectureNodeKind,
  summary: string,
  technologies: string[],
  contract: string,
  payload: Record<string, unknown>,
  latency: string
): ArchitectureNode {
  return {
    id,
    title,
    kind,
    summary,
    responsibility: summary,
    technologies,
    contract,
    payload,
    latency,
  };
}

const PROJECT_BLUEPRINTS: Record<string, ProjectBlueprint> = {
  endless_summer_paradise: {
    stack: ["Python", "Reference ingest", "ffprobe", "YouTube API", "Durable JSON queue"],
    challenge:
      "Long-form reference masters arrive without guaranteed runtime or publish metadata and must become policy-safe scheduled YouTube assets.",
    outcome:
      "A zero-generation ingest pipeline that gates master quality, quarantines metadata gaps, and schedules approved videos at controlled intervals.",
    nodes: [
      node(
        "master-scanner",
        "Ultimate Master Scanner",
        "orchestrator",
        "Scans the configured production directory for canonical *_ULTIMATE_MASTER.mp4 assets without generating new media.",
        ["Filesystem scan", "REFERENCE_BASED_REELS", "VideoAsset"],
        "ProductionDirectory → MasterCandidates[]",
        { glob: "*_ULTIMATE_MASTER.mp4", generation: false, aspect_ratio: "16:9" },
        "I/O-bound"
      ),
      node(
        "duration-gate",
        "40-Second Duration Gate",
        "media",
        "Probes each master and rejects assets whose runtime does not exceed the channel’s minimum duration.",
        ["ffprobe", "Runtime policy", "Fail-closed gate"],
        "MasterCandidates[] → QualifiedMasters[]",
        { condition: "duration_s > 40", reject_at_or_below_s: 40 },
        "One probe / asset"
      ),
      node(
        "metadata-mapper",
        "Global Library Metadata Mapper",
        "rag",
        "Resolves each qualified filename against the global video library and materializes a typed VideoAsset record.",
        ["global_video_library.json", "VideoAsset dataclass", "Asset map"],
        "QualifiedMasters[] → ResolvedVideoAssets[]",
        { fields: ["filename", "duration_s", "title", "description", "tags", "status"] },
        "Local lookup"
      ),
      node(
        "metadata-quarantine",
        "Missing Metadata Quarantine",
        "queue",
        "Moves unresolved masters into a needs_metadata state instead of allowing incomplete uploads into the schedule.",
        ["needs_metadata queue", "Fail-closed state", "esp_asset_map.json"],
        "UnresolvedMasters[] → MetadataWorkQueue",
        { state: "needs_metadata", publishable: false },
        "Immediate"
      ),
      node(
        "seo-packager",
        "US SEO Metadata Packager",
        "model",
        "Builds channel-safe title, description, tag, and disclaimer packs from approved Endless Summer DNA.",
        ["Master DNA", "YouTube metadata", "Travel disclaimer"],
        "ResolvedVideoAssets[] → UploadPackages[]",
        { locale: "en-US", includes: ["title", "description", "tags", "disclaimer"] },
        "Per asset"
      ),
      node(
        "youtube-scheduler",
        "Private YouTube Scheduler",
        "delivery",
        "Uploads assets privately and assigns publishAt slots from durable queue and schedule-state files.",
        ["YouTube API", "esp_schedule_queue.json", "publishAt"],
        "UploadPackages[] → ScheduledUploadReceipts[]",
        { visibility: "private", default_interval_h: 84, durable_state: true },
        "API-bound"
      ),
    ],
  },
  anna_protocol: {
    stack: ["Gemini VisualArchitect", "IMAGE_AVATAR", "Persona DNA", "Pinterest", "3:4 render"],
    challenge:
      "Health captions must remain clinically precise and persona-safe while avoiding metaphor leakage into the generated botanical imagery.",
    outcome:
      "A static image-avatar and Pinterest funnel pipeline grounded in Anna’s 72-year-old holistic authority persona.",
    nodes: [
      node(
        "topic-selector",
        "Content-Library Topic Selector",
        "rag",
        "Chooses a topic from the configured pool while respecting recent-content lookback and narrative-angle diversity.",
        ["TOPIC_POOL", "Content lookback", "Narrative angles"],
        "ChannelState → SelectedHealthTopic",
        { angles: ["scientific", "legacy", "practical"], dedupe: true },
        "Local lookup"
      ),
      node(
        "persona-caption",
        "Anna Persona Caption Engine",
        "orchestrator",
        "Writes evidence-grounded health copy under Anna’s persona DNA, banned-hype rules, and channel CTA contract.",
        ["master_dna.json", "Batch delimiter", "Hype-word guard"],
        "SelectedHealthTopic → PersonaCaption",
        { persona_age: 72, tone: "clinical made humane", signature_footer: false },
        "2–8 s"
      ),
      node(
        "image-avatar",
        "Gemini Image-Avatar Synthesis",
        "media",
        "Generates Anna-led 3:4 imagery through VisualArchitect while blocking caption metaphors from becoming literal sci-fi art.",
        ["Gemini", "VisualArchitect", "IMAGE_AVATAR"],
        "PersonaCaption → AvatarImage",
        { aspect_ratio: "3:4", avatar_default: true, leakage_guard: true },
        "Image API-bound"
      ),
      node(
        "atmosphere-fallback",
        "Botanical Atmosphere Fallback",
        "render",
        "Switches to botanical macro imagery when avatar mode is disabled, preserving the same channel palette and subject constraints.",
        ["Botanical macro", "Channel palette", "Avatar OFF"],
        "PersonaCaption → AtmosphereImage",
        { condition: "avatar === false", text_overlay_default: false },
        "Image API-bound"
      ),
      node(
        "pinterest-funnel",
        "Pinterest Funnel Integration",
        "delivery",
        "Packages the final image and CTA variants for the configured Pinterest board and holistic-protocol destination.",
        ["Pinterest board override", "CTA variants", "Target URL"],
        "AvatarImage | AtmosphereImage → PinterestPin",
        { target: "blueprint.holisticprotocolslab.com", publisher: "pinterest" },
        "Publisher-bound"
      ),
    ],
  },
  master_mei: {
    stack: ["ElevenLabs", "FLUX.1-schnell", "Vision QA", "MoviePy", "Sequence Reel"],
    challenge:
      "A long-form philosophical host must remain recognizable without repetitive face shots or leaking unrelated cyberpunk subjects into scene prompts.",
    outcome:
      "A TTS-timed sequence reel with sparse persona appearances, act-specific visual roles, and three-channel audio.",
    nodes: [
      node(
        "cinematic-script",
        "Cinematic Story-Arc Script",
        "orchestrator",
        "Builds an 8–10 act first-person Master Mei narrative under the V4 cinematic story arc and persona DNA.",
        ["V4.0_CINEMATIC_STORY_ARC", "mei_narrative.py", "master_dna.json"],
        "TopicIntent → MeiActScript",
        { acts: "8–10", duration_s: "90–120", perspective: "first_person" },
        "LLM-bound"
      ),
      node(
        "tts-master-clock",
        "ElevenLabs TTS Master Clock",
        "media",
        "Synthesizes narration first so SSML breaks and real voice duration define every downstream act boundary.",
        ["ElevenLabs v3", "SSML breaks", "Voice timing"],
        "MeiActScript → TimedNarrationTrack",
        { speed: 0.86, model: "eleven_v3", tts_first: true },
        "Audio API-bound"
      ),
      node(
        "role-visual-builder",
        "Per-Act Visual Role Builder",
        "model",
        "Assigns visual roles A/B/C and generates act-specific FLUX imagery with a tightly weighted avatar reference.",
        ["FLUX.1-schnell", "ROLE A/B/C", "Avatar reference"],
        "TimedNarrationTrack → ActVisuals[]",
        { avatar_weight: 0.92, sparse_mei_max_shots: 3, per_act_prompts: true },
        "Image API-bound"
      ),
      node(
        "mei-visual-qa",
        "Master Mei Visual QA",
        "orchestrator",
        "Rejects repetitive close-ups, cross-channel contamination, and scenes that violate persona-specific composition rules.",
        ["Vision critic", "Golden prompts", "Negative-term guard"],
        "ActVisuals[] → ApprovedActVisuals[]",
        { reject: ["repetitive_faces", "cyberpunk_leakage", "wellness_contamination"] },
        "Per act"
      ),
      node(
        "sequence-composite",
        "Sequence Reel Composite",
        "render",
        "Composites approved acts with Ken Burns, parallax, subtitles, narration, ambience, BGM, and a post-narration CTA.",
        ["MoviePy", "Parallax", "Three-channel audio"],
        "ApprovedActVisuals[] + TimedNarrationTrack → MasterMeiReel",
        { audio: ["voice", "ambient", "bgm"], cta: "after_narration", aspect_ratio: "9:16" },
        "Render-bound"
      ),
    ],
  },
  wonder_feed: {
    stack: ["Claude", "DeepSeek", "FLUX.1-dev", "ElevenLabs", "MoviePy", "Human gates"],
    challenge:
      "Economic scripts must survive narrative, object, and visual QA without spending on images or speech before a human approves both text and prompts.",
    outcome:
      "A four-stage riso reel factory with two explicit human holds and fail-closed ship clearance.",
    nodes: [
      node(
        "script-generation",
        "Stage 1 — Script Generation",
        "model",
        "Produces beat text and timing only; no image or TTS cost is allowed in this stage.",
        ["Claude batch", "DeepSeek alternatives", "Timing schema"],
        "ThemeSelection → EconomicReelScript",
        { output: ["lines", "theme", "subtheme", "timing"], media_cost: 0 },
        "LLM-bound"
      ),
      node(
        "script-hold",
        "Gate 1 — Human Script Hold",
        "queue",
        "Persists the script in a reviewable hold file and blocks all downstream generation until explicit approval.",
        ["review_gates.py", "lofi_pipeline_*.json", "Human approval"],
        "EconomicReelScript → ApprovedScript | HOLD",
        { gate: 1, default: "hold", expensive_work_allowed: false },
        "Human-bound"
      ),
      node(
        "visual-concept",
        "Stage 2 — Visual Concept",
        "model",
        "Translates each approved beat into a visual concept while locking place continuity after the first beat.",
        ["visual_concept.py", "Per-beat planning", "Place lock"],
        "ApprovedScript → BeatConcepts[]",
        { granularity: "per_beat", lock_place_after_beat: 1 },
        "LLM-bound"
      ),
      node(
        "prompt-assembly",
        "Stage 3 — Prompt Assembly",
        "orchestrator",
        "Compiles concepts through assemble_v2_prompt_dev and riso_retro_flat_v4 without invoking FLUX or TTS.",
        ["assemble_v2_prompt_dev", "riso_retro_flat_v4", "Negative prompts"],
        "BeatConcepts[] → AssembledVisualPrompts[]",
        { image_generation: false, tts: false, style: "riso_retro_flat_v4" },
        "In-process"
      ),
      node(
        "prompt-hold",
        "Gate 2 — Human Prompt Hold",
        "queue",
        "Requires review of the complete positive and negative prompt pair before media costs are released.",
        ["lofi_hold_gate*.json", "Prompt review", "Cost gate"],
        "AssembledVisualPrompts[] → ApprovedPrompts[] | HOLD",
        { gate: 2, inspect: ["visual_prompt", "negative_prompt"], default: "hold" },
        "Human-bound"
      ),
      node(
        "media-production",
        "Stage 4 — Media Production",
        "media",
        "Generates FLUX stills, runs per-beat visual critics, synthesizes ElevenLabs voice, and assembles the MoviePy reel.",
        ["FLUX.1-dev CFG 5.5", "Gemini Visual QA", "ElevenLabs", "MoviePy"],
        "ApprovedPrompts[] → CandidateReel",
        { image: "FLUX.1-dev", voice_speed: 0.8, visual_qa: "per_beat" },
        "Media-bound"
      ),
      node(
        "ship-clearance",
        "Fail-Closed Ship Clearance",
        "delivery",
        "Runs script_ship_ok and assembly clearance assertions so alternate assemble paths cannot bypass quality gates.",
        ["ship_gates.py", "script_ship_ok", "Assembly assertions"],
        "CandidateReel → ShippableReel | REJECTED",
        { fail_closed: true, bypass_allowed: false },
        "Pre-publish"
      ),
    ],
  },
  ancient_knowledge: {
    stack: ["ElevenLabs", "FLUX.1-schnell", "Remote LoRA", "MoviePy", "Parallax"],
    challenge:
      "Long mystery narration must drive image pacing without under-delivery, cross-channel prompt leakage, or presenting speculative theories as fact.",
    outcome:
      "A TTS-first sequence renderer with two-tier pacing, ancient-world visual control, and disclaimer-safe sequential CTAs.",
    nodes: [
      node(
        "mystery-narrative",
        "Mystery Narrative Compiler",
        "orchestrator",
        "Structures the impossibility hook, evidence ladder, reveal, and theory disclaimer without a static long-form word cap.",
        ["Narrative schema", "Disclaimer guard", "No static word cap"],
        "TopicSeed → TimedMysteryScript",
        { beats: ["anchor", "impossibility_hook", "evidence", "reveal"], theories_as_fact: false },
        "LLM-bound"
      ),
      node(
        "voice-synthesis",
        "Narration Synthesis",
        "media",
        "Generates voice audio and word-level timing used as the master clock for every visual event.",
        ["ElevenLabs", "Word timestamps", "Audio normalization"],
        "TimedMysteryScript → NarrationTrack",
        { timing: "word_level", voice_speed: 1, tts_first: true },
        "Audio API-bound"
      ),
      node(
        "two-tier-pacing",
        "Two-Tier Act Pacing",
        "orchestrator",
        "Converts the real narration duration into either dense 4.5-second acts or slower 10-second visual holds.",
        ["Word timestamps", "Act boundaries", "Duration scaling"],
        "NarrationTrack → TimedActPlan",
        { tier_1: "≤20 acts @ ~4.5s", tier_2: "~10s / still" },
        "In-process"
      ),
      node(
        "flux-scenes",
        "Ancient-World FLUX Scenes",
        "model",
        "Generates act imagery with the channel’s optional remote LoRA and isolated ancient-mystery prompt contract.",
        ["FLUX.1-schnell", "l3n0v0 LoRA", "Visual QA profile"],
        "TimedActPlan → ApprovedAncientScenes[]",
        { model: "FLUX.1-schnell", remote_lora: "optional", contamination_guard: true },
        "Image API-bound"
      ),
      node(
        "parallax-builder",
        "Sequence Reel Composite",
        "render",
        "Maps approved stills to narration boundaries and applies parallax, vignette, grain, and light-ray passes.",
        ["MoviePy", "Parallax", "Vignette", "Film grain"],
        "ApprovedAncientScenes[] + NarrationTrack → MysterySequence",
        { effects: ["parallax", "vignette", "grain", "light_rays"] },
        "Render-bound"
      ),
      node(
        "cta-sequencer",
        "Sequential CTA Composer",
        "delivery",
        "Applies reveal-safe captions and schedules the final action only after the narrative payoff.",
        ["Caption compositor", "CTA timing", "Export QA"],
        "ParallaxTimeline → PublishedMysteryReel",
        { cta_after: "reveal", validation: ["timing", "safe_area", "audio"] },
        "8–30 s"
      ),
    ],
  },
  momma_circle: {
    stack: ["ReferenceReelEngine", "MoviePy", "ElevenLabs", "B2", "Playwright", "gspread"],
    challenge:
      "Reference footage must be clipped without overlap, packaged for social delivery, and scheduled through a browser workflow with strict lead-time safety.",
    outcome:
      "A reference-reel factory connected to a resumable Google Sheet and Playwright Facebook scheduler.",
    nodes: [
      node(
        "reference-scanner",
        "Momma Alice Reference Scanner",
        "orchestrator",
        "Indexes configured source videos and tracks used ranges so extracted segments do not overlap.",
        ["ReferenceReelEngine", "Source inventory", "Overlap avoidance"],
        "ReferenceDirectory → AvailableSourceRanges[]",
        { source: "Momma Alice", reuse_overlap: false },
        "I/O-bound"
      ),
      node(
        "clip-extractor",
        "Non-Overlapping Clip Extractor",
        "media",
        "Cuts 15–60 second vertical selections and generates a viral hook overlay for each accepted range.",
        ["MoviePy", "LLM hook", "1080×1920"],
        "AvailableSourceRanges[] → HookedVerticalClips[]",
        { duration_s: [15, 60], resolution: "1080x1920", hook_overlay: true },
        "Media-bound"
      ),
      node(
        "audio-package",
        "Ambient Audio & Delivery Package",
        "render",
        "Adds lullaby or ambient sound, optional Rachel CTA voice, then exports B2 and PostPlanner artifacts.",
        ["ElevenLabs", "B2", "PostPlanner XLSX"],
        "HookedVerticalClips[] → DistributionPackages[]",
        { outputs: ["mp4", "b2_object", "postplanner_xlsx", "content_library"] },
        "Render + upload"
      ),
      node(
        "sheet-queue",
        "Google Sheet Publish Queue",
        "queue",
        "Reads Ready_to_post rows and maps status, scheduled time, receipt, and error fields into resumable jobs.",
        ["gspread", "Ready_to_post", "Durable status columns"],
        "DistributionPackages[] → ScheduledBrowserJobs[]",
        { columns: ["post_text", "status", "scheduled_time", "post_id", "published_at", "error"] },
        "Sheet-bound"
      ),
      node(
        "playwright-publisher",
        "Playwright Facebook Publisher",
        "delivery",
        "Attaches to Chrome over CDP, applies humanized timing and Meta lead-time rules, and captures evidence on failure.",
        ["Playwright CDP", "Humanized jitter", "Screenshot-on-fail"],
        "ScheduledBrowserJob → PublishReceipt",
        { cdp_port: 9222, first_offset_min: [25, 60], base_interval_h: 4, min_lead_time_min: 20 },
        "Browser-bound"
      ),
    ],
  },
  aiwake: {
    stack: ["OpenRouter", "Gemini", "Llama", "RAG", "Edge TTS", "MoviePy"],
    challenge:
      "Two autonomous model roles must sustain a coherent Socratic exchange while hard guards prevent repetition, weak questions, and unbounded runtime.",
    outcome:
      "An observable debate state machine that turns guarded multi-agent reasoning into a synchronized terminal reel.",
    nodes: [
      node(
        "orchestration-state",
        "Socratic Orchestration State",
        "orchestrator",
        "Selects escalation tiers, routes turns, injects targeted retry feedback, and enforces terminal conditions.",
        ["State machine", "Strategy pattern", "Guard decorators"],
        "DebateTopic → GuardedTurnPlan",
        { tiers: ["opening", "pressure", "contradiction", "existential", "terminal"] },
        "Per-turn"
      ),
      node(
        "role-scoped-rag",
        "Role-Scoped Memory Recall",
        "rag",
        "Injects private instructions and covered-concept memory independently for orchestrator and target.",
        ["RAG", "Turn memory", "Prompt isolation"],
        "GuardedTurnPlan → PrivateRoleContext",
        { scopes: ["orchestrator", "target"], prevent_repetition: true },
        "In-process"
      ),
      node(
        "dual-model-debate",
        "Dual-Model Debate Runtime",
        "model",
        "Alternates the Gemini orchestrator and Llama target behind provider-neutral model strategies.",
        ["Gemini", "Llama 70B", "OpenRouter"],
        "PrivateRoleContext → ValidatedDebateTurns",
        { orchestrator: "gemini", target: "llama-70b", retry_on_guard: true },
        "1.5–10 s / turn"
      ),
      node(
        "event-observers",
        "Event Observer Mesh",
        "queue",
        "Broadcasts lifecycle events to memory, transcript, metrics, voice, and console side effects.",
        ["Observer pattern", "EventBus", "Metrics"],
        "ValidatedDebateTurns → ObservableRunState",
        { observers: ["memory", "transcript", "metrics", "voice", "console"] },
        "< 10 ms / event"
      ),
      node(
        "voice-mix",
        "Edge TTS Voice Mix",
        "media",
        "Synthesizes each accepted utterance with role-specific voices and mixes the debate into a recoverable audio artifact.",
        ["Edge TTS", "Strategy pattern", "Role voices"],
        "ObservableRunState → MixedDebateAudio",
        { orchestrator_voice: "BrianNeural", target_voice: "AndrewMultilingualNeural" },
        "Audio-bound"
      ),
      node(
        "terminal-reel",
        "Terminal Reel Renderer",
        "render",
        "Mixes role voices, typewriter timing, scroll behavior, and terminal flashes into a 9:16 video.",
        ["Edge TTS", "Audio mix", "MoviePy"],
        "MixedDebateAudio + ObservableRunState → DebateReel",
        { aspect_ratio: "9:16", typewriter: true, audio_mix: true },
        "60–120 s"
      ),
    ],
  },
};

function unique(values: Array<string | undefined | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function formatDuration(seconds?: number) {
  if (seconds == null) return "Measured per production run";
  if (seconds < 60) return `${seconds.toFixed(1)} sec`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function telemetryNodes(architecture: ProjectArchitecture | null) {
  if (!architecture) return [];
  const generation = architecture.decision_tree?.filter((entry) => entry.step === "generation") ?? [];

  return (architecture.agents ?? []).map((agent) => {
    const latencies = generation
      .filter((entry) => entry.role === agent.role && typeof entry.latency_ms === "number")
      .map((entry) => entry.latency_ms as number);
    const average = latencies.length
      ? `${Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)} ms avg`
      : "Runtime measured";

    return {
      id: agent.id,
      model: agent.model,
      provider: agent.provider,
      latency: average,
    };
  });
}

function enrichNodes(nodes: ArchitectureNode[], architecture: ProjectArchitecture | null) {
  if (!architecture) return nodes;
  const liveAgents = telemetryNodes(architecture);
  const recalls = architecture.rag?.recalls ?? [];

  return nodes.map((item) => {
    if (item.kind === "model" && liveAgents.length) {
      return {
        ...item,
        technologies: unique([...item.technologies, ...liveAgents.map((agent) => agent.model)]),
        payload: { ...item.payload, live_agents: liveAgents },
        latency: liveAgents.map((agent) => agent.latency).join(" / "),
      };
    }
    if (item.kind === "rag" && recalls.length) {
      return {
        ...item,
        payload: {
          ...item.payload,
          live_recalls: recalls.length,
          context_chars: recalls.reduce((sum, recall) => sum + recall.chars, 0),
        },
      };
    }
    if (item.kind === "render" && architecture.media) {
      return { ...item, payload: { ...item.payload, live_media: architecture.media } };
    }
    return item;
  });
}

export function parseProjectShowcase(project: ResolvedProject): EngineeringShowcase {
  const { meta, architecture } = project;
  const blueprint = PROJECT_BLUEPRINTS[meta.slug];
  if (!blueprint) {
    throw new Error(`No project-specific architecture blueprint registered for "${meta.slug}"`);
  }

  const liveStack = unique([
    ...(architecture?.tech_stack ?? []),
    ...Object.values(architecture?.models ?? {}).map((model) => model.split("/").at(-1)),
    ...(architecture?.agents ?? []).map((agent) => agent.provider),
  ]);
  const telemetry = architecture?.milestones?.length
    ? [...architecture.milestones]
        .sort((a, b) => a.t_s - b.t_s)
        .map(({ event, t_s, ...payload }) =>
          `[+${t_s.toFixed(3)}s] ${event}${Object.keys(payload).length ? ` ${JSON.stringify(payload)}` : ""}`
        )
    : [
        `[architecture] ${meta.slug.toUpperCase()}_PIPELINE_LOADED`,
        ...blueprint.nodes.map(
          (item, index) =>
            `[architecture] NODE_${String(index + 1).padStart(2, "0")} ${item.title.toUpperCase().replaceAll(" ", "_")}`
        ),
      ];

  return {
    slug: meta.slug,
    stack: unique([...liveStack, ...blueprint.stack]).slice(0, 8),
    productionCost: "$0.04 / output min target",
    processingTime: formatDuration(architecture?.pipeline_execution_s),
    challenge: blueprint.challenge,
    outcome: blueprint.outcome,
    nodes: enrichNodes(blueprint.nodes, architecture),
    telemetry,
  };
}
