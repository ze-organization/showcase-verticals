import type {
  ItemCardColorBand,
  ItemCardMediaBleed,
  ItemCardProps,
  ItemCardTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import {
  ItemCard as Card,
  ItemCardContent as CardContent,
  withTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import { Badge } from "@/components/registry/primitives/core/badge";
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
  getSourceTextOrEmpty,
  hasSourceText,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { parseBoolParam } from "@/lib/registry/param-parsers";
import type { CmsProps } from "@/lib/registry/sitecore";
import {
  type CardMediaAspect,
  MEDIA_ASPECT_CLASSES,
  parseOptionalCardMediaAspect,
} from "./_media-aspect";

/**
 * `LocationCard` — leaf card rendering for the locations family. Drops
 * into the `cards-locations-{*}` placeholder exposed by the
 * locations-list-grid / locations-carousel parents (composed mode), or
 * lands as a curated Treelist target in their datasources.
 *
 * Sitecore-agnostic: flat editable-typed props. The four variants map
 * to separate named function exports (per the rendering-variant
 * convention — different DOM topology, not a discriminator prop):
 *
 *   - `Default` — full address card with image, full address, phone,
 *     email, hours, and CTA. Distance pill in the top-end corner.
 *   - `Compact` — image + name + distance + single CTA. Tighter lists
 *     and map-result sidebars.
 *   - `Inline`  — single horizontal row: name + city/state + distance
 *     + CTA. No image.
 *   - `Pin`     — minimal marker label for map popups: name +
 *     single-line address. No image, no CTA.
 *
 * `distance` + `distanceUnit` arrive from the search controller's
 * location filter via `extras.distance` on the FlatItem; when present
 * the variants surface a `<Badge>` showing e.g. "0.8 mi".
 */

export interface LocationCardProps extends CmsProps {
  /** Location name (e.g. "Downtown branch"). */
  name?: TextSource;
  address1?: TextSource;
  address2?: TextSource;
  city?: TextSource;
  state?: TextSource;
  postalCode?: TextSource;
  country?: TextSource;
  phone?: TextSource;
  email?: TextSource;
  /** Variable opening schedule, rendered as rich text. */
  hours?: RichTextSource;
  image?: ImageSource;
  /** Usually "Get directions" or a detail-page link. */
  link?: LinkSource;
  latitude?: number;
  longitude?: number;

  /**
   * Distance from the search origin. Supplied by the search controller's
   * location filter via `extras.distance`; absent when there's no
   * origin to measure from.
   */
  distance?: number;
  /** Unit for the distance pill. */
  distanceUnit?: "mi" | "km";
  /**
   * `ShowDistance` rendering parameter — hides the distance pill when
   * explicitly off. Undefined means "show when a distance exists"
   * (Sitecore Standard Values drives the initial state; arrives as a
   * "1"/"0" string via the convention map).
   */
  showDistance?: boolean | string;

  // Chrome axes — pass-through to the shared ItemCard shell. Honored
  // by `Default` and `Compact`; `Inline` and `Pin` don't use Card.
  elevation?: ItemCardProps["elevation"];
  padding?: ItemCardProps["padding"];
  style?: ItemCardProps["style"];
  cardColorScheme?: ItemCardProps["colorScheme"];
  colorBand?: ItemCardColorBand;
  titleLinkIcon?: ItemCardTitleLinkIcon;
  mediaBleed?: ItemCardMediaBleed;
  /**
   * `media-aspect@1` — reshapes the Default variant's hero box, which
   * is otherwise a fixed 16:9. `auto`/unset keeps that, so an untouched
   * placement is unchanged. The Compact row's 64px avatar is a fixed
   * thumbnail, not a media box, and ignores this.
   */
  mediaAspect?: CardMediaAspect | string;

  /**
   * Escape hatch — extra className applied to the outermost
   * element of every variant. `CmsProps.styles` is the preferred
   * SXA-driven channel; `className` stays for direct callers passing
   * Tailwind overrides.
   */
  className?: string;
}

const textValue = getSourceTextOrEmpty;
const hasText = hasSourceText;

const formatDistance = (
  distance: number | undefined,
  unit: "mi" | "km" | undefined,
): string | null => {
  if (distance == null || Number.isNaN(distance)) return null;
  const u = unit ?? "mi";
  // One decimal is the convention used by search-result location pills;
  // exact integers drop the trailing ".0".
  const rounded = Math.round(distance * 10) / 10;
  const text = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
  return `${text} ${u}`;
};

/**
 * Swap the variant's own media sizing for a concrete `media-aspect@1`
 * box. `auto`/unset/unrecognised keep the variant's class untouched, so
 * a placement that never sets it renders exactly as before.
 */
function mediaBoxClass(
  mediaAspect: CardMediaAspect | string | undefined,
  fallback: string,
): string {
  const aspect = parseOptionalCardMediaAspect(
    typeof mediaAspect === "string" ? mediaAspect : undefined,
  );
  return aspect ? MEDIA_ASPECT_CLASSES[aspect] : fallback;
}

function DistancePill({
  distance,
  distanceUnit,
  showDistance,
  className,
}: Pick<LocationCardProps, "distance" | "distanceUnit" | "showDistance"> & {
  className?: string;
}) {
  if (!parseBoolParam(showDistance, true)) return null;
  const label = formatDistance(distance, distanceUnit);
  if (!label) return null;
  return (
    <Badge
      variant="rounded"
      size="sm"
      colorScheme="neutral"
      className={className}
    >
      {label}
    </Badge>
  );
}

function CityState({
  city,
  state,
  className,
}: Pick<LocationCardProps, "city" | "state"> & { className?: string }) {
  const cityText = textValue(city);
  const stateText = textValue(state);
  if (!cityText && !stateText) return null;
  return (
    <span className={cn("text-muted-foreground text-sm", className)}>
      {cityText}
      {cityText && stateText ? ", " : ""}
      {stateText}
    </span>
  );
}

function AddressBlock({
  address1,
  address2,
  city,
  state,
  postalCode,
  country,
}: Pick<
  LocationCardProps,
  "address1" | "address2" | "city" | "state" | "postalCode" | "country"
>) {
  const cityLine = [textValue(city), textValue(state)]
    .filter(Boolean)
    .join(", ");
  const cityZip = [cityLine, textValue(postalCode)].filter(Boolean).join(" ");
  return (
    <address className="text-muted-foreground text-sm not-italic leading-relaxed">
      {hasText(address1) ? (
        <div>
          <Text value={address1} />
        </div>
      ) : null}
      {hasText(address2) ? (
        <div>
          <Text value={address2} />
        </div>
      ) : null}
      {cityZip ? <div>{cityZip}</div> : null}
      {hasText(country) ? (
        <div>
          <Text value={country} />
        </div>
      ) : null}
    </address>
  );
}

/**
 * Full address card. Image (optional), name as TypographyH4, full
 * multiline address, phone/email contact lines, hours, CTA, distance
 * pill in the top-end corner.
 */
export function Default({
  id,
  styles,
  name,
  address1,
  address2,
  city,
  state,
  postalCode,
  country,
  phone,
  email,
  hours,
  image,
  link,
  distance,
  distanceUnit,
  showDistance,
  className,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  mediaAspect,
}: LocationCardProps) {
  const phoneText = textValue(phone);
  const emailText = textValue(email);
  return (
    <Card
      id={id}
      style={style ?? "outline"}
      elevation={elevation ?? "xs"}
      padding={padding ?? "md"}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      titleLinkIcon={titleLinkIcon}
      mediaBleed={mediaBleed}
      className={cn(
        "relative flex w-full min-w-0 flex-col overflow-hidden",
        className,
        styles?.trimEnd(),
      )}
    >
      <DistancePill
        distance={distance}
        distanceUnit={distanceUnit}
        showDistance={showDistance}
        className="absolute end-3 top-3 z-10"
      />
      {image ? (
        <div
          className={cn(
            "relative -mx-5 -mt-5 mb-4 overflow-hidden bg-muted",
            mediaBoxClass(mediaAspect, "aspect-[16/9]"),
          )}
        >
          <Image
            value={image}
            fill
            alt={textValue(name) || "Location"}
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <CardContent className="flex min-w-0 flex-col gap-3 p-0 text-start">
        <TypographyH4 className="wrap-break-word min-w-0 text-pretty">
          {withTitleLinkIcon(<Text value={name} />, titleLinkIcon)}
        </TypographyH4>
        <AddressBlock
          address1={address1}
          address2={address2}
          city={city}
          state={state}
          postalCode={postalCode}
          country={country}
        />
        {phoneText || emailText ? (
          <div className="flex flex-col gap-1 text-sm">
            {phoneText ? (
              <a
                href={`tel:${phoneText.replace(/[^+\d]/g, "")}`}
                className="text-primary hover:underline"
              >
                {phoneText}
              </a>
            ) : null}
            {emailText ? (
              <a
                href={`mailto:${emailText}`}
                className="text-primary hover:underline"
              >
                {emailText}
              </a>
            ) : null}
          </div>
        ) : null}
        {hours ? (
          <div>
            <TypographySmall className="mb-1 block font-semibold text-muted-foreground text-xs uppercase tracking-wide">
              Hours
            </TypographySmall>
            <div className="text-muted-foreground text-sm">
              <RichText value={hours} />
            </div>
          </div>
        ) : null}
        {link ? (
          <div className="mt-2">
            <Link value={link} className="font-medium text-primary text-sm">
              Get directions
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * Compact card. Image + name + distance + single CTA. For tighter
 * lists and map-result sidebars.
 */
export function Compact({
  id,
  styles,
  name,
  city,
  state,
  image,
  link,
  distance,
  distanceUnit,
  showDistance,
  className,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
}: LocationCardProps) {
  return (
    <Card
      id={id}
      style={style ?? "outline"}
      elevation={elevation ?? "none"}
      padding={padding ?? "sm"}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      titleLinkIcon={titleLinkIcon}
      mediaBleed={mediaBleed}
      className={cn(
        "flex w-full min-w-0 items-center gap-3 text-start",
        className,
        styles?.trimEnd(),
      )}
    >
      {image ? (
        <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
          <Image
            value={image}
            fill
            alt={textValue(name) || "Location"}
            sizes="64px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <TypographyH4 className="min-w-0 truncate text-base">
            {withTitleLinkIcon(<Text value={name} />, titleLinkIcon)}
          </TypographyH4>
          <DistancePill
            distance={distance}
            distanceUnit={distanceUnit}
            showDistance={showDistance}
          />
        </div>
        <CityState city={city} state={state} className="truncate" />
        {link ? (
          <Link value={link} className="font-medium text-primary text-sm">
            Get directions
          </Link>
        ) : null}
      </div>
    </Card>
  );
}

/**
 * Inline row. Single horizontal row — name + city/state + distance +
 * CTA. No image. Best for tight lists.
 */
export function Inline({
  name,
  city,
  state,
  link,
  distance,
  distanceUnit,
  showDistance,
  titleLinkIcon,
  className,
}: LocationCardProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center justify-between gap-3 border-border border-b py-2 text-start last:border-b-0",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 truncate font-medium text-sm">
          {withTitleLinkIcon(<Text value={name} />, titleLinkIcon)}
        </span>
        <CityState city={city} state={state} className="truncate" />
        <DistancePill
          distance={distance}
          distanceUnit={distanceUnit}
          showDistance={showDistance}
        />
      </div>
      {link ? (
        <Link
          value={link}
          className="shrink-0 font-medium text-primary text-sm"
        >
          Get directions
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Pin marker label — name + single-line address. Sized for map popups.
 * No image, no CTA.
 */
export function Pin({
  name,
  address1,
  city,
  state,
  postalCode,
  titleLinkIcon,
  className,
}: LocationCardProps) {
  const cityLine = [textValue(city), textValue(state)]
    .filter(Boolean)
    .join(", ");
  const oneLiner = [textValue(address1), cityLine, textValue(postalCode)]
    .filter(Boolean)
    .join(" · ");
  return (
    <div
      className={cn(
        "inline-block max-w-xs rounded-(--card-radius,var(--radius-md)) border border-border bg-background px-3 py-2 text-start shadow-sm",
        className,
      )}
    >
      <div className="wrap-break-word font-semibold text-sm leading-tight">
        {withTitleLinkIcon(<Text value={name} />, titleLinkIcon)}
      </div>
      {oneLiner ? (
        <TypographyMuted className="mt-0.5 text-xs">{oneLiner}</TypographyMuted>
      ) : null}
    </div>
  );
}

export default Default;

export const componentType = "universal";
