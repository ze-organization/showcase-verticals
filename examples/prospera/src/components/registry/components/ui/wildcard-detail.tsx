"use client";

import { Badge } from "@/components/registry/primitives/core/badge";
import { Chip } from "@/components/registry/primitives/core/chip";
import {
  Image,
  type ImageSource,
} from "@/components/registry/primitives/editables/image";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import {
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";
import {
  normalizeReferenceField,
  type WildcardFieldMap,
  type WildcardLinkedItem,
} from "@/lib/registry/wildcard/normalize";
import { useWildcardItem } from "@/lib/registry/wildcard/use-wildcard-item";

/**
 * `WildcardDetail` — the generic detail rendering for Sitecore
 * *wildcard pages* (a page item literally named `*`). One wildcard
 * page carries this design for a whole family of URLs; the content is
 * resolved per-request from the URL's last segment against the
 * `SourceRoot` data folder configured on the datasource (see
 * `useWildcardItem` in `src/lib/registry/wildcard/`).
 *
 * Data flow — two sources, one precedence rule:
 *
 *   1. Runtime-resolved fields (Edge, via the wildcard resolver) WIN
 *      whenever a slug resolves to a content item.
 *   2. Authored datasource fields (Title / Subtitle / Body / Image)
 *      are the fallback — showcase preview, editing mode, environments
 *      without Edge, or an unresolvable slug.
 *
 * Rendering variants (one export per layout, never a discriminator
 * prop):
 *
 *   - `Default`    — generic detail: title, subtitle, image, rich
 *                    body, plus a definition list of any remaining
 *                    resolved fields. Use when the target template is
 *                    unknown or heterogeneous.
 *   - `Product`    — title, tagline, category badge, image,
 *                    description + tasting notes, ABV/sizes meta row.
 *   - `Recipe`     — title, summary, image, meta chips (difficulty /
 *                    drink type / prep time / glass), ingredients +
 *                    steps two-column, related-product linked cards.
 *   - `Initiative` — title, attribution (person / location / region),
 *                    cause badge, story body, image, signature-recipe
 *                    linked card.
 *
 * The non-Default variants read *conventional field names* from the
 * resolved item (`Tagline`, `TastingNotes`, `Ingredients`,
 * `SignatureCocktail`, …). Content templates that follow those
 * conventions light up the richer layout; anything missing simply
 * doesn't render — no dead chrome.
 */
export interface WildcardDetailProps extends CmsProps {
  /**
   * Content-tree path of the data folder slugs resolve under. Comes
   * from the datasource's `SourceRoot` field. Empty → no runtime
   * resolution; authored fields render.
   */
  sourceRoot?: string;
  /** Item language for resolution. Defaults to `"en"`. */
  language?: string;
  /** Authored fallback headline. */
  title?: TextSource;
  /** Authored fallback subtitle / summary. */
  subtitle?: TextSource;
  /** Authored fallback rich-text body. */
  body?: RichTextSource;
  /** Authored fallback image. */
  image?: ImageSource;
  /**
   * Pre-resolved wildcard field map. When provided (and non-empty) it
   * takes precedence over the client-side resolver and suppresses the
   * fetch entirely. Mirrors breadcrumb's injected `ancestors` prop:
   * the showcase preview uses it to demo the resolved layouts, and a
   * server-side fetcher could populate it without touching the hook.
   */
  resolvedFields?: WildcardFieldMap;
}

type WildcardDetailLayout = "default" | "product" | "recipe" | "initiative";

/* ─────────────────── resolved-field readers ─────────────────── */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === "object" && !Array.isArray(value);

/** Read a resolved field as a `TextSource` (string or `{ value }`). */
const textOf = (
  fields: WildcardFieldMap,
  name: string,
): TextSource | undefined => {
  const raw = fields[name];
  if (typeof raw === "string") return raw;
  if (isRecord(raw) && typeof raw.value === "string") {
    return raw as TextSource;
  }
  return undefined;
};

/** Read a resolved field as an `ImageSource` (`{ value: { src } }`). */
const imageOf = (
  fields: WildcardFieldMap,
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

/** Prefer a non-empty resolved/runtime source over the authored one. */
const preferSource = <T,>(resolved: T | undefined, authored: T | undefined) =>
  resolved != null && !isEmptySource(resolved as never) ? resolved : authored;

/** Split a multi-line text source into trimmed, non-empty lines. */
const readLines = (source: TextSource | undefined): string[] =>
  (getSourceText(source) ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

/** `PrepTimeMinutes` → `Prep Time Minutes` for definition-list labels. */
const labelize = (fieldName: string): string =>
  fieldName
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .trim();

/* ─────────────────── shared building blocks ─────────────────── */

function MetaChips({ entries }: { entries: (string | undefined)[] }) {
  const visible = entries.filter(
    (entry): entry is string => !!entry && entry.trim().length > 0,
  );
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((entry) => (
        <Chip key={entry} size="sm">
          {entry}
        </Chip>
      ))}
    </div>
  );
}

/**
 * One linked-item card — reads the referenced item's conventional
 * Title/Tagline/Summary/Image fields and links to the item's route
 * when the reference carried one.
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
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition-colors hover:bg-muted">
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
 * Linked cards for reference-field targets (related products, a
 * signature serve, …).
 */
function LinkedItemCards({
  items,
  heading,
}: {
  items: WildcardLinkedItem[];
  heading: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-semibold text-foreground text-xl">{heading}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <LinkedItemCard
            key={item.id ?? item.name ?? `linked-${index}`}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}

function DetailHeader({
  eyebrow,
  badge,
  title,
  subtitle,
  isEditing,
}: {
  eyebrow?: string;
  badge?: string;
  title?: TextSource;
  subtitle?: TextSource;
  isEditing?: boolean;
}) {
  return (
    <header className="flex flex-col gap-3">
      {(eyebrow || badge) && (
        <div className="flex flex-wrap items-center gap-2">
          {badge ? (
            <Badge colorScheme="primary" size="sm">
              {badge}
            </Badge>
          ) : null}
          {eyebrow ? (
            <span className="text-muted-foreground text-sm uppercase tracking-wide">
              {eyebrow}
            </span>
          ) : null}
        </div>
      )}
      <h1 className="font-bold text-4xl text-foreground tracking-tight">
        <Text
          value={title}
          tag="span"
          placeholder="Title"
          isEditing={isEditing}
        />
      </h1>
      {(subtitle != null && !isEmptySource(subtitle)) || isEditing ? (
        <p className="max-w-prose text-lg text-muted-foreground">
          <Text
            value={subtitle}
            tag="span"
            placeholder="Subtitle"
            isEditing={isEditing}
          />
        </p>
      ) : null}
    </header>
  );
}

function DetailImage({
  image,
  alt,
  isEditing,
}: {
  image?: ImageSource;
  alt: string;
  isEditing?: boolean;
}) {
  if (image == null && !isEditing) return null;
  return (
    <div className="overflow-hidden rounded-xl bg-muted">
      <Image
        value={image}
        alt={alt}
        placeholder="Image"
        isEditing={isEditing}
        className="w-full object-cover"
      />
    </div>
  );
}

/* ─────────────────────── layout bodies ─────────────────────── */

/** Field names each layout renders explicitly — everything else lands
 *  in the Default layout's definition list. */
const RENDERED_GENERIC_FIELDS = new Set([
  "SourceRoot",
  "Title",
  "Subtitle",
  "Summary",
  "Body",
  "Description",
  "Story",
  "Image",
]);

function GenericFieldList({ fields }: { fields: WildcardFieldMap }) {
  const entries = Object.entries(fields)
    .filter(([name]) => !RENDERED_GENERIC_FIELDS.has(name))
    .map(([name, value]) => {
      const text = getSourceText(
        typeof value === "string"
          ? value
          : isRecord(value) && typeof value.value === "string"
            ? (value as TextSource)
            : undefined,
      );
      return text ? ([name, text] as const) : null;
    })
    .filter((entry): entry is readonly [string, string] => entry !== null);

  if (entries.length === 0) return null;
  return (
    <section className="mt-10 rounded-lg border border-border bg-muted p-6">
      <h2 className="mb-4 font-semibold text-foreground text-lg">Details</h2>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {entries.map(([name, value]) => (
          <div key={name} className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground text-sm">{labelize(name)}</dt>
            <dd className="text-foreground text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TwoColumnLists({
  left,
  leftHeading,
  right,
  rightHeading,
  ordered,
}: {
  left: string[];
  leftHeading: string;
  right: string[];
  rightHeading: string;
  ordered?: boolean;
}) {
  if (left.length === 0 && right.length === 0) return null;
  const RightList = ordered ? "ol" : "ul";
  return (
    <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_2fr]">
      {left.length > 0 ? (
        <div>
          <h2 className="mb-3 font-semibold text-foreground text-xl">
            {leftHeading}
          </h2>
          <ul className="space-y-1.5 text-foreground text-sm">
            {left.map((entry) => (
              <li key={entry} className="flex gap-2">
                <span aria-hidden className="text-primary">
                  •
                </span>
                {entry}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {right.length > 0 ? (
        <div>
          <h2 className="mb-3 font-semibold text-foreground text-xl">
            {rightHeading}
          </h2>
          <RightList className="list-inside list-decimal space-y-2 text-foreground text-sm marker:text-primary">
            {right.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </RightList>
        </div>
      ) : null}
    </section>
  );
}

/* ────────────── variant-specific sections (conventional field names) ────────────── */

/** Difficulty / drink type / prep time / glass meta chips (Recipe). */
function RecipeChips({ fields }: { fields: WildcardFieldMap }) {
  const prepTime = getSourceText(textOf(fields, "PrepTimeMinutes"));
  return (
    <MetaChips
      entries={[
        getSourceText(textOf(fields, "Difficulty")),
        getSourceText(textOf(fields, "DrinkType")),
        prepTime ? `${prepTime} min` : undefined,
        getSourceText(textOf(fields, "GlassType")),
      ]}
    />
  );
}

/** Tasting notes + ABV/sizes meta row (Product). */
function ProductDetails({ fields }: { fields: WildcardFieldMap }) {
  const tastingNotes = textOf(fields, "TastingNotes");
  const abv = getSourceText(textOf(fields, "Abv"));
  const sizes = getSourceText(textOf(fields, "Sizes"));
  return (
    <>
      {tastingNotes ? (
        <div>
          <h2 className="mb-2 font-semibold text-foreground text-xl">
            Tasting notes
          </h2>
          <p className="max-w-prose text-foreground text-sm">
            <Text value={tastingNotes} tag="span" />
          </p>
        </div>
      ) : null}
      <MetaChips entries={[abv ? `ABV ${abv}` : undefined, sizes]} />
    </>
  );
}

/** Ingredients + steps columns and related-product cards (Recipe). */
function RecipeSections({ fields }: { fields: WildcardFieldMap }) {
  return (
    <>
      <TwoColumnLists
        left={readLines(textOf(fields, "Ingredients"))}
        leftHeading="Ingredients"
        right={readLines(textOf(fields, "Steps"))}
        rightHeading="Steps"
        ordered
      />
      <LinkedItemCards
        items={normalizeReferenceField(fields.FeaturedProducts)}
        heading="Featured products"
      />
    </>
  );
}

/** Signature-item linked card (Initiative). */
function InitiativeSections({ fields }: { fields: WildcardFieldMap }) {
  return (
    <LinkedItemCards
      items={normalizeReferenceField(
        fields.SignatureItem ?? fields.SignatureCocktail,
      )}
      heading="Signature serve"
    />
  );
}

interface HeaderMeta {
  badge?: string;
  eyebrow?: string;
  /** Layout-specific subtitle override (e.g. Product's Tagline). */
  subtitle?: TextSource;
}

/** Per-layout badge / eyebrow / subtitle reads from the resolved fields. */
function headerMetaFor(
  layout: WildcardDetailLayout,
  fields: WildcardFieldMap,
): HeaderMeta {
  if (layout === "product") {
    return {
      badge: getSourceText(textOf(fields, "Category")),
      subtitle: textOf(fields, "Tagline"),
    };
  }
  if (layout === "initiative") {
    const attribution = [
      getSourceText(
        textOf(fields, "PersonName") ?? textOf(fields, "BartenderName"),
      ),
      getSourceText(textOf(fields, "Location")),
      getSourceText(textOf(fields, "Region")),
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      badge: getSourceText(textOf(fields, "Cause")),
      eyebrow: attribution || undefined,
    };
  }
  return {};
}

/* ───────────────────────── base ───────────────────────── */

/** True when any authored fallback field carries renderable content. */
const hasAuthoredFallback = (props: WildcardDetailProps): boolean =>
  [props.title, props.subtitle, props.body, props.image].some(
    (source) => source != null && !isEmptySource(source as never),
  );

/**
 * Merge the shared content surface: runtime-resolved fields win,
 * authored datasource props fall back. Subtitle/body accept the
 * conventional alternates (Summary; Story/Description) so templates
 * that name their prose differently still render.
 */
function mergeSharedContent(
  fields: WildcardFieldMap,
  props: WildcardDetailProps,
) {
  return {
    title: preferSource(textOf(fields, "Title"), props.title),
    subtitle: preferSource(
      textOf(fields, "Subtitle") ?? textOf(fields, "Summary"),
      props.subtitle,
    ),
    body: preferSource<RichTextSource>(
      textOf(fields, "Body") ??
        textOf(fields, "Story") ??
        textOf(fields, "Description"),
      props.body,
    ),
    image: preferSource(imageOf(fields, "Image"), props.image),
  };
}

function WildcardDetailBase(
  props: WildcardDetailProps & { layout: WildcardDetailLayout },
) {
  const { layout, sourceRoot, language, styles, id, isEditing } = props;
  const hasInjectedFields =
    props.resolvedFields != null &&
    Object.keys(props.resolvedFields).length > 0;
  // Injected fields suppress the client-side fetch (preview / SSR path).
  const hookState = useWildcardItem({
    sourceRoot: hasInjectedFields ? undefined : sourceRoot,
    language,
  });
  const fields: WildcardFieldMap = hasInjectedFields
    ? (props.resolvedFields as WildcardFieldMap)
    : hookState.fields;
  const isResolved = hasInjectedFields || hookState.status === "resolved";

  // Runtime-resolved fields win; authored datasource fields fall back.
  const { title, subtitle, body, image } = mergeSharedContent(fields, props);
  const titleText = getSourceText(title) ?? "";

  const isEmpty = !isResolved && !hasAuthoredFallback(props);
  if (isEmpty) {
    if (!isEditing) return null;
    return (
      <div
        className={cn("component wildcard-detail", styles?.trimEnd())}
        id={id}
      >
        <span className="is-empty-hint">
          Wildcard detail — set a Source Root or author fallback content
        </span>
      </div>
    );
  }

  const header = headerMetaFor(layout, fields);
  const showBody = (body != null && !isEmptySource(body as never)) || isEditing;

  return (
    <article
      className={cn(
        "component wildcard-detail container mx-auto w-full px-4 py-8 lg:py-12",
        styles?.trimEnd(),
      )}
      id={id}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <DetailHeader
            eyebrow={header.eyebrow}
            badge={header.badge}
            title={title}
            subtitle={header.subtitle ?? subtitle}
            isEditing={isEditing}
          />

          {layout === "recipe" ? <RecipeChips fields={fields} /> : null}

          {showBody ? (
            <RichText value={body} placeholder="Body" isEditing={isEditing} />
          ) : null}

          {layout === "product" ? <ProductDetails fields={fields} /> : null}
        </div>

        <DetailImage image={image} alt={titleText} isEditing={isEditing} />
      </div>

      {layout === "recipe" ? <RecipeSections fields={fields} /> : null}

      {layout === "initiative" ? <InitiativeSections fields={fields} /> : null}

      {layout === "default" && isResolved ? (
        <GenericFieldList fields={fields} />
      ) : null}
    </article>
  );
}

/* ─────────────────── rendering variants ─────────────────── */

/** Generic detail — unknown/heterogeneous target templates. */
export function Default(props: WildcardDetailProps) {
  return <WildcardDetailBase {...props} layout="default" />;
}

/** Product detail — tagline, category badge, tasting notes, ABV/sizes. */
export function Product(props: WildcardDetailProps) {
  return <WildcardDetailBase {...props} layout="product" />;
}

/** Recipe detail — meta chips, ingredients + steps, related products. */
export function Recipe(props: WildcardDetailProps) {
  return <WildcardDetailBase {...props} layout="recipe" />;
}

/** Initiative detail — attribution, cause badge, story, signature card. */
export function Initiative(props: WildcardDetailProps) {
  return <WildcardDetailBase {...props} layout="initiative" />;
}

export default Default;

// Sitecore-aware multi-export components MUST declare this so the SDK
// lists them in BOTH server and client component maps (Pages chrome
// resolves named-export variants client-side).
export const componentType = "universal";
