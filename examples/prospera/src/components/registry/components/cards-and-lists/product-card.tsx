"use client";

import type { CSSProperties, ReactNode } from "react";
import { CardNavigate } from "@/components/registry/blocks/card-navigate";
import type {
  ItemCardColorBand,
  ItemCardMediaBleed,
  ItemCardProps,
  ItemCardTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import {
  ItemCard as Card,
  withTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import { StarRating } from "@/components/registry/blocks/star-rating";
import { Button } from "@/components/registry/components/ui/cta-button";
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
import { type LinkSource } from "@/components/registry/primitives/editables/link";
import { getLinkHref } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { useLocale } from "@/hooks/registry/use-locale-options";
import { cn } from "@/lib/registry/cn";
import { mediaFitClass } from "@/lib/registry/media-fit";
import {
  type ButtonVariantValue,
  isEnabled,
  type PrimitiveButtonVariantValue,
  parseBoolParam,
  parseButtonVariant,
  type SitecoreBoolInput,
} from "@/lib/registry/param-parsers";
import type { CmsProps, Field } from "@/lib/registry/sitecore";
import {
  type CardMediaAspect,
  MEDIA_ASPECT_CLASSES,
  parseOptionalCardMediaAspect,
} from "./_media-aspect";

type ProductCardClassNames = {
  root?: string;
  imageLink?: string;
  imageWrapper?: string;
  image?: string;
  imageSecondary?: string;
  content?: string;
  category?: string;
  title?: string;
  rating?: string;
  priceRow?: string;
  price?: string;
  cta?: string;
};

type ProductCardTokens = {
  height?: number | string;
  imageRatio?: number | string;
  contentRatio?: number | string;
  radius?: number | string;
  ctaSize?: number | string;
  ctaRadius?: number | string;
};

/**
 * Category prop accepts either a pre-lifted `TextSource` (the curated
 * search/list-grid path produces this) or a droplink item shape — the
 * SDK passes the resolved Category item directly when product-card@1
 * is mounted top-level. `resolveCategory` accepts both.
 */
type ProductCardCategorySource =
  | TextSource
  | { fields?: { CategoryName?: TextSource } };

export type ProductCardRenderCta = (context: {
  title?: TextSource;
  currencySymbol: string;
  formattedPrice: string | number | undefined;
}) => ReactNode;

export interface ProductCardDisplayOptions {
  showSecondaryImage?: boolean;
  /**
   * Pin the secondary image visible instead of revealing it on hover.
   * Preview seam only — a static preview frame never hovers, so the
   * second image is otherwise unreachable and unmeasurable.
   */
  forceSecondaryImage?: boolean;
  /**
   * Opt-out switch for the star rating. The rating row only renders
   * when `ratingValue` is a real number — a card with no rating data
   * must not paint a default full-score row (the benchmark renders
   * showed every dataless product card as "Rated 5 out of 5").
   */
  showRating?: boolean;
  ratingValue?: number;
  ratingMax?: number;
  priorityImage?: boolean;
  /**
   * Whether the footer paints the price row. Decoupled from the CTA so
   * a content card (`ctaKind: "link"`) can drop the price while a shop
   * card keeps it. Undefined defers to the CTA kind: on for cart/none,
   * off for link.
   */
  showPrice?: boolean;
}

/**
 * What the footer CTA does — orthogonal to its visual fill.
 *   - `cart` the e-commerce add-to-cart affordance (shop flavor)
 *   - `link` an editorial content CTA (the card as a content tile)
 *   - `none` no CTA at all
 */
export type ProductCardCtaKind = "cart" | "link" | "none";

const PRODUCT_CTA_KINDS: ReadonlySet<ProductCardCtaKind> = new Set([
  "cart",
  "link",
  "none",
]);

function parseCtaKind(
  value: string | undefined,
  fallback: ProductCardCtaKind = "cart",
): ProductCardCtaKind {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return PRODUCT_CTA_KINDS.has(normalized as ProductCardCtaKind)
    ? (normalized as ProductCardCtaKind)
    : fallback;
}

/** Extract a plain string from a `TextSource` (or return `undefined`). */
function textString(source: TextSource | undefined): string | undefined {
  if (source == null) return undefined;
  const raw = typeof source === "string" ? source : source.value;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed.length > 0 ? trimmed : undefined;
}

export interface ProductCardCtaOptions {
  /** What the CTA does. Defaults to `cart` (the shop affordance). */
  kind?: ProductCardCtaKind;
  /**
   * Visual fill of the CTA — the shared `button-variant@1` axis. On the
   * `link` kind an unset value reads as the editorial link treatment.
   */
  variant?: ButtonVariantValue;
  /** Trailing arrow (→) after the label — orthogonal to fill. */
  showArrow?: boolean;
  /** CTA label. See `CtaLabel` field semantics on the recipe. */
  label?: TextSource;
  onAddToCart?: () => void;
  renderCta?: ProductCardRenderCta;
}

/** Resolved footer-CTA descriptor shared by every variant's footer. */
interface ResolvedProductCta {
  kind: ProductCardCtaKind;
  variant: PrimitiveButtonVariantValue;
  showArrow: boolean;
  label: string | undefined;
  showPrice: boolean;
  onAddToCart?: () => void;
  renderCta?: ProductCardRenderCta;
}

/**
 * Fold the nested programmatic options (`ctaOptions` / `displayOptions`,
 * used by the preview + curated paths) and the flat Sitecore params
 * (`ctaKind` / `ctaVariant` / `showArrow` / `ctaLabel` / `showPrice`,
 * mapped by the default convention) into one descriptor. Nested options
 * win; the flat params are the CMS fallback.
 */
function resolveCta(props: ProductCardProps): ResolvedProductCta {
  const opt = props.ctaOptions;
  const kind = opt?.kind ?? parseCtaKind(props.ctaKind);
  // On the link kind an unset fill reads as the editorial link.
  const variant = parseButtonVariant(
    opt?.variant ?? props.ctaVariant,
    kind === "link" ? "link" : "default",
  );
  const showArrow =
    opt?.showArrow ?? isEnabled(props.showArrow as SitecoreBoolInput);
  const label = textString(opt?.label ?? props.ctaLabel);
  // Price defaults on for cart/none, off for a content link — unless the
  // author explicitly sets it.
  const showPrice =
    props.displayOptions?.showPrice ??
    parseBoolParam(props.showPrice as SitecoreBoolInput, kind !== "link");
  return {
    kind,
    variant,
    showArrow,
    label,
    showPrice,
    onAddToCart: opt?.onAddToCart,
    renderCta: opt?.renderCta,
  };
}

/**
 * Product card — leaf rendering for the products family. Fields and
 * params map 1:1 to the `product-card@1` recipe via `withSitecore`'s
 * default convention map; extends `CmsProps` so `id` / `styles` /
 * `isEditing` are picked up automatically. No sibling `.sitecore.ts`
 * adapter — pure default convention.
 *
 * Six variants — each variant has a distinct DOM topology (see
 * [[feedback-variant-vs-parameter]]):
 *   - `Default`             square product tile (image-heavy, on-hover swap)
 *   - `Compact`             square tile without the image swap, shorter
 *   - `Minimal`             text-only summary tile
 *   - `HorizontalEssential` side-by-side: image start, title + price + CTA
 *   - `HorizontalDetailed`  same + short description + rating
 *   - `DetailPanel`         full PDP-style hero with CTA + details rows
 */
export interface ProductCardProps extends CmsProps {
  title?: TextSource;
  shortDescription?: TextSource;
  category?: ProductCardCategorySource;
  price?: Field<number> | number;
  sku?: TextSource;
  image1?: ImageSource;
  image2?: ImageSource;
  /** Click-through URL; falls back to `Link` then `#`. */
  url?: string;
  /** General-link field; used when `url` is empty (`CtaKind: link`). */
  link?: LinkSource;
  /** Optional analytics handle. */
  productId?: string;
  classNames?: ProductCardClassNames;
  tokens?: ProductCardTokens;
  /** Inline style overrides applied to the card wrapper. */
  cssStyles?: CSSProperties;
  /** Composed display controls for easier CMS mapping. */
  displayOptions?: ProductCardDisplayOptions;
  /** Composed CTA controls for easier CMS mapping. */
  ctaOptions?: ProductCardCtaOptions;

  // Flat CTA axes — mapped from the `product-card@1` recipe params by
  // the default convention (`CtaKind` → `ctaKind`, etc.). `ctaOptions`
  // wins when both are present; these are the CMS fallback so a composed
  // placement can route content into the card without the shop flavor.
  /** `product-cta-kind@1`: `cart` / `link` / `none`. Defaults to `cart`. */
  ctaKind?: string;
  /** `button-variant@1`: CTA fill (default / outline / ghost / link). */
  ctaVariant?: string;
  /** `ShowArrow` checkbox: trailing arrow after the CTA label. */
  showArrow?: string | boolean;
  /** `CtaLabel` field: the CTA label text. */
  ctaLabel?: TextSource;
  /** `ShowPrice` checkbox: paint the price row. Defaults to kind-driven. */
  showPrice?: string | boolean;

  // Chrome axes — pass-through to the shared ItemCard shell. Product
  // cards have their own design-token system (--product-card-*) for
  // the canonical Default/Compact grid tile; the chrome axes are
  // most useful on the horizontal and detail-panel variants.
  elevation?: ItemCardProps["elevation"];
  padding?: ItemCardProps["padding"];
  style?: ItemCardProps["style"];
  cardColorScheme?: ItemCardProps["colorScheme"];
  colorBand?: ItemCardColorBand;
  titleLinkIcon?: ItemCardTitleLinkIcon;
  mediaBleed?: ItemCardMediaBleed;
  /**
   * `media-aspect@1` — reshapes the tile's image box, which is
   * otherwise driven by the `--product-card-image-height` custom
   * property. `auto`/unset keeps that variable in charge, so a
   * placement that never sets this is unchanged.
   */
  mediaAspect?: CardMediaAspect | string;
  /**
   * How the image fills its media box (`media-fit@1`). `cover`
   * (default) crops to fill — right for photography. `contain` fits
   * the whole image in without cropping; bind for logos, brand marks,
   * badges, seals and product cut-outs, whose edges carry meaning.
   * Accepts the raw Sitecore enum string.
   */
  mediaFit?: string;
}

const resolveSize = (value: number | string | undefined, fallback: string) => {
  if (value === undefined || value === null || value === "") return fallback;
  return typeof value === "number" ? `${value}px` : value;
};

const resolvePercent = (
  value: number | string | undefined,
  fallback: string,
) => {
  if (value === undefined || value === null || value === "") return fallback;
  return typeof value === "number" ? `${value}%` : value;
};

function resolvePriceNumber(
  price: ProductCardProps["price"],
): number | undefined {
  if (price == null) return undefined;
  if (typeof price === "number")
    return Number.isFinite(price) ? price : undefined;
  const raw = (price as Field<number>).value;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  // Tolerant input: wildcard/text feeds deliver prices as DISPLAY
  // strings ("$120.90 USD", "1,290.99"). Extract the first decimal
  // number so a text Price bound via WildcardBindings still renders;
  // anything without one degrades to "no price row" as before.
  if (typeof raw === "string") {
    const match = raw.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
    if (match) {
      const parsed = Number(match[0]);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
  }
  return undefined;
}

function resolveCategory(
  category: ProductCardCategorySource | undefined,
): TextSource | undefined {
  if (!category) return undefined;
  // Droplink shape — `{ fields: { CategoryName } }` from the SDK.
  if (
    typeof category === "object" &&
    "fields" in category &&
    (category as { fields?: unknown }).fields
  ) {
    return (category as { fields?: { CategoryName?: TextSource } }).fields
      ?.CategoryName;
  }
  return category as TextSource;
}

function buildWrapperStyle(
  tokens: ProductCardTokens | undefined,
  cssStyles: CSSProperties | undefined,
): CSSProperties {
  return {
    "--product-card-height": resolveSize(tokens?.height, "450px"),
    "--product-card-image-height": resolvePercent(tokens?.imageRatio, "60%"),
    "--product-card-content-height":
      tokens?.contentRatio !== undefined
        ? resolvePercent(tokens?.contentRatio, "40%")
        : typeof tokens?.imageRatio === "number"
          ? `${Math.max(0, 100 - tokens.imageRatio)}%`
          : "40%",
    // Theme-token driven: `--card-radius` / `--button-radius` are the
    // orchestrator theme scheme's chrome tokens (a scanned square-chrome
    // brand sets them to 0). The old `--tm-*` names were leftovers from
    // the theme-builder prototype contract and are defined nowhere, so
    // the fallback always won and product cards ignored the theme.
    "--product-card-radius": resolveSize(
      tokens?.radius,
      "var(--card-radius, var(--radius-2xl))",
    ),
    "--product-card-cta-size": resolveSize(tokens?.ctaSize, "40px"),
    "--product-card-cta-radius": resolveSize(
      tokens?.ctaRadius,
      "var(--button-radius, 999px)",
    ),
    ...cssStyles,
  } as CSSProperties;
}

function formatPrice(price: number | undefined): string | number | undefined {
  if (price == null) return undefined;
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Pluck chrome-axis props off the input bag in a way every variant can
 * consume — each <Card> spreads the result to forward elevation /
 * style / colorScheme / colorBand / mediaBleed without re-listing them
 * at every call site.
 */
function chromeProps(p: ProductCardProps) {
  return {
    style: p.style,
    colorScheme: p.cardColorScheme,
    colorBand: p.colorBand,
    titleLinkIcon: p.titleLinkIcon,
    mediaBleed: p.mediaBleed,
  };
}

/**
 * Resolve the star-rating display state. Field-null guard: the rating
 * row renders only when the author supplied a real `ratingValue` —
 * never a default/full score — and `showRating: false` still hides an
 * authored value.
 */
function resolveProductHref(
  url?: string,
  link?: LinkSource,
): string | undefined {
  if (url && url !== "#") return url;
  const href = getLinkHref(link, "");
  return href || url;
}

function resolveRating(displayOptions: ProductCardDisplayOptions | undefined) {
  const ratingValue = displayOptions?.ratingValue;
  const ratingMax = Math.max(1, displayOptions?.ratingMax ?? 5);
  const hasRating =
    typeof ratingValue === "number" && Number.isFinite(ratingValue);
  const showRating = (displayOptions?.showRating ?? true) && hasRating;
  const filledRating = hasRating
    ? Math.max(0, Math.min(ratingValue, ratingMax))
    : 0;
  return { showRating, ratingMax, filledRating };
}

/**
 * The footer CTA node — dispatches on the resolved `kind`:
 *   - `none` renders nothing
 *   - `link` an editorial content CTA (button-variant fill + arrow)
 *   - `cart` the shop affordance: a labeled add-to-cart button when a
 *     label is set, else the compact icon-only plus button (default)
 *
 * The `renderCta` escape hatch (curated/list paths) always wins.
 */
function ProductCardCta({
  cta,
  currencySymbol,
  formattedPrice,
  title,
  url,
  classNames,
}: {
  cta: ResolvedProductCta;
  currencySymbol: string;
  formattedPrice: string | number | undefined;
  title?: TextSource;
  url?: string;
  classNames?: ProductCardClassNames;
}) {
  if (cta.renderCta) {
    return cta.renderCta({ title, currencySymbol, formattedPrice });
  }
  if (cta.kind === "none") return null;

  if (cta.kind === "link") {
    return (
      <Button
        variant={cta.variant}
        showArrow={cta.showArrow}
        size="sm"
        link={{ href: url || "#" }}
        data-slot="product-card-cta"
        className={classNames?.cta}
      >
        {cta.label || "Learn more"}
      </Button>
    );
  }

  // cart, with a label → a labeled add-to-cart button (visual options).
  if (cta.label) {
    return (
      <Button
        type="button"
        variant={cta.variant}
        showArrow={cta.showArrow}
        onClick={cta.onAddToCart}
        iconName="shopping-cart"
        size="sm"
        data-slot="product-card-cta"
        className={classNames?.cta}
      >
        {cta.label}
      </Button>
    );
  }

  // cart, no label → the compact icon-only add-to-cart button (default).
  return (
    <Button
      type="button"
      aria-label="Add to cart"
      onClick={cta.onAddToCart}
      data-slot="product-card-cta"
      size="icon"
      variant="ghost"
      className={cn(
        "flex h-(--product-card-cta-size) w-(--product-card-cta-size) items-center justify-center rounded-(--product-card-cta-radius) bg-foreground text-background transition-colors hover:bg-foreground/90",
        classNames?.cta,
      )}
    >
      <LibraryIcon name="plus" className="size-5" aria-hidden={true} />
    </Button>
  );
}

function ProductCardFooter({
  cta,
  currencySymbol,
  formattedPrice,
  title,
  url,
  classNames,
}: {
  cta: ResolvedProductCta;
  currencySymbol: string;
  formattedPrice: string | number | undefined;
  title?: TextSource;
  url?: string;
  classNames?: ProductCardClassNames;
}) {
  const showPriceRow = cta.showPrice && formattedPrice != null;
  const ctaNode = (
    <ProductCardCta
      cta={cta}
      currencySymbol={currencySymbol}
      formattedPrice={formattedPrice}
      title={title}
      url={url}
      classNames={classNames}
    />
  );
  // Nothing to paint — drop the row so a bare card doesn't reserve
  // empty footer space.
  if (!showPriceRow && cta.kind === "none") return null;

  return (
    <div
      data-slot="product-card-price-row"
      className={cn(
        "flex items-center justify-between",
        // No price → the CTA owns the row end; keep the layout stable
        // without painting a bare currency symbol.
        !showPriceRow && "justify-end",
        classNames?.priceRow,
      )}
    >
      {showPriceRow && (
        <TypographyH4
          data-slot="product-card-price"
          className={cn("text-foreground text-lg", classNames?.price)}
        >
          <span>{currencySymbol} </span>
          {formattedPrice}
        </TypographyH4>
      )}
      {ctaNode}
    </div>
  );
}

/**
 * Square product tile — image-heavy with a secondary image revealed on
 * hover. The canonical grid card.
 */
export function Default(props: ProductCardProps) {
  return <ProductTile {...props} compact={false} />;
}

/** Same as Default minus the secondary-image hover swap; tighter height. */
export function Compact(props: ProductCardProps) {
  return <ProductTile {...props} compact={true} />;
}

function ProductTile({
  compact,
  ...props
}: ProductCardProps & { compact: boolean }) {
  const {
    id,
    styles,
    isEditing,
    title,
    category,
    price,
    image1,
    image2,
    url,
    link,
    classNames,
    tokens,
    cssStyles,
    displayOptions,
    elevation,
    padding,
    mediaAspect,
    mediaFit,
  } = props;
  const href = resolveProductHref(url, link);
  const imageBoxAspect = parseOptionalCardMediaAspect(
    typeof mediaAspect === "string" ? mediaAspect : undefined,
  );
  const { currencySymbol } = useLocale();
  const cta = resolveCta(props);
  const priceValue = resolvePriceNumber(price);
  const formattedPrice = formatPrice(priceValue);
  const categoryField = resolveCategory(category);
  const showSecondaryImage = displayOptions?.showSecondaryImage ?? true;
  const forceSecondaryImage = displayOptions?.forceSecondaryImage ?? false;
  const { showRating, ratingMax, filledRating } = resolveRating(displayOptions);
  const priorityImage = displayOptions?.priorityImage ?? false;
  const titleText =
    typeof title === "string" ? title : title?.value || "Product image";

  return (
    <div
      data-slot="product-card-wrapper"
      style={buildWrapperStyle(tokens, cssStyles)}
    >
      <Card
        id={id}
        elevation={elevation ?? "lg"}
        padding={padding ?? "sm"}
        {...chromeProps(props)}
        data-slot="product-card"
        className={cn(
          "h-(--product-card-height) max-h-(--product-card-height) gap-0 rounded-(--product-card-radius) border-0 bg-background p-0 shadow-l",
          compact && "h-[380px] max-h-[380px]",
          classNames?.root,
          styles?.trimEnd(),
        )}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-(--product-card-radius)">
          <CardNavigate
            link={link ?? (href ? { href } : undefined)}
            isEditing={isEditing}
            data-slot="product-card-image-link"
            className={cn(
              "block",
              // A concrete aspect replaces the custom-property height;
              // otherwise the variable stays in charge exactly as before.
              imageBoxAspect
                ? MEDIA_ASPECT_CLASSES[imageBoxAspect]
                : "h-(--product-card-image-height)",
              classNames?.imageLink,
            )}
          >
            <div
              data-slot="product-card-image"
              className={cn(
                "group relative h-full w-full overflow-hidden rounded-t-(--product-card-radius) rounded-b-none bg-background-accent",
                classNames?.imageWrapper,
              )}
            >
              <Image
                value={image1}
                alt={titleText}
                className={cn(
                  "size-full",
                  mediaFitClass(mediaFit),
                  classNames?.image,
                )}
                priority={priorityImage}
                fill
              />
              {showSecondaryImage && !compact && image2 && (
                <Image
                  value={image2}
                  alt={titleText}
                  className={cn(
                    "absolute inset-0 z-5 size-full transition-opacity",
                    mediaFitClass(mediaFit),
                    // Hover-revealed by default. `forceSecondaryImage`
                    // pins it visible: a preview frame never hovers, so
                    // the second image is otherwise unreachable.
                    forceSecondaryImage
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100",
                    classNames?.imageSecondary,
                  )}
                  loading="lazy"
                  fill
                />
              )}
            </div>
          </CardNavigate>
          <div
            data-slot="product-card-content"
            className={cn(
              "flex h-(--product-card-content-height) flex-col justify-between px-4 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-6",
              compact && "px-4 py-4 lg:px-4 lg:py-4",
              classNames?.content,
            )}
          >
            <div className="flex flex-col gap-3">
              {categoryField && (
                <TypographySmall
                  data-slot="product-card-category"
                  className={cn(
                    "text-muted-foreground text-xs uppercase tracking-wide",
                    classNames?.category,
                  )}
                >
                  <Text value={categoryField} />
                </TypographySmall>
              )}
              <TypographyH4
                data-slot="product-card-title"
                className={cn(
                  "wrap-break-word line-clamp-2 font-body font-semibold text-lg",
                  compact && "text-base",
                  classNames?.title,
                )}
              >
                {withTitleLinkIcon(
                  <Text
                    value={title}
                    placeholder="Title"
                    isEditing={isEditing}
                  />,
                  props.titleLinkIcon,
                )}
              </TypographyH4>
              {showRating && !compact ? (
                <StarRating
                  max={ratingMax}
                  rating={filledRating}
                  className={classNames?.rating}
                />
              ) : null}
            </div>
            <ProductCardFooter
              cta={cta}
              currencySymbol={currencySymbol}
              formattedPrice={formattedPrice}
              title={title}
              url={href}
              classNames={classNames}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

/** Text-only summary tile — title + category + price, no image. */
export function Minimal(props: ProductCardProps) {
  const {
    id,
    styles,
    isEditing,
    title,
    category,
    price,
    classNames,
    tokens,
    cssStyles,
    elevation,
    padding,
  } = props;
  const { currencySymbol } = useLocale();
  const cta = resolveCta(props);
  const formattedPrice = formatPrice(resolvePriceNumber(price));
  const categoryField = resolveCategory(category);
  return (
    <div
      data-slot="product-card-wrapper"
      style={buildWrapperStyle(tokens, cssStyles)}
    >
      <Card
        id={id}
        elevation={elevation ?? "none"}
        padding={padding ?? "sm"}
        {...chromeProps(props)}
        className={cn(
          // Radius comes from the wrapper's `--product-card-radius`
          // (theme `--card-radius` driven) like every other variant —
          // a hardcoded `rounded-xl` here would tailwind-merge over the
          // Card primitive's token radius and pin square-chrome themes
          // to rounded corners. Shadow stays with the `elevation` axis.
          "rounded-(--product-card-radius) border bg-card p-4",
          classNames?.root,
          styles?.trimEnd(),
        )}
      >
        <TypographySmall className="text-muted-foreground uppercase tracking-wide">
          {categoryField ? <Text value={categoryField} /> : "Product"}
        </TypographySmall>
        <TypographyH4 className="wrap-break-word mt-2 line-clamp-2 text-xl">
          {withTitleLinkIcon(
            <Text value={title} placeholder="Title" isEditing={isEditing} />,
            props.titleLinkIcon,
          )}
        </TypographyH4>
        {cta.showPrice && formattedPrice != null && (
          <TypographyH4 className="mt-3 text-lg">
            <span>{currencySymbol} </span>
            {formattedPrice}
          </TypographyH4>
        )}
      </Card>
    </div>
  );
}

/** Side-by-side: image start, title + price + CTA end. */
export function HorizontalEssential(props: ProductCardProps) {
  return <HorizontalCard {...props} detailed={false} />;
}

/** HorizontalEssential plus short description + rating. */
export function HorizontalDetailed(props: ProductCardProps) {
  return <HorizontalCard {...props} detailed={true} />;
}

function HorizontalCard({
  detailed,
  ...props
}: ProductCardProps & { detailed: boolean }) {
  const {
    id,
    styles,
    isEditing,
    title,
    shortDescription,
    category,
    price,
    image1,
    url,
    link,
    classNames,
    tokens,
    cssStyles,
    displayOptions,
    elevation,
    padding,
    mediaFit,
  } = props;
  const href = resolveProductHref(url, link);
  const { currencySymbol } = useLocale();
  const cta = resolveCta(props);
  const formattedPrice = formatPrice(resolvePriceNumber(price));
  const categoryField = resolveCategory(category);
  const { showRating, ratingMax, filledRating } = resolveRating(displayOptions);
  const priorityImage = displayOptions?.priorityImage ?? false;
  const titleText =
    typeof title === "string" ? title : title?.value || "Product image";

  return (
    <div
      data-slot="product-card-wrapper"
      style={buildWrapperStyle(tokens, cssStyles)}
    >
      <Card
        id={id}
        elevation={elevation ?? "none"}
        padding={padding}
        {...chromeProps(props)}
        data-slot="product-card"
        className={cn(
          "overflow-hidden rounded-(--product-card-radius) border bg-background p-0 shadow-sm",
          classNames?.root,
          styles?.trimEnd(),
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
          <CardNavigate
            link={link ?? (href ? { href } : undefined)}
            isEditing={isEditing}
            data-slot="product-card-image-link"
            className="group relative block min-h-[190px] bg-background-accent"
          >
            <Image
              value={image1}
              alt={titleText}
              className={cn("size-full", mediaFitClass(mediaFit))}
              priority={priorityImage}
              fill
            />
          </CardNavigate>
          <div className="flex min-h-[190px] flex-col justify-between gap-4 p-5">
            <div className="space-y-2">
              {categoryField ? (
                <TypographySmall className="text-muted-foreground uppercase tracking-wide">
                  <Text value={categoryField} />
                </TypographySmall>
              ) : null}
              <TypographyH4 className="wrap-break-word line-clamp-2 font-body font-semibold text-xl">
                {withTitleLinkIcon(
                  <Text
                    value={title}
                    placeholder="Title"
                    isEditing={isEditing}
                  />,
                  props.titleLinkIcon,
                )}
              </TypographyH4>
              {detailed && shortDescription ? (
                <TypographyMuted className="line-clamp-2 leading-relaxed">
                  <Text value={shortDescription} />
                </TypographyMuted>
              ) : null}
              {detailed && showRating ? (
                <StarRating
                  max={ratingMax}
                  rating={filledRating}
                  className={classNames?.rating}
                />
              ) : null}
            </div>
            <ProductCardFooter
              cta={cta}
              currencySymbol={currencySymbol}
              formattedPrice={formattedPrice}
              title={title}
              url={href}
              classNames={classNames}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

/** Full PDP-style hero panel — title, description, price, CTA, info rows. */
export function DetailPanel(props: ProductCardProps) {
  const {
    id,
    styles,
    isEditing,
    title,
    shortDescription,
    price,
    classNames,
    tokens,
    cssStyles,
    elevation,
    padding,
  } = props;
  const { currencySymbol } = useLocale();
  const cta = resolveCta(props);
  const formattedPrice = formatPrice(resolvePriceNumber(price));
  return (
    <div
      data-slot="product-card-wrapper"
      style={buildWrapperStyle(tokens, cssStyles)}
    >
      <Card
        id={id}
        elevation={elevation ?? "none"}
        padding={padding}
        {...chromeProps(props)}
        data-slot="product-card"
        className={cn(
          "w-full rounded-none border border-border bg-muted/40 p-0 shadow-none",
          classNames?.root,
          styles?.trimEnd(),
        )}
      >
        <div className="p-10">
          <div className="space-y-5">
            <TypographyH4
              data-slot="product-card-title"
              className={cn(
                "wrap-break-word line-clamp-2 font-body font-bold text-5xl leading-none",
                classNames?.title,
              )}
            >
              {withTitleLinkIcon(
                <Text
                  value={title}
                  placeholder="Title"
                  isEditing={isEditing}
                />,
                props.titleLinkIcon,
              )}
            </TypographyH4>
            {shortDescription ? (
              <TypographyMuted className="max-w-2xl text-xl leading-relaxed">
                <Text value={shortDescription} />
              </TypographyMuted>
            ) : null}
          </div>

          {cta.showPrice && formattedPrice != null && (
            <div className="mt-8 border-border border-y py-6">
              <TypographyH4
                data-slot="product-card-price"
                className={cn("font-semibold text-3xl", classNames?.price)}
              >
                <span>{currencySymbol} </span>
                {formattedPrice}
              </TypographyH4>
            </div>
          )}

          {cta.kind !== "none" && (
            <div className="mt-8">
              {/* Themed CTA — the fill comes from `CtaVariant` (default
                  filled action color), not a hardcoded lime brand color;
                  corner radius is theme-token-only. */}
              <Button
                type="button"
                variant={cta.variant}
                showArrow={cta.showArrow}
                onClick={cta.onAddToCart}
                size="lg"
                data-slot="product-card-cta"
                className={cn("w-full", classNames?.cta)}
              >
                {cta.label ||
                  (cta.kind === "link" ? "Learn more" : "Add to cart")}
              </Button>
            </div>
          )}

          {/* Shop-only detail rows — only when the card is a cart tile. */}
          {cta.kind === "cart" && (
            <div className="mt-8 border-border border-t pt-6">
              <div className="space-y-4 text-xl">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto justify-start gap-3 p-0 text-start text-foreground/90 transition-colors hover:bg-transparent hover:text-foreground"
                >
                  <span>Returns and Warranty</span>
                  <LibraryIcon name="chevron-right" className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto justify-start gap-3 p-0 text-start text-foreground/90 transition-colors hover:bg-transparent hover:text-foreground"
                >
                  <span>Shipping Options</span>
                  <LibraryIcon name="chevron-right" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default Default;

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants (Headless, Media, etc.) fail to resolve. No runtime
 * behaviour change: the file stays a plain RSC server component
 * (no useState, no client-only hooks here); the universal marker
 * is purely a generate-map signal.
 */
export const componentType = "universal";
