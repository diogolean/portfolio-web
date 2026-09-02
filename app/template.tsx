"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import HexTransitionLoader from "@/components/showcase/HexTransitionLoader";

export default function Template({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHydrated(true), 520);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>{!hydrated && <HexTransitionLoader />}</AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: hydrated ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  );
}
