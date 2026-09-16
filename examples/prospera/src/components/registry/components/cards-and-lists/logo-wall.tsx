import type { ReactNode } from "react";
import { TypographyH2 } from "@/components/registry/primitives/core/typography";
import { ArrowLink } from "@/components/registry/primitives/editables/arrow-link";
import {
  type ImageSource,
  NextImage,
} from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import {
  getLinkHref,
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
import { isEnabled } from "@/lib/registry/param-parsers";
import {
  SECTION_PADDING_Y_CLASSES,
  type SectionPaddingY,
} from "@/lib/registry/section-surface";
import { resolvedPlaceholderName } from "@/lib/registry/placeholder-children";
import { renderingHasComposedChildren } from "@/lib/registry/search/use-resolved-list-items";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";

/**
 * `logo-wall` — a strip or grid of partner / sponsor / client /
 * brand logos.
 *
 * Each item is a logo image, a name (used as accessible alt fallback
 * and optional caption), and an optional link. Serves sponsor strips,
 * "trusted by" client walls, partner grids, press/award logo rows,
 * app-store badge strips — the entities are deliberately
 * un-opinionated.
 *
 * Two rendering shapes share one body:
 *   - `Strip` → single row; optionally auto-scrolls as a continuous
 *     marquee (duplicated track + `-50%` translate; the global
 *     `prefers-reduced-motion` reset freezes it, and editing mode
 *     renders the static row so authors get a stable target).
 *   - `Grid`  → responsive multi-row grid.
 *
 * Curated items flow via the `Logos` Treelist (flattened by the
 * component map); the file stays runnable with plain values so it
 * previews without a Sitecore payload.
 */

export interface LogoWallItem {
  id?: string;
  /** The logo image. */
  logo?: ImageSource;
  /** Partner / brand name — accessible label and alt fallback. */
  name?: TextSource;
  /**
   * Optional short copy — only the RecognitionRows treatment renders
   * it (e.g. the analyst-report sentence beside a Gartner / Forrester
   * seal). Strip / Grid tiles ignore it.
   */
  description?: RichTextSource;
  /** Optional link wrapping the logo. */
  link?: LinkSource;
}

export type LogoWallSize = "sm" | "md" | "lg";

export interface LogoWallProps extends CmsProps {
  /** Optional heading above the wall. */
  title?: TextSource;
  /** Small uppercase line above the title. */
  eyebrow?: TextSource;
  items?: LogoWallItem[];
  /**
   * Render logos in a monochrome (grayscale) treatment that restores
   * full color on hover — the classic "quiet" partner wall.
   */
  monochrome?: boolean;
  /** Columns at the lg breakpoint (Grid variant only). */
  columns?: 3 | 4 | 5 | 6;
  /** Logo tile size. */
  size?: LogoWallSize;
  /**
   * Auto-scroll the strip as a continuous marquee (Strip variant
   * only). Respects `prefers-reduced-motion`; suppressed in editing.
   */
  marquee?: boolean | string;
  /** Background tone of the section. */
  surfaceTone?: SurfaceTone;
  /** Vertical padding around the section (`padding-y@1`). `default` keeps the standard band padding. */
  paddingY?: SectionPaddingY;
  className?: string;
}

const SIZE_LOGO_CLASS: Record<LogoWallSize, string> = {
  sm: "h-8",
  md: "h-12",
  lg: "h-16",
};

const SIZE_TILE_CLASS: Record<LogoWallSize, string> = {
  sm: "px-4 py-3",
  md: "px-6 py-4",
  lg: "px-8 py-5",
};

const GRID_COLUMNS_CLASS: Record<3 | 4 | 5 | 6, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

function LogoWallCompose({
  items,
  rendering,
  empty,
  children,
}: {
  items: LogoWallItem[];
  isEditing?: boolean;
  rendering?: CmsProps["rendering"];
  empty: ReactNode;
  children: ReactNode;
}) {
  if (items.length > 0 && !renderingHasComposedChildren(rendering)) {
    return children;
  }
  if (rendering) {
    return (
      <Placeholder
        name={resolvedPlaceholderName(rendering, "logo-wall-{*}")}
        rendering={rendering}
      />
    );
  }
  return empty;
}

function LogoTile({
  item,
  size,
  monochrome,
  isEditing,
}: {
  item: LogoWallItem;
  size: LogoWallSize;
  monochrome?: boolean;
  isEditing?: boolean;
}) {
  const name = getSourceText(item.name);
  const href = getLinkHref(item.link);
  const logo = (
    <NextImage
      value={item.logo}
      width={160}
      height={64}
      className={cn(
        "w-auto object-contain",
        SIZE_LOGO_CLASS[size],
        monochrome &&
          "opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0",
      )}
      alt={name}
      placeholder={isEditing ? "Logo" : undefined}
      isEditing={isEditing}
    />
  );
  const tileClass = cn(
    "flex items-center justify-center",
    SIZE_TILE_CLASS[size],
  );
  if (href && !isEditing) {
    return (
      <a href={href} className={tileClass} aria-label={name || undefined}>
        {logo}
      </a>
    );
  }
  // Plain (non-link) tile: no aria-label — a generic span doesn't
  // support it; the image's own alt text carries the accessible name.
  return <span className={tileClass}>{logo}</span>;
}

function LogoWallSection({
  title,
  eyebrow,
  surfaceTone = "none",
  paddingY = "auto",
  id,
  styles,
  className,
  isEditing,
  children,
}: {
  title?: TextSource;
  eyebrow?: TextSource;
  surfaceTone?: SurfaceTone;
  paddingY?: SectionPaddingY;
  id?: string;
  styles?: string;
  className?: string;
  isEditing?: boolean;
  children: ReactNode;
}) {
  const hasHeading =
    (title && getSourceText(title)) || (eyebrow && getSourceText(eyebrow));
  return (
    <section
      className={cn(
        "component logo-wall w-full",
        // `auto` (recipe default) → the section's natural responsive
        // ramp; a concrete token takes over.
        paddingY === "auto"
          ? "py-10 md:py-14"
          : SECTION_PADDING_Y_CLASSES[paddingY],
        surfaceToneClass(surfaceTone),
        className,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="logo-wall"
    >
      <div className="container mx-auto flex flex-col gap-8 px-4">
        {hasHeading ? (
          <div className="flex flex-col items-center gap-2 text-center">
            {eyebrow && getSourceText(eyebrow) ? (
              <span className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
                <Text value={eyebrow} tag="span" isEditing={isEditing} />
              </span>
            ) : null}
            {title && getSourceText(title) ? (
              <TypographyH2 className="font-heading text-2xl tracking-tight md:text-3xl">
                <Text value={title} tag="span" isEditing={isEditing} />
              </TypographyH2>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/**
 * Single row of logos; optionally a continuous auto-scrolling marquee.
 */
export function Strip({
  title,
  eyebrow,
  items = [],
  monochrome = true,
  size = "md",
  marquee,
  surfaceTone = "none",
  paddingY,
  className,
  id,
  styles,
  isEditing,
  rendering,
}: LogoWallProps) {
  const showMarquee = isEnabled(marquee) && !isEditing && items.length > 0;
  const tiles = (keyPrefix: string) =>
    items.map((item, i) => (
      <li key={item.id ?? `${keyPrefix}-${i}`} className="shrink-0">
        <LogoTile
          item={item}
          size={size}
          monochrome={monochrome}
          isEditing={isEditing}
        />
      </li>
    ));

  return (
    <LogoWallSection
      title={title}
      eyebrow={eyebrow}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
    >
      <LogoWallCompose
        items={items}
        isEditing={isEditing}
        rendering={rendering}
        empty={
          <p className="py-8 text-center text-muted-foreground text-sm">
            Logo wall — drop Logo Item renderings into the placeholder
          </p>
        }
      >
        {showMarquee ? (
          <div className="flex w-full overflow-x-clip">
            <div className="flex w-max animate-marquee">
              {[false, true].map((isClone) => (
                <ul
                  key={isClone ? "clone" : "lead"}
                  aria-hidden={isClone || undefined}
                  className="flex shrink-0 items-center gap-2"
                >
                  {tiles(isClone ? "clone" : "logo")}
                </ul>
              ))}
            </div>
          </div>
        ) : (
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {tiles("logo")}
          </ul>
        )}
      </LogoWallCompose>
    </LogoWallSection>
  );
}

/** Responsive multi-row grid of logos. */
export function Grid({
  title,
  eyebrow,
  items = [],
  monochrome = true,
  columns = 5,
  size = "md",
  surfaceTone = "none",
  paddingY,
  className,
  id,
  styles,
  isEditing,
  rendering,
}: LogoWallProps) {
  return (
    <LogoWallSection
      title={title}
      eyebrow={eyebrow}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
    >
      <LogoWallCompose
        items={items}
        isEditing={isEditing}
        rendering={rendering}
        empty={
          <p className="py-8 text-center text-muted-foreground text-sm">
            Logo wall — drop Logo Item renderings into the placeholder
          </p>
        }
      >
      <ul
        className={cn(
          "grid grid-cols-2 items-center gap-2 md:grid-cols-3",
          GRID_COLUMNS_CLASS[columns],
        )}
      >
        {items.map((item, i) => (
          <li key={item.id ?? `logo-${i}`} className="flex justify-center">
            <LogoTile
              item={item}
              size={size}
              monochrome={monochrome}
              isEditing={isEditing}
            />
          </li>
        ))}
      </ul>
      </LogoWallCompose>
    </LogoWallSection>
  );
}

/**
 * RecognitionRows — award / analyst-recognition rows (the Gartner
 * Magic Quadrant / Forrester Wave treatment): each item renders as a
 * hairline-divided row with the seal/logo at the start, name + short
 * description filling the middle, and the item's link as an arrow CTA
 * at the end. Monochrome defaults OFF here — award seals carry
 * meaningful color, unlike the quiet partner strip.
 */
export function RecognitionRows({
  title,
  eyebrow,
  items = [],
  monochrome = false,
  size = "md",
  surfaceTone = "none",
  paddingY,
  className,
  id,
  styles,
  isEditing,
  rendering,
}: LogoWallProps) {
  return (
    <LogoWallSection
      title={title}
      eyebrow={eyebrow}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
    >
      <LogoWallCompose
        items={items}
        isEditing={isEditing}
        rendering={rendering}
        empty={
          <p className="py-8 text-center text-muted-foreground text-sm">
            Logo wall — drop Logo Item renderings into the placeholder
          </p>
        }
      >
      <ul className="flex flex-col divide-y divide-border">
        {items.map((item, i) => {
          const name = getSourceText(item.name);
          const hasDescription =
            item.description != null && !isEmptySource(item.description);
          const hasLink = item.link != null && !isEmptySource(item.link);
          return (
            <li
              key={item.id ?? `logo-${i}`}
              className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-8"
            >
              {/* Fixed start column keeps the copy edge aligned across
                  rows regardless of each seal's natural width. */}
              <div className="flex w-40 shrink-0 items-center">
                <NextImage
                  value={item.logo}
                  width={160}
                  height={64}
                  className={cn(
                    "w-auto object-contain",
                    SIZE_LOGO_CLASS[size],
                    monochrome &&
                      "opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0",
                  )}
                  alt={name}
                  placeholder={isEditing ? "Logo" : undefined}
                  isEditing={isEditing}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {name || isEditing ? (
                  <span className="wrap-break-word font-heading font-semibold text-lg">
                    <Text value={item.name} tag="span" isEditing={isEditing} />
                  </span>
                ) : null}
                {hasDescription || isEditing ? (
                  <div className="wrap-break-word text-muted-foreground text-sm leading-relaxed [&_p]:mb-0">
                    <RichText
                      value={item.description}
                      placeholder="Description"
                      isEditing={isEditing}
                    />
                  </div>
                ) : null}
              </div>
              {hasLink || isEditing ? (
                <div className="shrink-0 sm:self-center">
                  <ArrowLink
                    value={item.link}
                    isEditing={isEditing}
                    placeholder="Link"
                    hideBorder
                    className="text-accent"
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      </LogoWallCompose>
    </LogoWallSection>
  );
}

export const Default = Strip;

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates. Server-only by default would land it in the
 * server map alone, and Sitecore Pages chrome (browser-side) could not
 * resolve the named-export variants. Purely a generate-map signal.
 */
export const componentType = "universal";
