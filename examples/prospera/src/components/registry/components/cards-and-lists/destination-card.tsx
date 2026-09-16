"use client";

import { useI18n } from "next-localization";
import type { ReactNode } from "react";
import type {
  ItemCardColorBand,
  ItemCardMediaBleed,
  ItemCardProps,
  ItemCardTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import {
  ItemCardContent as CardContent,
  ItemCard,
  withTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import { Button } from "@/components/registry/components/ui/cta-button";
import { Badge } from "@/components/registry/primitives/core/badge";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  TypographyH4,
  TypographyMuted,
  TypographySmall,
} from "@/components/registry/primitives/core/typography";
import {
  NextImage as Image,
  type ImageSource,
} from "@/components/registry/primitives/editables/image";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import {
  hasSourceText,
  resolveImageAlt,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";
import {
  type CardMediaAspect,
  MEDIA_ASPECT_CLASSES,
  parseOptionalCardMediaAspect,
} from "./_media-aspect";

/**
 * `DestinationCard` — leaf card rendering for the destinations family.
 *
 * Sitecore-agnostic: flat editable-typed props. Authors drop these into
 * the `cards-destinations-{*}` placeholder exposed by
 * `destinations-list-grid@1` and `destinations-carousel@1`, or curate
 * them via the parent's Treelist.
 *
 * Variants map to separate function exports (per the rendering-variant
 * convention — different DOM topology, not a discriminator prop):
 *
 *   - `Full`          — hero image, eyebrow, full metadata grid, CTAs
 *   - `Compact`       — image, eyebrow, condensed meta, two CTAs
 *   - `Essential`     — image, title, country, single CTA
 *   - `Hero`          — image with title overlaid, single CTA
 *   - `Highlight`     — outlined card, image + description, learn-more
 *   - `Tile`          — image dominant, title + country + arrow
 *   - `ListingHorizontal`               — side-by-side image/content
 *   - `ListingHorizontalComprehensive`  — same shape + rating + chips
 *
 * `cardVariant` (separate from the variant boundary) is a styling choice
 * on the destination tile that swaps between the "standard" badge row
 * and a "with-price" treatment that surfaces the StartingPrice as a
 * prominent badge. Layout doesn't change — only badge composition.
 */

export type DestinationPriceTreatment = "standard" | "with-price";

export interface DestinationCardProps extends CmsProps {
  /** Card eyebrow. */
  eyebrow?: TextSource;
  title?: TextSource;
  /**
   * Card description. Declared `rich-text` in `destination-card@1`, so
   * it renders through `RichText` (sanitized HTML) — not `Text` (which
   * escapes and would surface the CMS's `<p>…</p>` wrapper as literal
   * tags). Matches the excerpt/bio rendering on the sibling cards.
   */
  description?: RichTextSource;
  image?: ImageSource;
  link?: LinkSource;

  /** Starting-price label (e.g. "from $1,299"). */
  startingPrice?: TextSource;

  /** Tag clouds — flat string arrays after adapter unwrap. */
  activities?: string[];
  highlights?: string[];

  /** Optional metadata callouts used by Full/Compact. */
  country?: TextSource;
  tripDuration?: TextSource;
  tripPeriods?: TextSource;
  temperatures?: TextSource;
  continent?: TextSource;
  rating?: number;
  reviewCount?: number;

  /** Card styling — controls whether StartingPrice gets badge treatment. */
  priceTreatment?: DestinationPriceTreatment;

  // Chrome axes — pass-through to the shared ItemCard shell. Authors
  // set these on the recipe params; per-variant defaults apply when
  // unset. mediaBleed stays a no-op here: the hero image is absolutely
  // positioned inside its own wrapper below, not rendered via
  // ItemCard's media slot. `mediaAspect` DOES apply — it reshapes that
  // wrapper, replacing the variant's fixed height.
  elevation?: ItemCardProps["elevation"];
  padding?: ItemCardProps["padding"];
  style?: ItemCardProps["style"];
  cardColorScheme?: ItemCardProps["colorScheme"];
  colorBand?: ItemCardColorBand;
  titleLinkIcon?: ItemCardTitleLinkIcon;
  mediaBleed?: ItemCardMediaBleed;
  mediaAspect?: CardMediaAspect | string;
}

// Fall back to empty alt for unauthored fields — decorative semantics.
// A generic "Destination" string would leak meaningless screen-reader
// chatter on every card whose author skipped alt text. See the
// resolveImageAlt docstring for the rationale.
const defaultImageAlt = (title?: TextSource): string => resolveImageAlt(title);
const hasText = hasSourceText;

/**
 * next-localization's I18nContext has no default value, so `useI18n()`
 * returns `undefined` when no `<I18nProvider>` ancestor exists
 * (Sitecore metadata editing payloads, hand-mounted previews) even
 * though the typings promise an instance. Destructuring `{ t }` from
 * that undefined crashed the whole editing canvas; fall back to a
 * no-op translate so every context renders the English defaults.
 */
function useSafeTranslate(): (key: string) => string {
  const i18n = useI18n() as ReturnType<typeof useI18n> | undefined;
  return i18n ? (key) => i18n.t(key) : () => "";
}

function LearnMore({
  link,
  className,
}: {
  link?: LinkSource;
  className?: string;
}) {
  const t = useSafeTranslate();
  return (
    <Link
      value={link}
      className={cn(
        "inline-flex items-center gap-2 font-medium text-accent text-sm",
        className,
      )}
    >
      {t("learn_more") || "Learn More"}
      <LibraryIcon
        name="arrow-right"
        className="h-4 w-4 rtl:rotate-180"
        aria-hidden={true}
      />
    </Link>
  );
}

function TagChips({ items, max = 4 }: { items?: string[]; max?: number }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.slice(0, max).map((label) => (
        <Badge key={label} size="sm" variant="rounded" colorScheme="neutral">
          {label}
        </Badge>
      ))}
    </div>
  );
}

