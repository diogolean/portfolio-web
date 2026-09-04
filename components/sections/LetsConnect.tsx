"use client";

import { useEffect, useRef, useState } from "react";
import profileData from "@/data/profile.json";

const { email, github, linkedin, portfolio } = profileData.contact;

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = email;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

export default function LetsConnect() {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    []
  );

  async function handleCopy() {
    await copyEmail();
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2200);
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative mx-auto w-full max-w-2xl scroll-mt-28 overflow-hidden rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 shadow-[0_0_70px_rgba(16,185,129,0.045)] backdrop-blur-sm sm:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
      />
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-emerald-500/80">
        // Initiate direct pipeline
      </p>
      <h2 id="contact-heading" className="text-xl font-light tracking-tight text-neutral-100 sm:text-2xl">
        Let&apos;s connect and build what comes next.
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
        Available for focused collaborations in agentic systems, automation, and digital products.
      </p>

      <button
        type="button"
        onClick={handleCopy}
        className="group mt-7 flex w-full items-center justify-between gap-4 rounded-full border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-left transition-colors hover:border-emerald-500/30 focus-visible:border-emerald-500/50 focus-visible:outline-none sm:px-5"
        aria-label={`Copy ${email}`}
      >
        <span className="min-w-0 truncate font-mono text-xs text-neutral-200 sm:text-sm">{email}</span>
        <span
          className={`shrink-0 font-mono text-[9px] tracking-widest transition-colors sm:text-[10px] ${
            copied ? "text-emerald-400" : "text-neutral-600 group-hover:text-emerald-400"
          }`}
          role="status"
          aria-live="polite"
        >
          {copied ? "COPIED TO CLIPBOARD" : "COPY ADDRESS"}
        </span>
      </button>

      <nav aria-label="External profiles" className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        {[
          { label: "GitHub", href: github },
          { label: "LinkedIn", href: linkedin },
          { label: "Portfolio", href: portfolio },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 transition-colors hover:text-emerald-400 focus-visible:text-emerald-400 focus-visible:outline-none"
          >
            {link.label} <span aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
    </section>
  );
}
