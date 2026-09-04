"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { UserProfile } from "@/lib/types";

interface ProfileDossierModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
}

const CONTACT_LINKS = [
  { key: "portfolio", label: "Portfolio", href: (profile: UserProfile) => profile.contact.portfolio },
  { key: "github", label: "GitHub", href: (profile: UserProfile) => profile.contact.github },
  { key: "linkedin", label: "LinkedIn", href: (profile: UserProfile) => profile.contact.linkedin },
  { key: "email", label: "Email", href: (profile: UserProfile) => `mailto:${profile.contact.email}` },
] as const;

export function ProfileDossierTrigger({ profile }: { profile: UserProfile }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-8 flex w-full items-center justify-between gap-4 border border-emerald-500/35 bg-emerald-400/[0.04] px-4 py-3.5 text-left transition hover:border-emerald-400/70 hover:bg-emerald-400/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          [+] View full academic & career dossier
        </span>
        <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600 sm:inline">
          Open uplink
        </span>
      </button>
      <ProfileDossierModal open={open} onClose={() => setOpen(false)} profile={profile} />
    </>
  );
}

export default function ProfileDossierModal({
  open,
  onClose,
  profile,
}: ProfileDossierModalProps) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose]);

  const drawer = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          <motion.button
            type="button"
            aria-label="Close academic and career dossier"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ x: "100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative flex h-full w-full max-w-xl flex-col border-l border-emerald-500/35 bg-zinc-950/92 shadow-[-24px_0_80px_rgba(0,255,102,0.08)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.035)_1px,transparent_1px)] bg-[size:22px_22px]" />

            <header className="relative z-10 flex items-start justify-between gap-4 border-b border-emerald-500/20 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                  Dossier / classified
                </p>
                <h2 id={titleId} className="mt-2 truncate text-lg font-semibold text-white">
                  Academic & career uplink
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="shrink-0 border border-zinc-700 bg-black/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300 transition hover:border-emerald-400/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                [ESC] / Close
              </button>
            </header>

            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              <section>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                  Identity
                </p>
                <p className="mt-2 text-xl font-semibold text-white">{profile.name}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-300/80">
                  {profile.role}
                </p>
                <p className="mt-2 font-mono text-[11px] text-zinc-400">{profile.location}</p>
              </section>

              <section className="mt-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                  Contact / uplink
                </p>
                <ul className="mt-3 grid gap-2">
                  {CONTACT_LINKS.map((link) => {
                    const href = link.href(profile);
                    const display =
                      link.key === "email" ? profile.contact.email : href.replace(/^https?:\/\//, "");
                    return (
                      <li key={link.key}>
                        <a
                          href={href}
                          target={link.key === "email" ? undefined : "_blank"}
                          rel={link.key === "email" ? undefined : "noreferrer"}
                          className="flex items-center justify-between gap-3 border border-zinc-800/90 bg-black/35 px-3 py-2.5 transition hover:border-emerald-500/40 hover:text-accent"
                        >
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-400/80">
                            {link.label}
                          </span>
                          <span className="truncate font-mono text-[11px] text-zinc-300">{display}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="mt-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                  Academic credentials
                </p>
                <ul className="mt-3 grid gap-3">
                  {profile.academic_background.map((credential) => (
                    <li
                      key={credential.degree}
                      className="border border-zinc-800/90 bg-black/35 p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-sm font-medium text-white">{credential.degree}</h3>
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                          {credential.period}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-emerald-200/70">
                        {credential.institution}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">{credential.highlight}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-8 pb-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                  Experience timeline
                </p>
                <ol className="relative mt-4 space-y-4 border-l border-emerald-500/30 pl-5">
                  {profile.experience_highlights.map((entry) => (
                    <li key={`${entry.company}-${entry.period}`} className="relative">
                      <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_10px_#00FF66]" />
                      <div className="border border-zinc-800/90 bg-black/35 p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-sm font-medium text-white">{entry.role}</h3>
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                            {entry.period}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-emerald-200/70">{entry.company}</p>
                        <p className="mt-3 text-sm leading-6 text-zinc-400">{entry.summary}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );

  return mounted ? createPortal(drawer, document.body) : null;
}