function PriceBadge({
  startingPrice,
  priceTreatment,
  className,
}: {
  startingPrice?: TextSource;
  priceTreatment?: DestinationPriceTreatment;
  className?: string;
}) {
  if (priceTreatment !== "with-price" || !hasText(startingPrice)) return null;
  return (
    <Badge
      size="sm"
      variant="rounded"
      colorScheme="primary"
      className={className}
    >
      <Text value={startingPrice} />
    </Badge>
  );
}

/**
 * Chrome forwarder for destination variants. Every variant composes
 * `CardShell` to get the rounded outer surface; the optional `chrome`
 * bundle is spread onto the underlying `ItemCard` so authors' recipe-
 * driven elevation / style / padding / colorScheme / colorBand /
 * mediaBleed all flow through. `outlined` flips the per-variant default
 * `style` from `flat` (the elevated look) to `outline`; an explicit
 * `chrome.style` / `chrome.elevation` / `chrome.padding` still wins.
 */
function CardShell({
  children,
  id,
  className,
  outlined,
  chrome,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  outlined?: boolean;
  chrome?: {
    elevation?: ItemCardProps["elevation"];
    padding?: ItemCardProps["padding"];
    style?: ItemCardProps["style"];
    cardColorScheme?: ItemCardProps["colorScheme"];
    colorBand?: ItemCardColorBand;
    titleLinkIcon?: ItemCardTitleLinkIcon;
    mediaBleed?: ItemCardMediaBleed;
  };
}) {
  return (
    <ItemCard
      id={id}
      elevation={chrome?.elevation ?? "sm"}
      padding={chrome?.padding ?? "sm"}
      style={chrome?.style ?? (outlined ? "outline" : "flat")}
      colorScheme={chrome?.cardColorScheme}
      colorBand={chrome?.colorBand}
      titleLinkIcon={chrome?.titleLinkIcon}
      mediaBleed={chrome?.mediaBleed}
      className={cn(
        // No radius class here: the Card primitive's token-driven
        // `rounded-[var(--card-radius,…)]` must win so scanned themes
        // (e.g. square-chrome brands with `--card-radius: 0`) apply.
        "gap-0 overflow-hidden p-0 hover:shadow-lg",
        className,
      )}
    >
      {children}
    </ItemCard>
  );
}

/**
 * Pluck the chrome axes off `DestinationCardProps` into the shape
 * `CardShell` expects. Variants call this and pass the result via
 * `chrome` to avoid threading 7 axes through every variant signature.
 */
