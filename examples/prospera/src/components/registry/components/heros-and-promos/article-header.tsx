"use client";

// Self-register CDP events into the runtime catalog so analytics knows
// about every event this recipe can fire.
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import articleHeaderRecipe from "@/recipes/article-header.recipe";

registerCdpRecipe(articleHeaderRecipe);

import type React from "react";
import { useId } from "react";
import { Eyebrow } from "@/components/registry/blocks/eyebrow";
import { AnimatedSection } from "@/components/registry/primitives/animations/animated-section";
import { TypographyH1 } from "@/components/registry/primitives/core/typography";
import {
  type ImageSource,
  NextImage,
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
import { useSectionAnalytics } from "@/lib/registry/analytics/use-section-analytics";
import { type SurfaceTone } from "@/lib/registry/color-scheme-classes";
import { cn } from "@/lib/registry/cn";
import {
  detailsMediaBoxClass,
  detailsMediaFitClass,
  detailsPaddingYClass,
  detailsProseClass,
  detailsSurfaceClass,
  detailsTitleClass,
  parseSectionMaxWidth,
  type DetailsShellParams,
} from "@/lib/registry/details-shell";
import {
  getLinkedItemUrl,
  type LinkedEntry,
  type LinkedItemUrl,
  linkedFields,
} from "@/lib/registry/linked-items";
import { isEnabled, parseAlignment } from "@/lib/registry/param-parsers";
import { SECTION_MAX_WIDTH_CLASSES } from "@/lib/registry/section-surface";
import { asArray } from "@/lib/registry/placeholder-children";
import type { CmsProps } from "@/lib/registry/sitecore";
import { Placeholder } from "@/lib/registry/sitecore";
import { useReducedMotion } from "@/lib/registry/use-reduced-motion";

/**
 * One logo entry for the optional "As featured in:" logo strip. Kept
 * loose so authors can later wire a Treelist of logo items via a
 * future `logo-item@1` recipe — for now the strip stays hidden until
 * `logos` is non-empty.
 */
export interface ArticleHeaderLogo {
  Image?: ImageSource;
}

/**
 * Flattened `author@1` linked-item. The component-map codegen detects
 * the recipe's `Authors` Treelist field (`shape: "reference"` +
 * `multiple: true`) and emits `defaultOptions: { flattenLinkedItems:
 * ["Authors"] }` into the component-map entry. The HOC then hoists
 * each item's `fields` onto the item itself, so the field names stay
 * PascalCase (the Sitecore convention) on each entry — they aren't
 * re-cased the way top-level props are.
 *
 * Installed starters whose regenerated component map LACKS
 * `flattenLinkedItems` deliver the raw `{ id, name, url?, fields }`
 * envelope instead — the byline normalizes every entry through
 * `linkedFields()` so both shapes render identically.
 */
export interface ArticleHeaderAuthor {
  id?: string;
  name?: string;
  /**
   * Page URL the layout service resolves when the Treelist entry
   * references a PAGE item (an author profile page). Content-pool
   * author items carry no url — the byline renders unlinked then.
   */
  url?: LinkedItemUrl;
  AuthorName?: TextSource;
  JobTitle?: TextSource;
  Pronouns?: TextSource;
  About?: TextSource;
  Avatar?: ImageSource;
  Email?: TextSource;
  Website?: TextSource;
  Twitter?: TextSource;
  LinkedIn?: TextSource;
}

/**
 * The header's surface values mirror the shared `color-scheme@1` set
 * so the article header stays consistent with every other component
 * that exposes a ColorScheme param. `none` is the "inherit" sentinel —
 * it leaves the surface on the page background (the default; most
 * article pages already have a wrapping container with its own
 * background). Kept as an exported alias for existing importers.
 */
export type ArticleHeaderSurfaceTone = SurfaceTone;

export type ArticleHeaderAuthorStyle =
  | "name-only"
  | "avatar-and-name"
  | "avatar-only";

/**
 * Flat props the SDK's `withSitecore` default convention produces from
 * the layout-service envelope. Every field comes through as a
 * camelCased prop (e.g. `fields.Title` → `title`), every param
 * likewise (`params.HeadingSize` → `headingSize`). Matches the rest
 * of the registry — accordion-block, form-builder, content-block all
 * read the same shape.
 */
export interface ArticleHeaderProps extends CmsProps {
  // ---- Fields ---------------------------------------------------------
  /**
   * Optional small uppercase line above the title (e.g. 'CASE STUDY',
   * 'INSIGHTS'). Mirrors the editorial hero treatment.
   */
  eyebrow?: TextSource;
  title?: TextSource;
  subtitle?: RichTextSource | TextSource;
  image?: ImageSource;
  /**
   * Publication date display string. Free text so authors can include
   * relative phrasing ("Today", "2 hours ago"). The component prepends
   * a "Published" label automatically.
   */
  created?: TextSource;
  /**
   * Optional last-updated date string. The component prepends an
   * "Updated" label automatically and only renders the row when
   * non-empty.
   */
  updated?: TextSource;
  /**
   * Linked Author items (author@1). Usually flattened by the Treelist
   * hoister, but raw `{ id, name, url?, fields }` envelopes (installed
   * starters without `flattenLinkedItems`) are normalized per entry —
   * see {@link ArticleHeaderAuthor}.
   */
  authors?: LinkedEntry<ArticleHeaderAuthor>[];
  /**
   * Optional Treelist of logo items rendered below the article meta.
   * Recipe doesn't currently surface this field — present in the prop
   * shape so a future iteration (or a showcase preview) can populate
   * the strip.
   */
  logos?: ArticleHeaderLogo[];
  // ---- Params ---------------------------------------------------------
  /** Constrain the content to a prose-width column. Mirrors accordion-block. */
  useSectionWrapper?: string | boolean;
  /** Inline-axis alignment of the content (start / center / end). */
  alignment?: string;
  /**
   * Where the lead image renders relative to the heading region.
   * `above` (default) — image above the title (editorial conventional).
   * `below` — image after the title / subtitle / byline / logo (Hero
   * Editorial / Centered shape). `hidden` — suppress the image even
   * when the field is populated.
   */
  imagePosition?: string;
  /** Heading entrance animation. */
  headingAnimation?: string;
  /** Heading size token. */
  headingSize?: string;
  /**
   * Background tone + foreground text color (`color-scheme@1`).
   * `none` (the inherit sentinel) keeps the page surface.
   */
  colorScheme?: string;
  /** Saturation of ColorScheme. No-op while ColorScheme is `none`. */
  backgroundIntensity?: string;
  /** Vertical padding of the header band. `auto` keeps the natural spacing. */
  paddingY?: string;
  /**
   * Content width cap. When set, wins over UseSectionWrapper. Unset
   * keeps the boolean prose column.
   */
  maxWidth?: string;
  /** Title font weight. `default` reads the theme `--heading-weight` token. */
  titleWeight?: string;
  /** Title text color override. */
  headingColor?: string;
  /**
   * Brand color of the eyebrow above the title. `none` (default) inherits
   * the surface foreground at reduced opacity; any other color-scheme@1
   * value tints the eyebrow with that role color.
   */
  eyebrowColorScheme?: string;
  /**
   * Visual treatment for the eyebrow. `text` (default) renders the
   * eyebrow as small uppercase prose; `badge` renders it as a
   * pill-shaped chip tinted with `EyebrowColorScheme`.
   */
  eyebrowStyle?: string;
  /** Eyebrow text size. */
  eyebrowSize?: string;
  /** Subtitle / dek text size. */
  proseSize?: string;
  /** Subtitle / dek line-height. */
  proseLeading?: string;
  /** Lead-image aspect. `auto` keeps 16:9. */
  mediaAspect?: string;
  /** Lead-image framing. */
  mediaShape?: string;
  /** How the lead image fills its box. */
  mediaFit?: string;
  /** Render a horizontal rule between the heading and byline / meta row. */
  showSeparator?: string | boolean;
  /** How linked Authors render in the byline. */
  authorStyle?: string;
  /** Stable handle for analytics. Defaults to title or rendering id. */
  instanceKey?: string;
  /** `page` (default) or `site` partition for personalization history. */
  instanceScope?: string;
  /** Emit CDP `view` event when the header becomes ≥50% visible. */
  trackEvents?: string | boolean;
}

interface ArticleHeaderAnalyticsMeta {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  variant?: string;
}

// `isEnabled` + `parseAlignment` now come from the shared
// `@/lib/registry/param-parsers` module — see imports above.

/**
 * View-tracking hook. Fires the `view` event the first time the
 * header crosses the 50% visibility threshold. Skipped in editing
 * mode and when `trackEvents` is off — Sitecore drives the truthy
 * initial state via Standard Values, so no `= true` default here.
 */
function useArticleHeaderView({
  id,
  instanceKey,
  instanceScope,
  variant,
  title,
  trackEvents,
  isEditing,
}: {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  variant: string;
  title?: TextSource;
  trackEvents?: string | boolean;
  isEditing?: boolean;
}) {
  const { rootRef } = useSectionAnalytics<ArticleHeaderAnalyticsMeta>({
    family: "article-header",
    variant,
    id,
    instanceKey,
    instanceScope: instanceScope ?? "site",
    titleSource: title,
    eventsEnabled: isEnabled(trackEvents),
    isEditing: Boolean(isEditing),
    // view fires through the SDK pageView() via useSectionAnalytics.
  });
  return rootRef;
}

// ─── Surface scheme ───────────────────────────────────────────────────
//
// ColorScheme + BackgroundIntensity resolve through the shared
// `section-surface` maps so article-header and page-details share one
// surface vocabulary. `none` (the inherit sentinel) keeps the page
// background.

const AUTHOR_STYLE_VALUES: ReadonlySet<ArticleHeaderAuthorStyle> = new Set([
  "name-only",
  "avatar-and-name",
  "avatar-only",
]);

const parseAuthorStyle = (
  value: string | undefined,
): ArticleHeaderAuthorStyle => {
  const normalized = value?.trim().toLowerCase();
  return normalized &&
    AUTHOR_STYLE_VALUES.has(normalized as ArticleHeaderAuthorStyle)
    ? (normalized as ArticleHeaderAuthorStyle)
    : "avatar-and-name";
};

// Eyebrow lives in the shared `<Eyebrow>` block — see
// blocks/eyebrow.tsx. Article header just renders the block and lets
// it own the text / badge / color-scheme mapping.

const authorDisplayName = (author: ArticleHeaderAuthor): string => {
  const fromAuthorName = getSourceText(author.AuthorName);
  if (fromAuthorName) return fromAuthorName;
  return author.name?.trim() ?? "";
};

const authorKey = (author: ArticleHeaderAuthor, index: number): string =>
  author.id ?? (authorDisplayName(author) || `author-${index}`);

// ─── Byline ───────────────────────────────────────────────────────────
//
// Renders the linked Authors and the Created / Updated date strings.
// "Published" / "Updated" labels are baked into the component (no
// per-instance Sitecore field) so they can be replaced with
// dictionary values in a follow-up without touching every datasource.
// In editing mode the row stays visible even when fields are blank so
// authors can click into the Created stub.
function ArticleByline({
  created,
  updated,
  authors,
  authorStyle,
  align,
  isEditing,
}: {
  created?: TextSource;
  updated?: TextSource;
  authors: ArticleHeaderAuthor[];
  authorStyle: ArticleHeaderAuthorStyle;
  align: "start" | "center" | "end";
  isEditing?: boolean;
}) {
  const hasCreated = created != null && !isEmptySource(created);
  const hasUpdated = updated != null && !isEmptySource(updated);
  const hasAuthors = authors.length > 0;
  if (!hasCreated && !hasUpdated && !hasAuthors && !isEditing) return null;

  const showAvatar = authorStyle !== "name-only";
  const showName = authorStyle !== "avatar-only";

  return (
    <div
      className={cn(
        "mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-sm md:mt-8",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
      )}
      data-slot="article-header-byline"
    >
      {hasAuthors && (
        <ul
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-2",
            align === "center" && "justify-center",
            align === "end" && "justify-end",
          )}
          data-slot="article-header-authors"
        >
          {authors.map((author, index) => {
            const name = authorDisplayName(author);
            const hasAvatar = author.Avatar && !isEmptySource(author.Avatar);
            // Treelist entries that reference an author PAGE item carry
            // the page's resolved URL in the envelope — link the byline
            // entry to it. Content-pool author items have no url, so
            // the entry renders unlinked (no dead anchors).
            const href = getLinkedItemUrl(author.url);
            const authorContent = (
              <>
                {showAvatar && hasAvatar && (
                  // Corner shape is a THEME primitive (mirrors
                  // avatar-block): fully round by default, themes
                  // override `--avatar-radius` for square / soft-square.
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-[var(--avatar-radius,9999px)] bg-current/10">
                    <NextImage
                      value={author.Avatar}
                      alt={authorStyle === "avatar-only" ? "" : name}
                      className="object-cover"
                      fill
                      sizes="32px"
                      isEditing={isEditing}
                      placeholder="Avatar"
                    />
                  </div>
                )}
                {showName && name && (
                  <span className="wrap-break-word font-medium">{name}</span>
                )}
                {/* avatar-only: visually-hidden name kept for a11y */}
                {!showName && name && <span className="sr-only">{name}</span>}
              </>
            );
            return (
              <li
                key={authorKey(author, index)}
                className="flex min-w-0 items-center"
                data-slot="article-header-author"
              >
                {href ? (
                  <a
                    href={href}
                    className="flex min-w-0 items-center gap-2 underline-offset-4 hover:underline"
                    data-slot="article-header-author-link"
                  >
                    {authorContent}
                  </a>
                ) : (
                  <span className="flex min-w-0 items-center gap-2">
                    {authorContent}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {(hasCreated || hasUpdated || isEditing) && (
        <dl
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1"
          data-slot="article-header-dates"
        >
          {(hasCreated || isEditing) && (
            <div
              data-slot="article-header-created"
              className="inline-flex items-baseline gap-1"
            >
              {/* "Published" / "Updated" labels are static today; will
                  move to a Sitecore dictionary value in a follow-up so
                  they localise with the rest of the site chrome. */}
              <dt className="text-muted-foreground">Published</dt>
              <dd>
                <Text
                  value={created}
                  tag="span"
                  placeholder="Date"
                  isEditing={isEditing}
                />
              </dd>
            </div>
          )}
          {(hasUpdated || isEditing) && (
            <div
              data-slot="article-header-updated"
              className="inline-flex items-baseline gap-1"
            >
              <dt className="text-muted-foreground">Updated</dt>
              <dd>
                <Text
                  value={updated}
                  tag="span"
                  placeholder="Updated date"
                  isEditing={isEditing}
                />
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}

/** Stable key for a logo entry — prefer image src, fall back to alt. */
function logoKey(logo: ArticleHeaderLogo, index: number): string {
  const img = logo.Image as
    | { src?: string; alt?: string; value?: { src?: string; alt?: string } }
    | undefined;
  return (
    img?.src ??
    img?.value?.src ??
    img?.alt ??
    img?.value?.alt ??
    `logo-${index}`
  );
}

/**
 * Optional caption + horizontal logo row rendered below the article
 * meta. The "As featured in:" pattern. Renders nothing when `logos`
 * is empty — INCLUDING in editing mode, so Pages never shows a caption
 * stub the author could not publish anything into. The caption only
 * appears above a non-empty strip.
 */
function LogoStrip({
  logos,
  align,
  isEditing,
}: {
  logos: ArticleHeaderLogo[];
  align: "start" | "center" | "end";
  isEditing?: boolean;
}) {
  if (logos.length === 0) return null;
  return (
    <div
      className={cn(
        "mt-8 flex max-w-prose flex-col gap-4",
        align === "center" && "items-center text-center",
      )}
      data-slot="article-header-logo-strip"
    >
      {logos.length > 0 && (
        <div
          className={cn(
            // Tighter inline gap on mobile so 2–3 logos fit on one row
            // at 375px (each logo is 96px wide); widen back to gap-x-8
            // at ≥md once there's headroom.
            "flex flex-wrap items-center gap-x-5 gap-y-4 md:gap-x-8",
            align === "center" && "justify-center",
          )}
        >
          {logos.map((logo, index) => {
            const img = logo.Image as
              | {
                  alt?: string;
                  value?: { alt?: string };
                }
              | undefined;
            const brandName = img?.alt ?? img?.value?.alt ?? "";
            return (
              <div key={logoKey(logo, index)} className="relative h-8 w-24">
                {logo.Image != null && (
                  <NextImage
                    value={logo.Image}
                    alt={brandName}
                    className="h-full w-full object-contain"
                    fill
                    sizes="96px"
                    isEditing={isEditing}
                    placeholder="Logo"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ArticleHeaderBodyProps extends ArticleHeaderProps {
  align: "start" | "center" | "end";
  variant: "Default" | "Placeholders";
  /**
   * Optional content rendered inside the inner column after the
   * byline / logo strip. Used by the `Placeholders` variant to surface
   * the `article-header-content-{*}` Sitecore slot without baking it
   * into the source-driven default.
   */
  children?: React.ReactNode;
}

/**
 * Shared body for the article-header variants. Owns the editables,
 * media slot, and meta row. Renders an H1 directly (the article
 * title IS the page H1, not an H2 — section-wrapper's auto-H2 was
 * semantically wrong for article surfaces).
 */
// `heading-animation@1` → AnimatedSection direction. Mirrors promo's
// mapping so authors get the same vocabulary across editorial heading
// surfaces.
function titleAnimationDirection(
  value: string | undefined,
): "start" | "end" | "up" {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "banner-end") return "start";
  if (normalized === "banner-center") return "up";
  return "end";
}
function isAnimationEnabled(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return Boolean(normalized && normalized !== "none");
}

function resolveImagePosition(
  value: string | undefined,
): "above" | "below" | "hidden" {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "below" || normalized === "hidden") return normalized;
  return "above";
}

/**
 * Lead image — `above` (default) sits above the heading region with
 * bottom spacing; `below` flips it under the heading/byline/logo with
 * top spacing instead, mirroring the Hero Editorial / Centered shape.
 * NextImage's `placeholder` slot surfaces an EditPlaceholder stub when
 * the field is blank in editing mode so authors have a click target
 * instead of an empty band.
 */
function LeadImage({
  image,
  position,
  align,
  isEditing,
  shellParams,
  constrainProse,
}: {
  image: ImageSource | undefined;
  position: "above" | "below";
  align: "start" | "center" | "end";
  isEditing?: boolean;
  shellParams?: DetailsShellParams;
  constrainProse?: boolean;
}) {
  const imageSpacingClass =
    position === "below" ? "mt-8 md:mt-10" : "mb-8 md:mb-10";
  return (
    <div
      className={cn(
        "relative bg-current/10",
        detailsMediaBoxClass(shellParams, "16x9"),
        imageSpacingClass,
        constrainProse && align === "center" && "md:mx-auto md:max-w-2xl",
      )}
      data-slot="article-header-image"
    >
      <NextImage
        value={image}
        className={detailsMediaFitClass(shellParams)}
        fill
        sizes={
          align === "center"
            ? "(max-width: 768px) 100vw, 672px"
            : "(max-width: 768px) 100vw, 896px"
        }
        placeholder="Lead image"
        isEditing={isEditing}
      />
    </div>
  );
}

function ArticleHeaderSubtitle({
  subtitle,
  align,
  isEditing,
  show,
  shellParams,
}: {
  subtitle: RichTextSource | undefined;
  align: "start" | "center" | "end";
  isEditing?: boolean;
  show: boolean;
  shellParams?: DetailsShellParams;
}) {
  if (!show) return null;
  return (
    <div
      className={cn(
        "mt-3 opacity-90",
        detailsProseClass(shellParams),
        align === "center" && "mx-auto max-w-prose text-center",
        align === "end" && "ms-auto max-w-prose text-end",
      )}
      data-slot="article-header-subtitle"
    >
      <RichText value={subtitle} isEditing={isEditing} placeholder="Subtitle" />
    </div>
  );
}

function ArticleHeaderSeparator({
  align,
  show,
}: {
  align: "start" | "center" | "end";
  show: boolean;
}) {
  if (!show) return null;
  return (
    <hr
      className={cn(
        "my-6 border-0 border-current/20 border-t",
        align === "center" && "mx-auto w-24",
        align === "end" && "ms-auto w-24",
      )}
      data-slot="article-header-separator"
    />
  );
}

function ArticleHeaderHeading({
  title,
  titleId,
  titleClass,
  animationDirection,
  animationEnabled,
  reducedMotion,
  isEditing,
}: {
  title: TextSource | undefined;
  titleId: string;
  titleClass: string;
  animationDirection: ReturnType<typeof titleAnimationDirection>;
  animationEnabled: boolean;
  reducedMotion: boolean;
  isEditing?: boolean;
}) {
  return (
    <AnimatedSection
      direction={animationDirection}
      distanceInRem={12}
      delay={0}
      duration={1000}
      reducedMotion={reducedMotion || !animationEnabled}
    >
      <TypographyH1
        id={titleId}
        className={cn(
          "wrap-break-word text-balance border-0 pb-0 font-heading",
          titleClass,
        )}
      >
        <Text
          value={title}
          tag="span"
          placeholder="Title"
          isEditing={isEditing}
        />
      </TypographyH1>
    </AnimatedSection>
  );
}

function ArticleHeaderBody({
  eyebrow,
  title,
  subtitle,
  image,
  created,
  updated,
  authors,
  logos,
  useSectionWrapper,
  headingAnimation,
  headingSize,
  colorScheme,
  backgroundIntensity,
  paddingY,
  maxWidth,
  titleWeight,
  headingColor,
  eyebrowColorScheme,
  eyebrowStyle,
  eyebrowSize,
  proseSize,
  proseLeading,
  mediaAspect,
  mediaShape,
  mediaFit,
  imagePosition,
  showSeparator,
  authorStyle,
  instanceKey,
  instanceScope,
  trackEvents,
  id,
  styles,
  isEditing,
  align,
  variant,
  children,
}: ArticleHeaderBodyProps) {
  const rootRef = useArticleHeaderView({
    id,
    instanceKey,
    instanceScope: instanceScope === "page" ? "page" : "site",
    variant,
    title,
    trackEvents,
    isEditing,
  });

  const titleId = useId();
  const shellParams: DetailsShellParams = {
    ColorScheme: colorScheme,
    BackgroundIntensity: backgroundIntensity,
    PaddingY: paddingY,
    MaxWidth: maxWidth,
    HeadingSize: headingSize,
    TitleWeight: titleWeight,
    HeadingColor: headingColor,
    EyebrowSize: eyebrowSize,
    ProseSize: proseSize,
    ProseLeading: proseLeading,
    MediaAspect: mediaAspect,
    MediaShape: mediaShape,
    MediaFit: mediaFit,
  };
  const showRule = isEnabled(showSeparator);
  const containedColumn = isEnabled(useSectionWrapper);
  const explicitMaxWidth = maxWidth?.trim();
  const resolvedAuthorStyle = parseAuthorStyle(authorStyle);
  // Hoist raw `{ id, name, url?, fields }` linked-item envelopes so
  // installed starters without `flattenLinkedItems` render the same
  // byline as the flattened shape. Already-hoisted entries pass
  // through untouched.
  const authorList = asArray(authors)
    .map((entry) => linkedFields(entry))
    .filter((entry): entry is ArticleHeaderAuthor => entry != null);

  const hasImage = image != null && !isEmptySource(image);
  const resolvedImagePosition = resolveImagePosition(imagePosition);
  const showImage =
    resolvedImagePosition !== "hidden" && (hasImage || isEditing);

  const imageNode = showImage ? (
    <LeadImage
      image={image}
      position={resolvedImagePosition === "below" ? "below" : "above"}
      align={align}
      isEditing={isEditing}
      shellParams={shellParams}
      constrainProse={!explicitMaxWidth && containedColumn}
    />
  ) : null;

  const hasSubtitle = subtitle != null && !isEmptySource(subtitle);
  const animationEnabled = isAnimationEnabled(headingAnimation);
  const animationDirection = titleAnimationDirection(headingAnimation);
  const reducedMotion = useReducedMotion();
  const titleClass = detailsTitleClass(shellParams);

  // Inner column. When MaxWidth is set it wins over UseSectionWrapper.
  // Unset keeps the boolean prose-width column so existing pages stay
  // on `max-w-2xl`. Alignment stays text alignment (live content).
  const innerColumnClass = cn(
    "w-full",
    explicitMaxWidth
      ? cn(
          "mx-auto",
          SECTION_MAX_WIDTH_CLASSES[
            parseSectionMaxWidth(explicitMaxWidth, "standard")
          ],
        )
      : containedColumn && "mx-auto max-w-2xl",
    align === "center" && "text-center",
    align === "end" && "text-end",
    align === "start" && "text-start",
  );

  const headingNode = (
    <ArticleHeaderHeading
      title={title}
      titleId={titleId}
      titleClass={titleClass}
      animationDirection={animationDirection}
      animationEnabled={animationEnabled}
      reducedMotion={reducedMotion}
      isEditing={isEditing}
    />
  );

  const bodyContent = (
    <>
      {resolvedImagePosition === "above" && imageNode}
      <div className={innerColumnClass}>
        <Eyebrow
          value={eyebrow}
          colorScheme={eyebrowColorScheme}
          style={eyebrowStyle}
          size={eyebrowSize}
          align={align}
          isEditing={isEditing}
          className="mb-3 md:mb-4"
          placeholder="Eyebrow"
        />
        {headingNode}
        <ArticleHeaderSubtitle
          subtitle={subtitle}
          align={align}
          isEditing={isEditing}
          show={hasSubtitle || Boolean(isEditing)}
          shellParams={shellParams}
        />
        <ArticleHeaderSeparator align={align} show={showRule} />
        <ArticleByline
          created={created}
          updated={updated}
          authors={authorList}
          authorStyle={resolvedAuthorStyle}
          align={align}
          isEditing={isEditing}
        />
        <LogoStrip logos={logos ?? []} align={align} isEditing={isEditing} />
        {/*
         * `article-header-content-{*}` placeholder lives on the
         * dedicated `Placeholders` variant — that variant passes the
         * `<Placeholder>` node in as `children`. Default leaves it
         * empty so preview / Pages doesn't paint an unused drop zone.
         */}
        {children}
      </div>
      {resolvedImagePosition === "below" && imageNode}
    </>
  );

  return (
    <section
      ref={rootRef}
      className={cn(
        "component article-header w-full",
        detailsSurfaceClass(shellParams),
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      aria-labelledby={titleId}
      dir="inherit"
      data-slot="article-header"
      data-variant={variant}
    >
      <div
        className={cn(
          "container mx-auto px-4",
          detailsPaddingYClass(shellParams, "py-10 md:py-16"),
        )}
      >
        {bodyContent}
      </div>
    </section>
  );
}

/**
 * Article Header — Default variant. Editorial header with optional
 * lead image, H1 title, subtitle, date / author meta row, and an
 * optional "As featured in:" logo strip. Sits above article content,
 * below the site nav partial.
 *
 * Reads layout-service data via `withSitecore`'s default flat-props
 * convention — every field arrives as a camelCased prop (e.g.
 * `fields.Title` → `title`), every param likewise.
 */
export function Default(props: ArticleHeaderProps) {
  const align = parseAlignment(props.alignment);
  return <ArticleHeaderBody {...props} align={align} variant="Default" />;
}

/**
 * Article Header — Placeholders variant. Same shell as Default, but
 * with an `article-header-content-{*}` Sitecore placeholder rendered
 * below the heading region so authors can drop related-link strips,
 * key-takeaway grids, downloads, or any other rendering directly
 * underneath the article meta.
 *
 * Source-driven fields (title / subtitle / byline / etc.) still
 * render — the placeholder is additive, surfaced explicitly on its
 * own variant so the Default preview doesn't paint an empty drop
 * zone authors aren't using.
 */
export function Placeholders(props: ArticleHeaderProps) {
  const align = parseAlignment(props.alignment);
  return (
    <ArticleHeaderBody {...props} align={align} variant="Placeholders">
      {props.rendering ? (
        <Placeholder
          name="article-header-content-{*}"
          rendering={props.rendering as never}
        />
      ) : (
        <div className="mt-8 flex min-h-[120px] w-full items-center justify-center rounded-md border border-border border-dashed bg-muted/30 text-muted-foreground">
          article-header-content
        </div>
      )}
    </ArticleHeaderBody>
  );
}

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land here
 * in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants fail to resolve. No runtime behaviour change.
 */
export const componentType = "universal";
