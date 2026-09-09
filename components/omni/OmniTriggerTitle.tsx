"use client";

import { openOmniCore } from "./OmniCoreModal";

export default function OmniTriggerTitle() {
  return (
    <button
      type="button"
      onClick={openOmniCore}
      className="glow-pulse-trigger max-w-5xl cursor-pointer text-center text-2xl font-bold tracking-tight text-foreground outline-none sm:text-2xl md:text-4xl"
      aria-haspopup="dialog"
    >
      An ecosystem of automated pipelines.
    </button>
  );
}