/**
 * The media wrapper's sizing class. A concrete `media-aspect@1` value
 * replaces this variant's fixed height with an aspect box; `auto`,
 * unset and anything unrecognised keep the height the variant has
 * always used, so an untouched placement renders byte-identically.
 */
function mediaBoxClass(
  mediaAspect: CardMediaAspect | string | undefined,
  fallbackHeight: string,
): string {
  const aspect = parseOptionalCardMediaAspect(
    typeof mediaAspect === "string" ? mediaAspect : undefined,
  );
  return aspect ? MEDIA_ASPECT_CLASSES[aspect] : fallbackHeight;
}

function pickChrome(
  props: DestinationCardProps,
): NonNullable<Parameters<typeof CardShell>[0]["chrome"]> {
  return {
    elevation: props.elevation,
    padding: props.padding,
    style: props.style,
    cardColorScheme: props.cardColorScheme,
    colorBand: props.colorBand,
    titleLinkIcon: props.titleLinkIcon,
    mediaBleed: props.mediaBleed,
  };
}

function CardImage({
  image,
  link,
  alt,
  fillClassName,
  sizes,
  badgeStart,
  badgeEnd,
}: {
  image?: ImageSource;
  link?: LinkSource;
  alt: string;
  fillClassName: string;
  sizes?: string;
  badgeStart?: ReactNode;
  badgeEnd?: ReactNode;
}) {
  const inner = (
    <>
      {image ? (
        <Image
          value={image}
          alt={alt}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          fill
          sizes={sizes}
        />
      ) : null}
      {badgeStart}
      {badgeEnd}
    </>
  );
  if (link) {
    return (
      <Link value={link} className={fillClassName}>
        {inner}
      </Link>
    );
  }
  return <div className={fillClassName}>{inner}</div>;
}

/* ---------- Variants ---------- */

export function Full(props: DestinationCardProps) {
  const t = useSafeTranslate();
  const {
    eyebrow,
    title,
    description,
    image,
    link,
    startingPrice,
    activities,
    highlights,
    country,
    tripDuration,
    tripPeriods,
    temperatures,
    continent,
    rating,
    reviewCount,
    priceTreatment,
    id,
    styles,
  } = props;
  const ratingValue = rating ?? 0;
  const reviews = reviewCount ?? 0;
  return (
    <CardShell id={id} className={styles?.trimEnd()} chrome={pickChrome(props)}>
      <div
        className={cn(
          "relative w-full overflow-hidden",
          mediaBoxClass(props.mediaAspect, "h-64"),
        )}
      >
        <CardImage
          image={image}
          alt={defaultImageAlt(title)}
          fillClassName="absolute inset-0 block h-full w-full"
          badgeStart={
            hasText(eyebrow) ? (
              <Badge
                size="sm"
                variant="rounded"
                colorScheme="primary"
                className="absolute start-4 top-4"
              >
                <Text value={eyebrow} />
              </Badge>
            ) : null
          }
          badgeEnd={
            ratingValue > 0 ? (
              <div className="absolute end-4 top-4 flex items-center gap-1 rounded-md bg-background/90 px-2 py-1">
                <LibraryIcon
                  name="star"
                  className="inline size-4 text-warning"
                  aria-hidden={true}
                />
                <Text value={{ value: String(ratingValue) }} />
                {reviews > 0 ? (
                  <span className="text-muted-foreground text-xs">
                    ({reviews})
                  </span>
                ) : null}
              </div>
            ) : null
          }
        />
        <div className="absolute start-4 bottom-4 text-background">
          <TypographyH4 className="wrap-break-word text-background">
            {withTitleLinkIcon(<Text value={title} />, props.titleLinkIcon)}
          </TypographyH4>
          {hasText(country) ? (
            <TypographyMuted className="text-background">
              <Text value={country} />
            </TypographyMuted>
          ) : null}
        </div>
        <PriceBadge
          startingPrice={startingPrice}
          priceTreatment={priceTreatment}
          className="absolute end-4 bottom-4"
        />
      </div>

      <CardContent className="space-y-5 p-6">
        {hasText(description) ? (
          <TypographyMuted className="line-clamp-2">
            <RichText value={description} />
          </TypographyMuted>
        ) : null}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {hasText(tripPeriods) ? (
            <div className="flex items-center gap-2">
              <LibraryIcon
                name="calendar-days"
                className="h-4 w-4 text-accent"
                aria-hidden={true}
              />
              <Text value={tripPeriods} />
            </div>
          ) : null}
          {hasText(tripDuration) ? (
            <div className="flex items-center gap-2">
              <LibraryIcon
                name="clock"
                className="h-4 w-4 text-accent"
                aria-hidden={true}
              />
              <Text value={tripDuration} />
            </div>
          ) : null}
          {hasText(temperatures) ? (
            <div className="flex items-center gap-2">
              <LibraryIcon
                name="thermometer"
                className="h-4 w-4 text-accent"
                aria-hidden={true}
              />
              <Text value={temperatures} />
            </div>
          ) : null}
          {hasText(continent) ? (
            <div className="flex items-center gap-2">
              <LibraryIcon
                name="map-pin"
                className="h-4 w-4 text-accent"
                aria-hidden={true}
              />
              <Text value={continent} />
            </div>
          ) : null}
        </div>

        {highlights?.length ? (
          <div>
            <TypographyH4 className="mb-2 text-base">
              {t("top_highlights_label") || "Top Highlights"}
            </TypographyH4>
            <TagChips items={highlights} max={4} />
          </div>
        ) : null}

        {activities?.length ? (
          <div>
            <TypographyH4 className="mb-2 text-base">
              {t("acitivities_label") || "Activities"}
            </TypographyH4>
            <TagChips items={activities} max={4} />
          </div>
        ) : null}

        <div
          className={cn(
            "flex space-x-2 rtl:space-x-reverse",
            "text-sm 2xl:text-base",
          )}
        >
          <Button
            className="flex-1"
            size="sm"
            variant="default"
            colorScheme="neutral"
          >
            {t("book_flight") || "Book Flight"}
          </Button>
          <Button asChild className="flex-1" size="sm" variant="outline">
            <Link value={link}>{t("learn_more") || "Learn More"}</Link>
          </Button>
        </div>
      </CardContent>
    </CardShell>
  );
}

