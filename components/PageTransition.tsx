"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import HexagonLoader from "@/components/HexagonLoader";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface PageTransitionContextValue {
  navigating: boolean;
  navigate: (href: string, status?: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) throw new Error("usePageTransition must be used within PageTransition");
  return context;
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [transition, setTransition] = useState<{ href: string; status: string } | null>(null);

  const navigate = useCallback(
    (href: string, status = "INITIALIZING PIPELINE AGENT...") => {
      if (transition || href === pathname) return;
      setTransition({ href, status });
      timer.current = setTimeout(() => router.push(href), 300);
    },
    [pathname, router, transition]
  );

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      timer.current = setTimeout(() => setTransition(null), 50);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname]);

  return (
    <PageTransitionContext.Provider value={{ navigating: transition != null, navigate }}>
      {children}
      <AnimatePresence>
        {transition && (
          <motion.div
            key="page-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-black will-change-[opacity]"
            role="status"
            aria-live="polite"
          >
            <HexagonLoader fullscreen={false} status={transition.status} />
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransitionContext.Provider>
  );
}
