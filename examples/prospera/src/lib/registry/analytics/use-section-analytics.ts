"use client";

import { type MouseEvent, type RefObject, useCallback, useMemo } from "react";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { useComponentAnalytics } from "@/lib/registry/analytics/use-component-analytics";
import { useViewTracking } from "@/lib/registry/analytics/use-view-tracking";

/**
 * Base shape every heros-and-promos analytics meta object satisfies.
 * Family-specific meta interfaces (`HeroAnalyticsMeta`,
 * `BannerAnalyticsMeta`, etc.) extend this — they may add their own
 * fields, but the `id` / `instanceKey` / `instanceScope` / `variant`
 * keys flow through every event the section fires.
 *
 * `label` and `href` are present here because the shared click
 * delegate spreads them onto the meta when firing a CTA event; every
 * family-meta interface already includes them so the spread is
 * type-safe.
 */
export interface SectionAnalyticsBaseMeta {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  variant?: string;
  /** Augmented onto CTA-click events from the anchor's text content. */
  label?: string;
  /** Augmented onto CTA-click events from the anchor's href attribute. */
  href?: string;
}

/** Which `data-cta` slots the section should fire click events for. */
export type SectionCtaKind = "primary" | "secondary";

export interface UseSectionAnalyticsOptions<
  TMeta extends SectionAnalyticsBaseMeta,
> {
  /** Component family key passed through to `useComponentAnalytics`. */
  family: string;
  /** Variant name surfaced on every event (e.g. `"Default"`, `"FullBleed"`). */
  variant: string;
  /** Sitecore rendering id — defaults the `instanceKey` when not author-supplied. */
  id?: string;
  /** Author-supplied analytics handle. Falls back to title-text → id. */
  instanceKey?: string;
  /** Personalization-history scope (default `"site"`). */
  instanceScope?: "site" | "page";
  /** Title source used to derive the `instanceKey` when the author leaves it blank. */
  titleSource?: TextSource;
  /** Hard kill switch — false short-circuits view + CTA event firing. */
  eventsEnabled: boolean;
  /**
   * Editing-mode signal — true skips analytics entirely. `undefined`
   * is treated as "not in editing mode" so consumers can pass an
   * optional flag without coercion at the call site.
   */
  isEditing: boolean | undefined;
  /**
   * Extra family-specific meta fields merged into the base. Use for
   * fields like a per-variant content classification or a fixed label
   * that always rides along.
   */
  extraMeta?: Partial<Omit<TMeta, keyof SectionAnalyticsBaseMeta>>;
  /**
   * Which CTAs to fire click events for. Sections with no CTAs (or
   * sections that handle clicks themselves) leave this `undefined` —
   * the returned `onClickDelegate` becomes a no-op in that case.
   */
  ctas?: SectionCtaKind[];
  /**
   * Suppress the auto-fire of the `view` CDP event. Set true on
   * sections whose recipe `events: []` block intentionally omits
   * `view` because OOTB Sitecore CDP auto-capture already fires
   * VIEW per page render — keeps the dev console clean of
   * "no event registered" warnings.
   */
  skipViewTracking?: boolean;
}

export interface UseSectionAnalyticsResult<
  TMeta extends SectionAnalyticsBaseMeta,
> {
  /** Ref to attach to the section root for IntersectionObserver view tracking. */
  rootRef: RefObject<HTMLElement | null>;
  /**
   * `onClick` handler to attach to the section root. Walks the click
   * target to the nearest `a[data-cta]` and fires
   * `primary-cta-clicked` / `secondary-cta-clicked` events with the
   * anchor's text + href appended to the meta. No-op when `ctas` is
   * empty or `eventsEnabled` is false.
   */
  onClickDelegate: (event: MouseEvent<HTMLElement>) => void;
  /** The constructed meta object — useful for ad-hoc `fire` calls. */
  meta: TMeta;
  /**
   * Direct access to the family's analytics fire function. Use for
   * lifecycle events outside the view/CTA model — submit attempts,
   * dismiss, copy, etc.
   */
  fire: (event: string, meta?: TMeta) => void;
}

/**
 * Shared analytics wiring for the heros-and-promos family. Composes
 * `useComponentAnalytics` (family-keyed CDP fire) with
 * `useViewTracking` (one-shot IntersectionObserver) and a click
 * delegate that walks `data-cta` anchors. Variants now own only the
 * meta extensions they care about — the observer/threshold/delegate
 * dance is centralised here.
 */
export function useSectionAnalytics<TMeta extends SectionAnalyticsBaseMeta>(
  opts: UseSectionAnalyticsOptions<TMeta>,
): UseSectionAnalyticsResult<TMeta> {
  const {
    family,
    variant,
    id,
    instanceKey,
    instanceScope = "site",
    titleSource,
    eventsEnabled,
    isEditing,
    extraMeta,
    ctas,
    skipViewTracking,
  } = opts;
  const analytics = useComponentAnalytics<TMeta>(family);

  const meta = useMemo<TMeta>(
    () =>
      ({
        id,
        instanceKey: instanceKey || getSourceText(titleSource) || id,
        instanceScope,
        variant,
        ...(extraMeta as Partial<TMeta>),
      }) as TMeta,
    [id, instanceKey, instanceScope, variant, titleSource, extraMeta],
  );

  const rootRef = useViewTracking({
    enabled: eventsEnabled && !isEditing && !skipViewTracking,
    onView: () => analytics.fire("view", meta),
  });

  const ctaSet = useMemo(() => new Set(ctas ?? []), [ctas]);
  const onClickDelegate = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!eventsEnabled || ctaSet.size === 0) return;
      const anchor = (event.target as HTMLElement).closest?.("a[data-cta]");
      if (!anchor) return;
      const cta = anchor.getAttribute("data-cta") as SectionCtaKind | null;
      if (!cta || !ctaSet.has(cta)) return;
      const eventName =
        cta === "primary" ? "primary-cta-clicked" : "secondary-cta-clicked";
      analytics.fire(eventName, {
        ...meta,
        label: anchor.textContent?.trim() || undefined,
        href: anchor.getAttribute("href") ?? undefined,
      } as TMeta);
    },
    [analytics, eventsEnabled, ctaSet, meta],
  );

  return {
    rootRef,
    onClickDelegate,
    meta,
    fire: analytics.fire,
  };
}