export function Compact(props: DestinationCardProps) {
  const t = useSafeTranslate();
  const {
    eyebrow,
    title,
    description,
    image,
    link,
    startingPrice,
    highlights,
    country,
    tripDuration,
    tripPeriods,
    temperatures,
    continent,
    priceTreatment,
    id,
    styles,
  } = props;
  return (
    <CardShell id={id} className={styles?.trimEnd()} chrome={pickChrome(props)}>
      <div
        className={cn(
          "relative w-full overflow-hidden",
          mediaBoxClass(props.mediaAspect, "h-64"),
        )}
      >
        <CardImage
          image={image}
          alt={defaultImageAlt(title)}
          fillClassName="absolute inset-0 block h-full w-full"
          badgeStart={
            hasText(eyebrow) ? (
              <Badge
                size="sm"
                variant="rounded"
                colorScheme="primary"
                className="absolute start-4 top-4"
              >
                <Text value={eyebrow} />
              </Badge>
            ) : null
          }
        />
        <div className="absolute start-4 bottom-4 text-background">
          <TypographyH4 className="wrap-break-word text-background">
            {withTitleLinkIcon(<Text value={title} />, props.titleLinkIcon)}
          </TypographyH4>
          {hasText(country) ? (
            <TypographyMuted className="text-background">
              <Text value={country} />
            </TypographyMuted>
          ) : null}
        </div>
        <PriceBadge
          startingPrice={startingPrice}
          priceTreatment={priceTreatment}
          className="absolute end-4 bottom-4"
        />
      </div>

      <CardContent className="space-y-5 p-6">
        {hasText(description) ? (
          <TypographyMuted className="line-clamp-2">
            <RichText value={description} />
          </TypographyMuted>
        ) : null}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {hasText(tripPeriods) ? (
            <div className="flex items-center gap-2">
              <LibraryIcon
                name="calendar-days"
                className="h-4 w-4 text-accent"
                aria-hidden={true}
              />
              <Text value={tripPeriods} />
            </div>
          ) : null}
          {hasText(tripDuration) ? (
            <div className="flex items-center gap-2">
              <LibraryIcon
                name="clock"
                className="h-4 w-4 text-accent"
                aria-hidden={true}
              />
              <Text value={tripDuration} />
            </div>
          ) : null}
          {hasText(temperatures) ? (
            <div className="flex items-center gap-2">
              <LibraryIcon
                name="thermometer"
                className="h-4 w-4 text-accent"
                aria-hidden={true}
              />
              <Text value={temperatures} />
            </div>
          ) : null}
          {hasText(continent) ? (
            <div className="flex items-center gap-2">
              <LibraryIcon
                name="map-pin"
                className="h-4 w-4 text-accent"
                aria-hidden={true}
              />
              <Text value={continent} />
            </div>
          ) : null}
        </div>

        {highlights?.length ? (
          <div>
            <TypographyH4 className="mb-2 text-base">
              {t("top_highlights_label") || "Top Highlights"}
            </TypographyH4>
            <TagChips items={highlights} max={3} />
          </div>
        ) : null}

        <div
          className={cn(
            "flex space-x-2 rtl:space-x-reverse",
            "text-sm 2xl:text-base",
          )}
        >
          <Button
            className="flex-1"
            size="sm"
            variant="default"
            colorScheme="neutral"
          >
            {t("book_flight") || "Book Flight"}
          </Button>
          <Button asChild className="flex-1" size="sm" variant="outline">
            <Link value={link}>{t("learn_more") || "Learn More"}</Link>
          </Button>
        </div>
      </CardContent>
    </CardShell>
  );
}

