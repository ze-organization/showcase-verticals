"use client";

import { isValidElement, type ReactNode } from "react";
import {
  BAND_INLINE_HEADING_GRID_CLASS,
  parseBandHeadingPlacement,
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/registry/blocks/section-heading";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  resolveSectionSurfaceClass,
  SECTION_MAX_WIDTH_CLASSES,
  SECTION_OVERLAP_TOP_CLASSES,
  SECTION_PADDING_Y_CLASSES,
  type SectionSurfaceProps,
} from "@/lib/registry/section-surface";
import {
  resolvePlaceholderChildren,
  resolvedPlaceholderName,
} from "@/lib/registry/placeholder-children";
import {
  type ComponentRendering,
  Placeholder,
  useSitecore,
} from "@/lib/registry/sitecore";

/**
 * Empty-state caption shared by every entity carousel / list-grid in
 * cards-and-lists. Author-supplied `message` wins; otherwise the
 * variant-supplied fallback (e.g. "Articles") renders, with the
 * `is-empty-hint` marker so editing-mode tooling can target it.
 *
 * The default outer wrapper is a muted centered caption. Pass
 * `className` to swap it for a different shell — e.g. a dashed-border
 * placeholder card — without losing the screen-reader marker.
 */
export function EmptyHint({
  message,
  children,
  className,
}: {
  message?: TextSource;
  children?: ReactNode;
  className?: string;
}) {
  const text = getSourceText(message);
  return (
    <div
      className={className ?? "py-8 text-center text-muted-foreground text-sm"}
    >
      <span className="is-empty-hint">{text ?? children}</span>
    </div>
  );
}

/**
 * Placeholder + children fallback slot used when no items are bound but
 * the section is composed via Sitecore Pages chrome. Under the SDK,
 * `<Placeholder>` resolves the rendering tree. In Storybook / non-Sitecore
 * runtimes, the `fallback` (React children) renders directly.
 */
export function ComposedSlot({
  placeholderKey,
  rendering,
  fallback,
  className,
}: {
  placeholderKey: string;
  rendering?: unknown;
  fallback?: ReactNode;
  className?: string;
}) {
  if (rendering) {
    return (
      <div className={className}>
        {/* @ts-expect-error — rendering is opaque here; SDK validates at runtime */}
        <Placeholder name={placeholderKey} rendering={rendering} />
      </div>
    );
  }
  return <div className={className}>{fallback}</div>;
}

/**
 * One placeholder child mounted through a sliced envelope so layout
 * variants (grid / carousel / featured) can wrap slot children instead
 * of flattening a Treelist. Mirrors hero-carousel's ComposedSlide.
 */
export function ComposedChild({
  rendering,
  slotKey,
  child,
}: {
  rendering: ComponentRendering;
  slotKey: string;
  child: unknown;
}) {
  const sliced = {
    ...rendering,
    placeholders: { [slotKey]: [child] },
  } as ComponentRendering;
  return <Placeholder name={slotKey} rendering={sliced} />;
}

/**
 * Published-mode wrap of placeholder children as layout nodes. Editing
 * still uses {@link ComposedSlot} so Pages chrome can add / reorder.
 *
 * @param rendering - Parent layout-service envelope
 * @param placeholderPrefix - Slot prefix without `-{*}` (e.g. `cards-media-gallery`)
 * @returns Resolved slot key plus one node per child
 */
export function composedChildNodes(
  rendering: ComponentRendering | undefined,
  placeholderPrefix: string,
  dynamicPlaceholderId?: string,
): { key: string; nodes: ReactNode[] } {
  const { key, children } = resolvePlaceholderChildren(
    rendering,
    placeholderPrefix,
    dynamicPlaceholderId,
  );
  const layoutChildren = children.filter(
    (child) =>
      child != null &&
      typeof child === "object" &&
      typeof (child as { componentName?: unknown }).componentName ===
        "string" &&
      (child as { componentName: string }).componentName.length > 0,
  );
  if (!rendering || layoutChildren.length === 0) return { key, nodes: [] };
  return {
    key,
    nodes: layoutChildren.map((child, index) => (
      <ComposedChild
        key={(child as { uid?: string }).uid ?? `composed-${index}`}
        rendering={rendering}
        slotKey={key}
        child={child}
      />
    )),
  };
}

/**
 * Stable key for a composed placeholder child mounted as a carousel
 * slide. Prefers the React key {@link composedChildNodes} already
 * stamped from the child's uid.
 */
export function composedSlideKey(node: ReactNode, index: number): string {
  if (isValidElement(node) && node.key != null) {
    return String(node.key);
  }
  return `composed-${index}`;
}

