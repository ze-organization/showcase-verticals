import { TypographyH2 } from "@/components/registry/primitives/core/typography";
import {
  Image,
  type ImageSource,
} from "@/components/registry/primitives/editables/image";
import {
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  type SurfaceTone,
  surfaceToneClass,
} from "@/lib/registry/color-scheme-classes";
import {
  SECTION_PADDING_Y_CLASSES,
  type SectionPaddingY,
} from "@/lib/registry/section-surface";
import type { CmsProps } from "@/lib/registry/sitecore";
import type { WildcardLinkedItem } from "@/lib/registry/wildcard/normalize";

/**
 * `LinkedItemsRail` — renders a list of *resolved reference items* as
 * linked cards: the "Prepared with" / "Related cocktails" /
 * "You may also like" cross-link band on detail pages.
 *
 * The `items` prop is a `WildcardLinkedItem[]` and is designed to be
 * **delivered through `WildcardBindings`**: place this rendering
 * inside `wildcard-experience@1` and bind
 * `{"items":"FeaturedProducts"}` (or whatever the resolved content
 * model names its reference field) — the `withSitecore` seam
 * normalizes the resolved reference field into `WildcardLinkedItem[]`
 * and overlays it here. The datasource carries only the authored
 * heading + intro.
 *
 * Each card probes the linked item's conventional field names —
 * Title (falling back to displayName/name), Image, and
 * Tagline/Summary/Description — omitting whatever is missing, and
 * links to the item's resolved `url` when the reference carried one.
 *
 * With no items (no wildcard provider, unresolved slug, no binding)
 * the live page renders just the authored heading/intro — or nothing
 * at all when those are empty too. The editing canvas / preview shows
 * a labeled placeholder card row instead so authors can see and
 * position the band.
 *
 * Rendering variants (separate exports, never a discriminator prop):
 *
 *   - `Rail` — horizontal scroll strip (snap-aligned).
 *   - `Grid` — responsive 1/2/3-column grid.
 */
export interface LinkedItemsRailProps extends CmsProps {
  /** Authored section heading (e.g. "Prepared with"). */
  title?: TextSource;
  /** Optional authored intro line under the heading. */
  intro?: TextSource;
  /**
   * Resolved reference items — normalized `WildcardLinkedItem[]`,
   * typically overlaid via a `WildcardBindings` rendering param
   * (`{"items":"<ReferenceFieldName>"}`) inside `wildcard-experience@1`.
   */
  items?: WildcardLinkedItem[];
  /** Section surface tone — shared `color-scheme@1` vocabulary. */
  surfaceTone?: SurfaceTone;
  /** Section vertical padding — shared `padding-y@1` vocabulary. */
  paddingY?: SectionPaddingY;
}

type LinkedItemsRailLayout = "rail" | "grid";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === "object" && !Array.isArray(value);

/** Read a linked item's field as a `TextSource` (string or `{value}`). */
const textOf = (
  fields: WildcardLinkedItem["fields"],
  name: string,
): TextSource | undefined => {
  const raw = fields[name];
  if (typeof raw === "string") return raw;
  if (isRecord(raw) && typeof raw.value === "string") return raw as TextSource;
  return undefined;
};

/** Read a linked item's field as an `ImageSource` (`{value:{src}}`). */
const imageOf = (
  fields: WildcardLinkedItem["fields"],
  name: string,
): ImageSource | undefined => {
  const raw = fields[name];
  if (!isRecord(raw)) return undefined;
  const value = raw.value;
  if (isRecord(value) && typeof value.src === "string" && value.src) {
    return raw as ImageSource;
  }
  if (typeof raw.src === "string" && raw.src) return raw as ImageSource;
  return undefined;
};

const hasText = (source: TextSource | undefined): boolean =>
  source != null && !isEmptySource(source) && Boolean(getSourceText(source));

/**
 * One linked-item card — conventional field probing with graceful
 * omission (missing image → text-only card; missing summary → title
 * only), linking to the item's resolved route when present.
 */