export function Essential(props: DestinationCardProps) {
  const t = useSafeTranslate();
  const {
    eyebrow,
    title,
    image,
    link,
    startingPrice,
    country,
    priceTreatment,
    id,
    styles,
  } = props;
  return (
    <CardShell id={id} className={styles?.trimEnd()} chrome={pickChrome(props)}>
      <div
        className={cn(
          "relative w-full overflow-hidden",
          mediaBoxClass(props.mediaAspect, "h-64"),
        )}
      >
        <CardImage
          image={image}
          alt={defaultImageAlt(title)}
          fillClassName="absolute inset-0 block h-full w-full"
          badgeStart={
            hasText(eyebrow) ? (
              <Badge
                size="sm"
                variant="rounded"
                colorScheme="primary"
                className="absolute start-4 top-4"
              >
                <Text value={eyebrow} />
              </Badge>
            ) : null
          }
        />
        <div className="absolute start-4 bottom-4 text-background">
          <TypographyH4 className="wrap-break-word text-background">
            {withTitleLinkIcon(<Text value={title} />, props.titleLinkIcon)}
          </TypographyH4>
          {hasText(country) ? (
            <TypographyMuted className="text-background">
              <Text value={country} />
            </TypographyMuted>
          ) : null}
        </div>
        <PriceBadge
          startingPrice={startingPrice}
          priceTreatment={priceTreatment}
          className="absolute end-4 bottom-4"
        />
      </div>
      <CardContent className="p-6">
        <Button asChild className="w-full" size="sm">
          <Link value={link}>{t("learn_more") || "Learn More"}</Link>
        </Button>
      </CardContent>
    </CardShell>
  );
}

export function Hero(props: DestinationCardProps) {
  const t = useSafeTranslate();
  const {
    eyebrow,
    title,
    image,
    link,
    startingPrice,
    country,
    priceTreatment,
    id,
    styles,
  } = props;
  return (
    <CardShell id={id} className={styles?.trimEnd()} chrome={pickChrome(props)}>
      <div
        className={cn(
          "relative w-full overflow-hidden",
          mediaBoxClass(props.mediaAspect, "h-96"),
        )}
      >
        <CardImage
          image={image}
          alt={defaultImageAlt(title)}
          fillClassName="absolute inset-0 block h-full w-full"
          badgeStart={
            hasText(eyebrow) ? (
              <Badge
                size="sm"
                variant="rounded"
                colorScheme="primary"
                className="absolute start-4 top-4"
              >
                <Text value={eyebrow} />
              </Badge>
            ) : null
          }
        />
        <div className="absolute start-6 bottom-6 text-background">
          <TypographyH4 className="wrap-break-word text-2xl text-background">
            {withTitleLinkIcon(<Text value={title} />, props.titleLinkIcon)}
          </TypographyH4>
          {hasText(country) ? (
            <TypographyMuted className="text-background">
              <Text value={country} />
            </TypographyMuted>
          ) : null}
        </div>
        <PriceBadge
          startingPrice={startingPrice}
          priceTreatment={priceTreatment}
          className="absolute end-6 bottom-6"
        />
      </div>
      <CardContent className="p-6">
        <Button asChild className="w-full" size="sm">
          <Link value={link}>{t("learn_more") || "Learn More"}</Link>
        </Button>
      </CardContent>
    </CardShell>
  );
}

