import type {
  ItemCardColorBand,
  ItemCardMediaBleed,
  ItemCardProps,
} from "@/components/registry/blocks/item-card";
import { ItemCard as Card } from "@/components/registry/blocks/item-card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/registry/primitives/core/avatar";
import { Rating } from "@/components/registry/primitives/core/rating";
import {
  TypographyH4,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import {
  getImageSrc,
  getSourceTextOrEmpty,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Review card — leaf rendering for the reviews family. Fields and
 * params map 1:1 to the `review-card@1` recipe via `withSitecore`'s
 * default convention map; extends `CmsProps` so `id` / `styles` /
 * `isEditing` are picked up automatically. No sibling `.sitecore.ts`
 * adapter — pure default convention.
 *
 * Two variants — each has a distinct DOM topology (see
 * [[feedback-variant-vs-parameter]]):
 *   - `Default`  avatar + rating + author + quote
 *   - `Quote`    pull-quote with attribution below
 */
export interface ReviewCardProps extends CmsProps {
  quote?: RichTextSource | TextSource;
  authorName?: TextSource;
  authorRole?: TextSource;
  authorImage?: ImageSource;
  /** Star rating 0–5. */
  rating?: number;
  /** Optional provenance label (e.g. "G2", "Trustpilot"). */
  source?: TextSource;
  /**
   * Show avatar inside the Default variant. Undefaulted so Sitecore
   * standard values drive the truthy state (see
   * [[feedback-no-react-defaults-for-sitecore-bool-params]]).
   */
  showImages?: boolean;

  // Chrome axes — pass-through to the Card shell. Ignored by the
  // `Quote` variant (bare blockquote, no chrome).
  elevation?: ItemCardProps["elevation"];
  padding?: ItemCardProps["padding"];
  style?: ItemCardProps["style"];
  cardColorScheme?: ItemCardProps["colorScheme"];
  colorBand?: ItemCardColorBand;
  mediaBleed?: ItemCardMediaBleed;
}

type ReviewChrome = Pick<
  ReviewCardProps,
  | "elevation"
  | "padding"
  | "style"
  | "cardColorScheme"
  | "colorBand"
  | "mediaBleed"
>;

function pickChrome(props: ReviewCardProps): ReviewChrome {
  return {
    elevation: props.elevation,
    padding: props.padding,
    style: props.style,
    cardColorScheme: props.cardColorScheme,
    colorBand: props.colorBand,
    mediaBleed: props.mediaBleed,
  };
}

function isRichTextValue(
  value: RichTextSource | TextSource | undefined,
): value is RichTextSource {
  return typeof value === "object" && value !== null;
}

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??"
  );
}

function wrapInCard(
  id: string | undefined,
  styles: string | undefined,
  className: string | undefined,
  chrome: ReviewChrome,
  children: React.ReactNode,
) {
  return (
    <Card
      id={id}
      elevation={chrome.elevation ?? "sm"}
      padding={chrome.padding ?? "sm"}
      style={chrome.style ?? "outline"}
      colorScheme={chrome.cardColorScheme}
      colorBand={chrome.colorBand}
      mediaBleed={chrome.mediaBleed}
      className={cn(
        // No radius/shadow classes: radius flows from the Card
        // primitive's `--card-radius` token and shadow from the
        // `elevation` axis (defaulted to "sm" above) — hardcoding
        // either would tailwind-merge over the theme-driven values.
        "h-full gap-4 bg-background p-4 text-foreground sm:p-6",
        styles?.trimEnd(),
        className,
      )}
    >
      {children}
    </Card>
  );
}

function wrapBare(
  id: string | undefined,
  styles: string | undefined,
  className: string | undefined,
  children: React.ReactNode,
) {
  return (
    <div id={id} className={cn(styles?.trimEnd(), className)}>
      {children}
    </div>
  );
}

/**
 * Default variant — avatar + name + role + rating + quote.
 *
 * Exported as a separate function so the wrapping `Default` and the
 * `Quote` variant can re-use the body without forcing a card-style
 * dispatcher into the leaf.
 */
function DefaultBody({
  quote,
  authorName,
  authorRole,
  authorImage,
  rating,
  showImages,
  isEditing,
}: ReviewCardProps) {
  const name = getSourceTextOrEmpty(authorName);
  const initials = initialsOf(name);
  // `showImages=false` hides the avatar's *image* but the initials
  // fallback still renders — preserves the visual anchor for the
  // reviewer's identity without forcing an image.
  const avatarSrc = showImages === false ? null : getImageSrc(authorImage);
  const ratingValue =
    rating != null ? Math.min(5, Math.max(0, rating)) : undefined;

  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={avatarSrc ?? ""} alt={name || "Avatar"} />
          <AvatarFallback delayMs={0}>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <TypographyH4 className="text-base">
            <Text
              value={authorName}
              tag="span"
              placeholder="Author"
              isEditing={isEditing}
            />
          </TypographyH4>
          {(authorRole || isEditing) && (
            <TypographyMuted className="text-sm">
              <Text
                value={authorRole}
                tag="span"
                placeholder="Role"
                isEditing={isEditing}
              />
            </TypographyMuted>
          )}
        </div>
      </div>
      {ratingValue != null && <Rating rating={ratingValue} />}
      <div className="wrap-break-word min-w-0 font-normal text-muted-foreground">
        {typeof quote === "string" ? (
          <TypographyMuted className="text-inherit">{quote}</TypographyMuted>
        ) : isRichTextValue(quote) ? (
          <RichText value={quote} placeholder="Quote" isEditing={isEditing} />
        ) : null}
      </div>
    </>
  );
}

export function Default(props: ReviewCardProps) {
  const { id, styles } = props;
  return wrapInCard(
    id,
    styles,
    undefined,
    pickChrome(props),
    <DefaultBody {...props} />,
  );
}

export function Quote(props: ReviewCardProps) {
  const { id, styles, authorName, quote, isEditing } = props;
  return wrapBare(
    id,
    styles,
    undefined,
    <blockquote className="flex flex-col gap-4">
      {(authorName || isEditing) && (
        <footer className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
          <Text
            value={authorName}
            tag="cite"
            placeholder="Author"
            isEditing={isEditing}
          />
        </footer>
      )}
      <div className="font-heading font-normal text-base text-foreground tracking-tight md:text-lg">
        {typeof quote === "string" ? (
          <TypographyMuted className="text-base text-foreground md:text-lg">
            {quote}
          </TypographyMuted>
        ) : isRichTextValue(quote) ? (
          <RichText value={quote} placeholder="Quote" isEditing={isEditing} />
        ) : null}
      </div>
    </blockquote>,
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
