"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { OMNI_ENGINE_PATH } from "@/lib/omni";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const overlayRoute = pathname === OMNI_ENGINE_PATH;

  return (
    <motion.div
      initial={overlayRoute ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="will-change-[opacity]"
    >
      {children}
    </motion.div>
  );
}
