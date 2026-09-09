"use client";

import { forwardRef } from "react";

interface CloseButtonProps {
  onClick: () => void;
  autoFocus?: boolean;
}

const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton({ onClick, autoFocus }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        autoFocus={autoFocus}
        className="shrink-0 border border-zinc-700 bg-black/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300 transition hover:border-emerald-400/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        [ESC] / Close
      </button>
    );
  },
);

export default CloseButton;
