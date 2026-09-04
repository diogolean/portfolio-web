"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Profile", href: "/#profile" },
  { label: "Contact", href: "/#contact" },
];

export default function Header() {
  const [expanded, setExpanded] = useState(false);

  return (
    <header className="pointer-events-none fixed left-1/2 top-8 z-50 -translate-x-1/2">
      <motion.nav
        aria-label="Primary navigation"
        layout
        onMouseEnter={() => {
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setExpanded(true);
        }}
        onMouseLeave={() => {
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setExpanded(false);
        }}
        onFocus={(event) => {
          if ((event.target as HTMLElement).matches(":focus-visible")) setExpanded(true);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
        }}
        transition={{ layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
        className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-2 overflow-hidden rounded-full border border-neutral-800/80 bg-neutral-950/80 px-4 py-1.5 backdrop-blur-md will-change-[width]"
      >
        <a
          href="/#mosaic"
          aria-label="Go to project mosaic"
          onClick={() => setExpanded(true)}
          className="flex shrink-0 cursor-pointer items-center outline-none"
        >
          <span className="whitespace-nowrap font-mono text-xs tracking-widest text-emerald-400 [text-shadow:0_0_6px_rgba(52,211,153,0.35)]">
            OMNI-ENGINE
          </span>
        </a>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="navigation"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center overflow-hidden"
            >
              <span aria-hidden="true" className="mx-2 h-3 w-px shrink-0 bg-neutral-800" />
              <div className="flex items-center gap-3">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap font-mono text-[10px] tracking-wider text-neutral-400 transition-colors hover:text-emerald-400 focus-visible:text-emerald-400 focus-visible:outline-none sm:text-[11px]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