export function Highlight(props: DestinationCardProps) {
  const {
    eyebrow,
    title,
    description,
    image,
    link,
    startingPrice,
    priceTreatment,
    id,
    styles,
  } = props;
  return (
    <CardShell
      outlined
      id={id}
      className={styles?.trimEnd()}
      chrome={pickChrome(props)}
    >
      <CardImage
        image={image}
        link={link}
        alt={defaultImageAlt(title)}
        fillClassName={cn(
          "relative block overflow-hidden",
          mediaBoxClass(props.mediaAspect, "h-52"),
        )}
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        badgeStart={
          hasText(eyebrow) ? (
            <Badge
              size="sm"
              variant="rounded"
              colorScheme="primary"
              className="absolute start-3 top-3"
            >
              <Text value={eyebrow} />
            </Badge>
          ) : null
        }
        badgeEnd={
          <PriceBadge
            startingPrice={startingPrice}
            priceTreatment={priceTreatment}
            className="absolute end-3 top-3"
          />
        }
      />
      <CardContent className="space-y-2 p-5">
        <TypographyH4 className="wrap-break-word text-base">
          {withTitleLinkIcon(<Text value={title} />, props.titleLinkIcon)}
        </TypographyH4>
        {hasText(description) ? (
          <TypographyMuted className="line-clamp-3">
            <RichText value={description} />
          </TypographyMuted>
        ) : null}
        <LearnMore link={link} />
      </CardContent>
    </CardShell>
  );
}

export function Tile(props: DestinationCardProps) {
  const {
    eyebrow,
    title,
    image,
    link,
    startingPrice,
    country,
    priceTreatment,
    id,
    styles,
  } = props;
  return (
    <CardShell id={id} className={styles?.trimEnd()} chrome={pickChrome(props)}>
      <CardImage
        image={image}
        link={link}
        alt={defaultImageAlt(title)}
        fillClassName="relative block h-48 overflow-hidden"
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
        badgeStart={
          hasText(eyebrow) ? (
            <Badge
              size="sm"
              variant="rounded"
              colorScheme="primary"
              className="absolute start-3 top-3"
            >
              <Text value={eyebrow} />
            </Badge>
          ) : null
        }
        badgeEnd={
          <PriceBadge
            startingPrice={startingPrice}
            priceTreatment={priceTreatment}
            className="absolute end-3 top-3"
          />
        }
      />
      <CardContent className="space-y-3 p-4">
        <div>
          <TypographyH4 className="wrap-break-word text-lg">
            {withTitleLinkIcon(<Text value={title} />, props.titleLinkIcon)}
          </TypographyH4>
          {hasText(country) ? (
            <TypographySmall className="text-muted-foreground">
              <Text value={country} />
            </TypographySmall>
          ) : null}
        </div>
        <LearnMore link={link} />
      </CardContent>
    </CardShell>
  );
}