/**
 * Featured 2+1 split for composed placeholder children. Card variants
 * stay whatever the author dropped; the layout chrome matches curated
 * FeaturedLayout (hero col-span-2, up to three sidebar cells).
 */
export function wrapComposedFeaturedSplit(nodes: ReactNode[]): ReactNode {
  const [featured, ...rest] = nodes;
  if (!featured) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="min-w-0 lg:col-span-2">{featured}</div>
      <ul className="grid list-none grid-cols-1 gap-4 ps-0 sm:grid-cols-2 lg:grid-cols-1">
        {rest.slice(0, 3).map((node, index) => (
          <li key={composedSlideKey(node, index)} className="min-w-0">
            {node}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Featured-list 7/5 split for composed children: lead cell beside an
 * uncapped divider-separated stack. Matches curated FeaturedListLayout.
 */
export function wrapComposedFeaturedList(nodes: ReactNode[]): ReactNode {
  const [featured, ...rest] = nodes;
  if (!featured) return null;
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-7 [&>*]:h-full">{featured}</div>
      <ul className="m-0 list-none divide-y divide-border ps-0 lg:col-span-5">
        {rest.map((node, index) => (
          <li
            key={composedSlideKey(node, index)}
            className="min-w-0 py-3 first:pt-0 last:pb-0"
          >
            {node}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Fifty-fifty: first two composed children in a 2-col grid. */
export function wrapComposedFiftyFifty(nodes: ReactNode[]): ReactNode {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {nodes.slice(0, 2).map((node, index) => (
        <div key={composedSlideKey(node, index)} className="min-w-0">
          {node}
        </div>
      ))}
    </div>
  );
}

/** wrapComposed for list-grid variants that need more than a className. */
export function wrapComposedByListVariant(
  layoutVariant: string,
): ((nodes: ReactNode[]) => ReactNode) | undefined {
  if (layoutVariant === "featured") return wrapComposedFeaturedSplit;
  if (layoutVariant === "featured-list") return wrapComposedFeaturedList;
  if (layoutVariant === "fifty-fifty") return wrapComposedFiftyFifty;
  return undefined;
}

/**
 * No-items body for a cards-and-lists listing: the section heading
 * (Eyebrow / Title / Lead) followed by either the composed placeholder
 * slot or the empty-state hint.
 *
 * Every `*Carousel` / `*ListGrid` used to render its heading ONLY via
 * `ItemCarousel` / `ItemListing` inside the curated/search branch — the
 * composed and empty branches skipped it entirely. A fresh drop (no
 * curated items yet) therefore rendered NOTHING for the authored
 * Eyebrow / Title / Lead, which read as "these fields don't work" in
 * Pages. Wrapping the fallback body in `SectionHeading` keeps the
 * heading visible in every data mode; split heading layouts get the
 * fallback body as their content column for free.
 */
export function ListingFallback({
  heading,
  headingPlacement,
  placeholderKey,
  rendering,
  fallback,
  composedClassName,
  emptyStateMessage,
  emptyClassName,
  children,
  isEditing,
  wrapComposed,
  composedOwnsHeading,
}: {
  /** SectionHeading config — same object the items branch hands to
   * `ItemCarousel` / `ItemListing`. Omit for headingless listings. */
  heading?: SectionHeadingProps;
  /**
   * `band-heading-placement@1` — `above` (default) stacks the heading
   * over the slot; `inline` puts it in the band's leading column.
   */
  headingPlacement?: string;
  placeholderKey: string;
  rendering?: unknown;
  /** Composed-mode React children (Sitecore SDK-injected). When absent
   * and `rendering` is also absent, the empty hint renders instead. */
  fallback?: ReactNode;
  composedClassName?: string;
  emptyStateMessage?: TextSource;
  /** Optional EmptyHint shell override (e.g. dashed placeholder card). */
  emptyClassName?: string;
  /** Empty-state fallback caption when no author message is set. */
  children?: ReactNode;
  /**
   * Empty slot: stacked drop tray so authors can add the first child.
   * When slot children exist, wrap them in the variant layout (grid /
   * featured split) in both Pages and published.
   */
  isEditing?: boolean;
  /**
   * Published-mode layout around composed children (grid class, carousel
   * slides, featured split). Default: a `div` with `composedClassName`.
   */
  wrapComposed?: (nodes: ReactNode[]) => ReactNode;
  /**
   * When true, `wrapComposed` owns heading chrome (carousel header-nav
   * row, inline heading placement). ListingFallback still wraps the
   * empty/editing tray so Title / Lead stay visible on a fresh drop.
   */
  composedOwnsHeading?: boolean;
}) {
  const sitecore = useSitecore() as {
    page?: { mode?: { isEditing?: boolean } };
  };
  const editing =
    isEditing ?? Boolean(sitecore?.page?.mode?.isEditing);
  const placeholderPrefix = placeholderKey.replace(/-\{\*\}$/, "");
  const envelope = rendering as ComponentRendering | undefined;
  const { key: resolvedKey, nodes } = composedChildNodes(
    envelope,
    placeholderPrefix,
    (
      envelope as { params?: { DynamicPlaceholderId?: string } } | undefined
    )?.params?.DynamicPlaceholderId,
  );
  const slotKey =
    resolvedKey || resolvedPlaceholderName(envelope, placeholderKey);
  // Empty editing: stacked drop tray (a published grid on an empty
  // Placeholder paints dead muted cells). Once children exist, apply
  // the variant layout so Grid / List / Featured actually change.
  const slotClassName =
    editing && nodes.length === 0
      ? "min-h-[160px] space-y-3"
      : composedClassName;

  let body: ReactNode;
  // Once slot children exist, wrap them in the variant layout (Featured
  // 2+1, grid columns, twist triptych) even in Pages. An empty slot
  // stays a stacked drop tray so authors can add the first child.
  if (nodes.length > 0) {
    body = wrapComposed ? (
      wrapComposed(nodes)
    ) : (
      <div className={composedClassName}>{nodes}</div>
    );
  } else if (fallback || rendering) {
    body = (
      <ComposedSlot
        placeholderKey={slotKey}
        rendering={rendering}
        fallback={fallback}
        className={slotClassName}
      />
    );
  } else {
    body = (
      <EmptyHint message={emptyStateMessage} className={emptyClassName}>
        {children}
      </EmptyHint>
    );
  }
  if (!heading) return body;
  if (composedOwnsHeading && nodes.length > 0) return body;
  if (parseBandHeadingPlacement(headingPlacement) === "inline") {
    return (
      <div className={BAND_INLINE_HEADING_GRID_CLASS}>
        <SectionHeading {...heading} isEditing={editing} />
        <div className="min-w-0">{body}</div>
      </div>
    );
  }
  return (
    <SectionHeading {...heading} isEditing={editing}>
      {body}
    </SectionHeading>
  );
}

export interface ListingSectionProps extends SectionSurfaceProps {
  /**
   * Variant slug — e.g. `"articles-carousel"`, `"person-list-grid"`.
   * Used as the section's `data-slot` and the trailing className token
   * that previews and editing chrome key on. Required.
   */
  slot: string;
  /**
   * Optional family prefix class — e.g. `"articles"`, `"persons"`. When
   * present, the section emits `component <entityName> <slot>`; omit it
   * and the section emits `component <slot>` (used by variants that
   * collapse family + slug into one token, like `media-carousel`).
   *
   * Plurality is independent of the slot: persons-family variants pass
   * `entityName="persons"` with `slot="person-carousel"`.
   */
  entityName?: string;
  /** Section element id, mirrors the standard section-component contract. */
  id?: string;
  /** Extra classes appended to the section root. */
  className?: string;
  /**
   * Surface tone classes applied to the section root. When set, this
   * raw-class escape hatch wins over the semantic `colorScheme` /
   * `backgroundIntensity` pair. When neither is set the section
   * defaults to `bg-background text-foreground`.
   */
  surfaceClassName?: string;
  /**
   * Tailwind max-width utility for the inner wrapper. Defaults to
   * `max-w-6xl` to match the existing card listings; override when a
   * variant needs a narrower or wider canvas.
   */
  innerMaxWidth?: string;
  /**
   * Opt the section out of the constrained `container` + max-width
   * pair entirely. The outer wrapper becomes `w-full py-12 md:py-16`
   * and the inner becomes `w-full px-4`, matching the media-carousel
   * `FullBleed` variant. `innerMaxWidth` is ignored in this mode.
   */
  fullBleed?: boolean;
  /**
   * Optional full-bleed content rendered inside the `<section>` but
   * ABOVE the constrained container + max-width inner pair. Used by
   * locations-carousel's `MapAbove` variant for the map slot, and
   * by media-carousel-style sections that surface a full-width
   * banner above the carousel body.
   */
  beforeContainer?: ReactNode;
  /**
   * Inner contents — typically the `<ItemCarousel>` / `<ItemListing>`
   * call, a `<ComposedSlot>`, or an `<EmptyHint>` depending on which
   * data path is active.
   */
  children: ReactNode;
}

/**
 * Shared shell for the `*Carousel` / `*ListGrid` family in cards-and-lists.
 * Renders the `<section>` + responsive `container` + max-width inner
 * wrapper that every variant repeated. The caller picks what fills the
 * inner — usually a small conditional that picks between an items
 * renderer, a `<ComposedSlot>`, and an `<EmptyHint>`.
 *
 * RTL-safe (no physical left/right), mobile-first padding, and the
 * surface tone classes are kept here so card consumers can't drift.
 */
export interface ListingSectionRootProps {
  /** Same as `ListingSection.slot` — drives `data-slot` and the trailing className token. */
  slot: string;
  /** Optional family prefix class — emits `component <entityName> <slot>` when set. */
  entityName?: string;
  id?: string;
  className?: string;
  surfaceClassName?: string;
  children: ReactNode;
}

/**
 * Just the `<section>` chrome — `component <entityName> <slot> w-full`
 * + surface tone + `data-slot`. Shared between `ListingSection` (which
 * adds the constrained container + max-width inner) and bespoke
 * layouts like `FeatureSpotlightLayout` that own their own inner
 * wrappers but still want consistent section-root semantics.
 */
export function ListingSectionRoot({
  slot,
  entityName,
  id,
  className,
  surfaceClassName = "bg-background text-foreground",
  children,
}: ListingSectionRootProps) {
  return (
    <section
      className={cn(
        "component",
        entityName,
        slot,
        "w-full",
        surfaceClassName,
        className?.trimEnd(),
      )}
      id={id}
      dir="inherit"
      data-slot={slot}
    >
      {children}
    </section>
  );
}

export function ListingSection({
  slot,
  entityName,
  id,
  className,
  surfaceClassName,
  colorScheme = "default",
  backgroundIntensity = "subtle",
  paddingY = "auto",
  maxWidth = "auto",
  overlapTop = "none",
  innerMaxWidth = "max-w-6xl",
  fullBleed,
  beforeContainer,
  children,
}: ListingSectionProps) {
  // Raw-class escape hatch wins; otherwise resolve the semantic
  // scheme/intensity pair through the shared section-surface
  // vocabulary (same mapping section-wrapper uses). A `default`/`none`
  // scheme keeps the historical explicit `bg-background text-foreground`
  // paint rather than inheriting, so existing placements don't shift.
  const resolvedSurfaceClassName =
    surfaceClassName ??
    (resolveSectionSurfaceClass(colorScheme, backgroundIntensity) ||
      "bg-background text-foreground");
  // `auto` keeps the historical responsive `py-12 md:py-16`; an
  // explicit pick (incl. `none`) takes over entirely.
  const paddingClassName =
    paddingY === "auto"
      ? "py-12 md:py-16"
      : SECTION_PADDING_Y_CLASSES[paddingY];
  // `auto` keeps the caller-supplied `innerMaxWidth` (max-w-6xl for
  // card listings); a semantic pick maps through the shared vocabulary.
  const maxWidthClassName =
    maxWidth === "auto" ? innerMaxWidth : SECTION_MAX_WIDTH_CLASSES[maxWidth];
  // Floating-overlap treatment (`overlap-top@1`): the inner wrapper is
  // pulled up over the previous section and elevated; the padding
  // wrapper drops its top padding so the overlap distance is the
  // negative margin alone (predictable across PaddingY picks). The
  // section root itself stays in flow — nothing couples to whatever
  // section renders above.
  const overlapClassName = SECTION_OVERLAP_TOP_CLASSES[overlapTop];
  const hasOverlap = overlapClassName !== "";
  return (
    <ListingSectionRoot
      slot={slot}
      entityName={entityName}
      id={id}
      className={className}
      surfaceClassName={
        // A floating card row must not paint a section band of its own
        // over the hero — an overlapping section keeps a transparent
        // surface unless the author explicitly picked a scheme.
        hasOverlap && surfaceClassName == null && colorScheme === "default"
          ? ""
          : resolvedSurfaceClassName
      }
    >
      {beforeContainer}
      <div
        className={cn(
          fullBleed ? "w-full" : "container mx-auto px-4",
          paddingClassName,
          hasOverlap && "pt-0",
        )}
      >
        <div
          className={
            fullBleed
              ? cn("w-full px-4", overlapClassName)
              : cn(
                  "@container mx-auto w-full",
                  maxWidthClassName,
                  overlapClassName,
                )
          }
        >
          {children}
        </div>
      </div>
    </ListingSectionRoot>
  );
}
