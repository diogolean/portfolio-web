import Link from "next/link";
import { OMNI_ENGINE_PATH } from "@/lib/omni";

export default function OmniTriggerTitle() {
  return (
    <Link
      href={OMNI_ENGINE_PATH}
      scroll={false}
      className="glow-pulse-trigger max-w-5xl cursor-pointer text-center text-2xl font-bold tracking-tight text-foreground outline-none sm:text-2xl md:text-4xl"
      aria-haspopup="dialog"
    >
      An ecosystem of automated pipelines.
    </Link>
  );
}
