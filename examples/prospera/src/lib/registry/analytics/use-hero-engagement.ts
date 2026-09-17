"use client";

import { type RefObject, useEffect, useRef } from "react";

const DEFAULT_DWELL_MS = 5000;

export interface UseHeroEngagementOptions {
  /** Same section root the view tracker observes. */
  rootRef: RefObject<HTMLElement | null>;
  /**
   * When false the observer is skipped — callers pass
   * `eventsEnabled && !isEditing`.
   */
  enabled: boolean;
  /** Continuous in-viewport time required before `onDwell` fires. */
  dwellMs?: number;
  /** Fired once after `dwellMs` of continuous ≥ 50% visibility. */
  onDwell: (elapsedMs: number) => void;
  /**
   * Fired once the first time the hero leaves the viewport after
   * having been ≥ 50% visible. `msToScroll` is elapsed since mount.
   */
  onScrollPast: (msToScroll: number) => void;
}

/**
 * One-shot hero engagement observers: 5s continuous dwell and
 * scroll-past. Shares the section ref with `useViewTracking` so we
 * do not attach a second root element. Leaving the viewport resets
 * the dwell clock (continuous) but does not re-arm dwell or
 * scroll-past after they have fired.
 */
export function useHeroEngagement({
  rootRef,
  enabled,
  dwellMs = DEFAULT_DWELL_MS,
  onDwell,
  onScrollPast,
}: UseHeroEngagementOptions): void {
  const onDwellRef = useRef(onDwell);
  onDwellRef.current = onDwell;
  const onScrollPastRef = useRef(onScrollPast);
  onScrollPastRef.current = onScrollPast;

  useEffect(() => {
    if (!enabled) return;
    const node = rootRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;

    const mountedAt = performance.now();
    let seen = false;
    let enteredAt: number | null = null;
    let dwellTimer: ReturnType<typeof setTimeout> | null = null;
    let dwellFired = false;
    let scrollFired = false;

    const clearDwellTimer = () => {
      if (dwellTimer == null) return;
      clearTimeout(dwellTimer);
      dwellTimer = null;
    };

    const startDwellTimer = () => {
      if (dwellFired || dwellTimer != null || enteredAt == null) return;
      const remaining = Math.max(0, dwellMs - (performance.now() - enteredAt));
      dwellTimer = setTimeout(() => {
        dwellTimer = null;
        if (dwellFired || enteredAt == null) return;
        dwellFired = true;
        onDwellRef.current(Math.round(performance.now() - enteredAt));
      }, remaining);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visible =
            entry.isIntersecting && entry.intersectionRatio >= 0.5;
          if (visible) {
            seen = true;
            if (enteredAt == null) enteredAt = performance.now();
            startDwellTimer();
            continue;
          }
          if (seen && !scrollFired && !entry.isIntersecting) {
            scrollFired = true;
            onScrollPastRef.current(Math.round(performance.now() - mountedAt));
          }
          enteredAt = null;
          clearDwellTimer();
        }
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearDwellTimer();
    };
  }, [enabled, dwellMs, rootRef]);
}
