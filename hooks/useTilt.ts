"use client";

import { useEffect, useRef } from "react";

/**
 * Reads a numeric CSS custom property (e.g. "20deg", "0.18", "4px") off
 * `:root` at call time, stripping any unit suffix. This is what lets the
 * DESIGN CONFIG block in globals.css actually drive JS behavior (tilt
 * sensitivity, smoothing) instead of only decorating elements that never
 * read it back.
 */
export function readCssNumber(varName: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const parsed = parseFloat(raw);
  return Number.isNaN(parsed) ? fallback : parsed;
}

interface UseTiltOptions {
  /** CSS custom property (globals.css DESIGN CONFIG block) holding the max
   * rotation in degrees at a full-range pointer offset, e.g.
   * "--tilt-sensitivity" (per-card) or "--tilt-cluster-max" (whole mosaic).
   * Read once on mount — edit the value in globals.css and reload. */
  maxDegVar: string;
  maxDegFallback?: number;
  /** CSS custom property holding the per-frame lerp factor (0..1). Lower =
   * floatier/heavier, higher = snappier. */
  smoothingVar?: string;
  smoothingFallback?: number;
  /**
   * Custom properties are written as `--${varPrefix}rx` / `--${varPrefix}ry`
   * on the returned ref's element every animation frame. Give the
   * cluster-level tilt its own prefix (e.g. "cluster-") so it never
   * shadows/inherits into an individual card's own `--rx`/`--ry`.
   */
  varPrefix?: string;
}

/**
 * Smoothed 3D tilt driven by CSS custom properties, eased toward a target
 * every animation frame via requestAnimationFrame — this is what turns raw
 * pointer deltas into a damped, physical-feeling rotation instead of the
 * tilt snapping straight to the cursor. Bypasses React re-renders entirely
 * (writes via `ref.current.style.setProperty`), and is a no-op under
 * `prefers-reduced-motion: reduce` (the CSS `transform: none !important`
 * rules in globals.css are the actual accessibility guarantee either way).
 *
 * Used by both HexCard (per-card hover tilt) and HexMosaic (whole-cluster
 * ambient parallax) — see globals.css `.hex-tilt` / `.hex-cluster-tilt`.
 */
export function useTilt<T extends HTMLElement>({
  maxDegVar,
  maxDegFallback = 12,
  smoothingVar = "--tilt-smoothing",
  smoothingFallback = 0.18,
  varPrefix = "",
}: UseTiltOptions) {
  const ref = useRef<T>(null);
  const target = useRef({ rx: 0, ry: 0 });
  const current = useRef({ rx: 0, ry: 0 });
  const frame = useRef<number | null>(null);
  const maxDeg = useRef(maxDegFallback);
  const smoothing = useRef(smoothingFallback);

  useEffect(() => {
    maxDeg.current = readCssNumber(maxDegVar, maxDegFallback);
    smoothing.current = readCssNumber(smoothingVar, smoothingFallback);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function tick() {
      const el = ref.current;
      if (el) {
        current.current.rx += (target.current.rx - current.current.rx) * smoothing.current;
        current.current.ry += (target.current.ry - current.current.ry) * smoothing.current;
        el.style.setProperty(`--${varPrefix}rx`, `${current.current.rx}deg`);
        el.style.setProperty(`--${varPrefix}ry`, `${current.current.ry}deg`);
      }
      frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [maxDegVar, maxDegFallback, smoothingVar, smoothingFallback, varPrefix]);

  /** px/py expected in the -0.5..0.5 range (pointer offset from center). */
  function setTiltFromOffset(px: number, py: number) {
    target.current = { rx: px * maxDeg.current * 2, ry: -py * maxDeg.current * 2 };
  }

  function resetTilt() {
    target.current = { rx: 0, ry: 0 };
  }

  return { ref, setTiltFromOffset, resetTilt };
}
