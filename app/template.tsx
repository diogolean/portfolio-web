"use client";

import { motion } from "framer-motion";

// template.tsx remounts on every navigation, unlike layout.tsx — this is the
// deliberately simple crossfade requested for Build Ticket #001: no
// cross-route layoutId, no shared-element gymnastics, nothing that can hang
// the App Router. If a fancier transition is wanted later, swap this file
// for a client-side pathname-keyed <AnimatePresence> wrapper — do it as a
// separate ticket so a regression here doesn't block the whole route tree.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
