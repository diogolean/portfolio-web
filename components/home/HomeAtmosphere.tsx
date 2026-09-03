"use client";

import { useState, type MouseEvent, type ReactNode } from "react";

export default function HomeAtmosphere({ children }: { children: ReactNode }) {
  const [cursor, setCursor] = useState({ x: 720, y: 220 });

  function trackPointer(event: MouseEvent<HTMLDivElement>) {
    setCursor({ x: event.clientX, y: event.clientY });
  }

  return (
    <div className="relative isolate min-h-screen" onMouseMove={trackPointer}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_70%_12%,rgba(0,255,102,0.07),transparent_38%),radial-gradient(circle_at_15%_35%,rgba(59,130,246,0.05),transparent_28%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 transition-[background] duration-150"
        style={{
          background: `radial-gradient(600px circle at ${cursor.x}px ${cursor.y}px, rgba(16,185,129,0.03), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}
