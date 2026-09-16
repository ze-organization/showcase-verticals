"use client";

import { type RefObject, useEffect, useRef } from "react";

export interface UseViewTrackingOptions {
  /**
   * When false the observer is skipped entirely — analytics writers
   * pass `eventsEnabled && !isEditing` so editing-mode renders and
   * `trackEvents=off` placements stay quiet.
   */
  enabled: boolean;
  /**
   * Intersection ratio at which `onView` fires. Defaults to 0.5 to
   * match the existing hero / article-header / promo / callout-card /
   * subscription-banner thresholds — half the section visible counts
   * as a "view".
   */
  threshold?: number;
  /**
   * Fired once, the first time the observed element crosses the
   * threshold. The hook disconnects the observer after firing, so
   * subsequent re-entries do not re-fire.
   *
   * Stored in a ref internally so its identity does not retrigger the
   * effect — consumers can pass a fresh closure each render without
   * paying for observer re-creation.
   */
  onView: () => void;
}

/**
 * Shared IntersectionObserver wiring for one-shot view tracking.
 * Returns a ref the consumer attaches to the section root; once the
 * element crosses `threshold` while `enabled` is true, `onView` fires
 * once and the observer disconnects.
 *
 * Skipped automatically when:
 *   - `enabled` is false
 *   - the ref is unmounted
 *   - the runtime has no `IntersectionObserver` (SSR + older browsers)
 *   - `onView` has already fired for this mount
 */
export function useViewTracking({
  enabled,
  threshold = 0.5,
  onView,
}: UseViewTrackingOptions): RefObject<HTMLElement | null> {
  const rootRef = useRef<HTMLElement | null>(null);
  const hasFiredRef = useRef(false);
  const onViewRef = useRef(onView);
  onViewRef.current = onView;

  useEffect(() => {
    if (!enabled) return;
    if (hasFiredRef.current) return;
    const node = rootRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (hasFiredRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            hasFiredRef.current = true;
            onViewRef.current();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, threshold]);

  return rootRef;
}