function LinkedItemCard({ item }: { item: WildcardLinkedItem }) {
  const title =
    getSourceText(textOf(item.fields, "Title")) ??
    item.displayName ??
    item.name ??
    "";
  const summary =
    getSourceText(textOf(item.fields, "Tagline")) ??
    getSourceText(textOf(item.fields, "Summary")) ??
    getSourceText(textOf(item.fields, "Description"));
  const image = imageOf(item.fields, "Image");
  const card = (
    <div
      className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition-colors hover:bg-muted"
      data-slot="linked-items-rail-card"
    >
      {image ? (
        <div className="aspect-[3/2] w-full overflow-hidden bg-muted">
          <Image value={image} alt={title} className="size-full object-cover" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="font-medium text-foreground">{title}</span>
        {summary ? (
          <span className="text-muted-foreground text-sm">{summary}</span>
        ) : null}
      </div>
    </div>
  );
  return item.url ? (
    <a href={item.url} className="block h-full">
      {card}
    </a>
  ) : (
    <div className="h-full">{card}</div>
  );
}

/**
 * Editing-canvas stand-in row: with no resolved items yet (no
 * SourceRoot, no binding, unresolved slug) authors still need to see
 * and position the band, so render labeled dashed placeholder cards —
 * mirrors how wildcard-experience surfaces its editing-mode hint.
 */
function PlaceholderCards() {
  return (
    <>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="flex h-full min-h-28 flex-col items-center justify-center gap-1 rounded-lg border border-border border-dashed bg-muted/40 p-4 text-center"
          data-slot="linked-items-rail-placeholder"
        >
          <span className="font-medium text-muted-foreground text-sm">
            Linked item {n}
          </span>
          <span className="text-muted-foreground text-xs">
            Bind items via WildcardBindings
          </span>
        </div>
      ))}
    </>
  );
}

function LinkedItemsRailBase(
  props: LinkedItemsRailProps & { layout: LinkedItemsRailLayout },
) {
  const {
    layout,
    title,
    intro,
    items,
    surfaceTone = "none",
    paddingY = "auto",
    styles,
    id,
    isEditing,
  } = props;

  const resolvedItems = items ?? [];
  const showPlaceholders = resolvedItems.length === 0 && Boolean(isEditing);
  const hasHeading = hasText(title) || hasText(intro);

  // Live page, nothing to show: just the authored heading — or nothing
  // at all when even that is empty. No dead chrome.
  if (resolvedItems.length === 0 && !showPlaceholders && !hasHeading) {
    return null;
  }

  const cards = showPlaceholders ? (
    <PlaceholderCards />
  ) : (
    resolvedItems.map((item, index) => (
      <LinkedItemCard
        key={item.id ?? item.name ?? `linked-${index}`}
        item={item}
      />
    ))
  );

  return (
    <section
      className={cn(
        "component linked-items-rail w-full",
        paddingY === "auto"
          ? "py-10 md:py-14"
          : SECTION_PADDING_Y_CLASSES[paddingY],
        surfaceToneClass(surfaceTone),
        styles?.trimEnd(),
      )}
      id={id}
      data-slot="linked-items-rail"
    >
      <div className="container mx-auto flex flex-col gap-6 px-4">
        {hasHeading || isEditing ? (
          <div className="flex flex-col gap-2">
            <TypographyH2 className="font-heading text-2xl tracking-tight md:text-3xl">
              <Text
                value={title}
                tag="span"
                placeholder="Title"
                isEditing={isEditing}
              />
            </TypographyH2>
            {hasText(intro) || isEditing ? (
              <p className="max-w-prose text-muted-foreground">
                <Text
                  value={intro}
                  tag="span"
                  placeholder="Intro"
                  isEditing={isEditing}
                />
              </p>
            ) : null}
          </div>
        ) : null}
        {resolvedItems.length > 0 || showPlaceholders ? (
          layout === "rail" ? (
            <div
              className="grid snap-x snap-mandatory auto-cols-[minmax(240px,280px)] grid-flow-col gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]"
              data-slot="linked-items-rail-track"
            >
              {cards}
            </div>
          ) : (
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              data-slot="linked-items-rail-grid"
            >
              {cards}
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}

/* ─────────────────── rendering variants ─────────────────── */

/** Horizontal snap-scroll strip of linked-item cards. */
export function Rail(props: LinkedItemsRailProps) {
  return <LinkedItemsRailBase {...props} layout="rail" />;
}

/** Responsive 1/2/3-column grid of linked-item cards. */
export function Grid(props: LinkedItemsRailProps) {
  return <LinkedItemsRailBase {...props} layout="grid" />;
}

export default Rail;

// Sitecore-aware multi-export components MUST declare this so the SDK
// lists them in BOTH server and client component maps (Pages chrome
// resolves named-export variants client-side).
export const componentType = "universal";
