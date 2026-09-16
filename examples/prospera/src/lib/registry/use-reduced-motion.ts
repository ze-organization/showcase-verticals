"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to `prefers-reduced-motion: reduce` and returns the
 * current value. Listens for changes so toggling the OS-level
 * preference live updates without a refresh.
 *
 * SSR-safe — returns `false` on the server (no window) so animated
 * components don't hydrate with a different value than they rendered.
 * Consumers gate their animation effect on the returned boolean.
 *
 * Single source of truth for the reduced-motion check across the
 * registry. Avoid re-declaring this hook locally — pull from here so
 * every animated surface reads the same shape, and a future change to
 * how we detect motion preferences happens in exactly one place.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, []);

  return reduced;
}