export function ListingHorizontal(props: DestinationCardProps) {
  const {
    eyebrow,
    title,
    description,
    image,
    link,
    startingPrice,
    country,
    priceTreatment,
    id,
    styles,
  } = props;
  return (
    <CardShell id={id} className={styles?.trimEnd()} chrome={pickChrome(props)}>
      <div className="grid min-h-[220px] grid-cols-1 sm:grid-cols-[220px_1fr]">
        <CardImage
          image={image}
          link={link}
          alt={defaultImageAlt(title)}
          fillClassName="relative block h-52 overflow-hidden bg-accent-background/40 sm:h-full"
          sizes="(max-width: 639px) 100vw, 220px"
          badgeStart={
            hasText(eyebrow) ? (
              <Badge
                size="sm"
                variant="rounded"
                colorScheme="primary"
                className="absolute start-3 top-3"
              >
                <Text value={eyebrow} />
              </Badge>
            ) : null
          }
        />
        <div className="flex flex-col justify-between gap-4 p-5">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <TypographyH4 className="wrap-break-word">
                  {withTitleLinkIcon(
                    <Text value={title} />,
                    props.titleLinkIcon,
                  )}
                </TypographyH4>
                {hasText(country) ? (
                  <TypographySmall className="text-muted-foreground">
                    <Text value={country} />
                  </TypographySmall>
                ) : null}
              </div>
            </div>
            {hasText(description) ? (
              <TypographyMuted className="line-clamp-2">
                <RichText value={description} />
              </TypographyMuted>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3">
            <PriceBadge
              startingPrice={startingPrice}
              priceTreatment={priceTreatment}
            />
            <LearnMore link={link} />
          </div>
        </div>
      </div>
    </CardShell>
  );
}

export function ListingHorizontalComprehensive(props: DestinationCardProps) {
  const {
    eyebrow,
    title,
    description,
    image,
    link,
    startingPrice,
    activities,
    highlights,
    country,
    tripDuration,
    temperatures,
    rating,
    priceTreatment,
    id,
    styles,
  } = props;
  const ratingValue = rating ?? 0;
  return (
    <CardShell id={id} className={styles?.trimEnd()} chrome={pickChrome(props)}>
      <div className="grid min-h-[220px] grid-cols-1 sm:grid-cols-[220px_1fr]">
        <CardImage
          image={image}
          link={link}
          alt={defaultImageAlt(title)}
          fillClassName="relative block h-52 overflow-hidden bg-accent-background/40 sm:h-full"
          sizes="(max-width: 639px) 100vw, 220px"
          badgeStart={
            hasText(eyebrow) ? (
              <Badge
                size="sm"
                variant="rounded"
                colorScheme="primary"
                className="absolute start-3 top-3"
              >
                <Text value={eyebrow} />
              </Badge>
            ) : null
          }
        />
        <div className="flex flex-col justify-between gap-4 p-5">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <TypographyH4 className="wrap-break-word">
                  {withTitleLinkIcon(
                    <Text value={title} />,
                    props.titleLinkIcon,
                  )}
                </TypographyH4>
                {hasText(country) ? (
                  <TypographySmall className="text-muted-foreground">
                    <Text value={country} />
                  </TypographySmall>
                ) : null}
              </div>
              {ratingValue > 0 ? (
                <Badge size="sm" variant="rounded" colorScheme="neutral">
                  <LibraryIcon
                    name="star"
                    className="me-1 h-3.5 w-3.5 text-warning"
                    aria-hidden={true}
                  />
                  <Text value={{ value: String(ratingValue) }} />
                </Badge>
              ) : null}
            </div>
            {hasText(description) ? (
              <TypographyMuted className="line-clamp-2">
                <RichText value={description} />
              </TypographyMuted>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {hasText(tripDuration) ? (
                <Badge size="sm" variant="rounded" colorScheme="neutral">
                  <LibraryIcon
                    name="clock"
                    className="me-1 h-3.5 w-3.5"
                    aria-hidden={true}
                  />
                  <Text value={tripDuration} />
                </Badge>
              ) : null}
              {hasText(temperatures) ? (
                <Badge size="sm" variant="rounded" colorScheme="neutral">
                  <LibraryIcon
                    name="thermometer"
                    className="me-1 h-3.5 w-3.5"
                    aria-hidden={true}
                  />
                  <Text value={temperatures} />
                </Badge>
              ) : null}
              {highlights?.[0] ? (
                <Badge size="sm" variant="rounded" colorScheme="neutral">
                  {highlights[0]}
                </Badge>
              ) : activities?.[0] ? (
                <Badge size="sm" variant="rounded" colorScheme="neutral">
                  {activities[0]}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <PriceBadge
              startingPrice={startingPrice}
              priceTreatment={priceTreatment}
            />
            <LearnMore link={link} />
          </div>
        </div>
      </div>
    </CardShell>
  );
}

export type DestinationCardVariant =
  | "full"
  | "compact"
  | "essential"
  | "hero"
  | "highlight"
  | "tile"
  | "listing-horizontal"
  | "listing-horizontal-comprehensive";

export const Default = Full;

export default Full;

export const componentType = "universal";
