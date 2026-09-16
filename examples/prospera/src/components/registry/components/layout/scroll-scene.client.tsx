"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/registry/cn";
import {
  resolveSectionBackgroundClass,
  type SectionColorScheme,
} from "@/lib/registry/section-surface";

/**
 * Alpha of the tint wash over the shared background image. Sits in
 * the same band as the section-background scrim alpha (0.45) so the
 * tint reads as a color re-tone of the scene, not an opaque curtain
 * that hides the photo.
 */
export const SCROLL_SCENE_TINT_OPACITY = 0.5;

/**
 * Resolve a color stop to the tint layer's fill classes. Stops use
 * the shared section-surface vocabulary at BOLD intensity — the pure
 * scheme color (`bg-primary`, `bg-accent`, …) — because the subtle
 * `-background` tints are tuned against the page surface and don't
 * read over a scrimmed photo. `default` / `none` (and every invalid
 * token, which `parseColorStops` degrades to `none`) resolve to `""`:
 * no tint for that stop.
 */
export function sceneTintClass(stop: SectionColorScheme | undefined): string {
  if (!stop) return "";
  return resolveSectionBackgroundClass(stop, "bold");
}

export interface ScrollSceneTintProps {
  /**
   * One `color-scheme@1` token per DIRECT child of the placeholder,
   * in order (already parsed/validated — invalid tokens arrive as
   * `"none"`). Empty array = no tint, no observer.
   */
  colorStops: SectionColorScheme[];
  /** Cross-fade duration in ms (already parsed/clamped). */
  transitionMs: number;
  /** The placeholder subtree whose direct children are observed. */
  children?: ReactNode;
}

/**
 * Client half of the scroll-scene: paints the tint layer and drives
 * the active color stop from scroll position.
 *
 * Mechanism: an IntersectionObserver over the content wrapper's
 * DIRECT DOM children (the SDK placeholder renders each child
 * rendering as a direct child of the wrapper — that's the practical
 * seam, since the children arrive through the SDK and aren't ours to
 * instrument). The observation box is narrowed to the middle band of
 * the viewport (`rootMargin: -40% 0px -40%`), so "intersecting"
 * means "this section is centred" and tall sections still trigger
 * (a threshold-based ratio would never fire for children taller than
 * the viewport). IO only — the codebase has no CSS scroll-driven
 * animation precedent, and IO has universal support.
 *
 * The cross-fade is a plain CSS transition on the tint layer's
 * background-color/opacity (class swap between scheme fills), with
 * the duration from `TransitionMs`. `motion-reduce:transition-none`
 * disables the transition entirely under `prefers-reduced-motion`,
 * so stop changes snap instead of animating.
 *
 * SSR/hydration-safe: server and client both render stop 0 (or no
 * tint); the observer attaches in an effect on mount.
 */
export function ScrollSceneTint({
  colorStops,
  transitionMs,
  children,
}: ScrollSceneTintProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Nothing to drive: a single stop (or none) never changes.
    if (colorStops.length <= 1) return;
    const node = contentRef.current;
    if (!node) return;
    // SSR / runtimes without IntersectionObserver degrade to the
    // static first stop — content stays fully readable.
    if (typeof IntersectionObserver === "undefined") return;

    const sections = Array.from(node.children);
    if (sections.length === 0) return;
    const indexByElement = new Map<Element, number>(
      sections.map((element, index) => [element, index]),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        // Entries arrive in observation order; with the narrow centre
        // band at most one child is entering at a time in practice —
        // the last intersecting entry wins on the rare simultaneous
        // crossing (fast scroll), which self-corrects on settle.
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = indexByElement.get(entry.target);
          if (index !== undefined) setActiveIndex(index);
        }
      },
      // Middle ~20% of the viewport: a child "enters the view" when it
      // crosses the centre band. threshold 0 so children taller than
      // the viewport still fire.
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );
    for (const element of sections) observer.observe(element);
    return () => observer.disconnect();
    // Re-attach when the stop list changes shape (authoring edits);
    // the DOM children are stable per layout render.
  }, [colorStops.length]);

  const activeStop = colorStops[activeIndex];
  const tintClass = sceneTintClass(activeStop);
  const hasTint = tintClass !== "";

  return (
    <>
      <div
        aria-hidden="true"
        data-slot="scroll-scene-tint"
        data-active-index={activeIndex}
        data-active-stop={activeStop ?? "none"}
        className={cn(
          "pointer-events-none absolute inset-0 transition-[background-color,opacity] ease-in-out motion-reduce:transition-none",
          tintClass,
        )}
        style={{
          transitionDuration: `${transitionMs}ms`,
          opacity: hasTint ? SCROLL_SCENE_TINT_OPACITY : 0,
        }}
      />
      <div
        ref={contentRef}
        data-slot="scroll-scene-content"
        className="relative z-10"
      >
        {children}
      </div>
    </>
  );
}
