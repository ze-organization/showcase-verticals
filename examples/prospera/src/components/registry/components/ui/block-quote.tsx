import {
  accentLineColorClasses,
  parseAccentLineColor,
} from "@/components/registry/blocks/section-heading.parsers";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Flat props delivered by `withSitecore`'s default convention:
 * `fields.Quote` → `quote`, `fields.Attribution` → `attribution`,
 * `fields.Source` → `source`, `params.AccentColor` → `accentColor`.
 */
export interface BlockQuoteProps extends CmsProps {
  /** The quotation. Multi-line text — line breaks are preserved. */
  quote?: TextSource;
  /** Who said it (e.g. "Ada Lovelace"). */
  attribution?: TextSource;
  /** Optional role / source line (e.g. "CTO, Contoso" or a publication). */
  source?: TextSource;
  /**
   * Color of the inline-start accent border (color-scheme@1).
   * Defaults to `accent`.
   */
  accentColor?: string;
}

/**
 * Editorial pull quote: large quote text over an inline-start accent
 * border (logical — flips under RTL), with a muted attribution line
 * below. The border color is authorable via the `AccentColor` param.
 *
 * Returns `null` outside editing mode when there's no quote.
 */
export function Default({
  quote,
  attribution,
  source,
  accentColor,
  styles,
  id,
  isEditing,
}: BlockQuoteProps) {
  const hasQuote = quote != null && !isEmptySource(quote);
  const hasAttribution = attribution != null && !isEmptySource(attribution);
  const hasSource = source != null && !isEmptySource(source);
  if (!hasQuote && !isEditing) return null;

  // Reuse the shared AccentLineColor vocabulary — its `divider` slot
  // is exactly the `border-<role>` class this border needs. Explicit
  // `accent` fallback keeps the border visibly branded when the param
  // is unset ("" from the map's `default` would leave the page's plain
  // border color).
  const borderClass =
    accentLineColorClasses(parseAccentLineColor(accentColor, "accent"))
      .divider || "border-accent";

  return (
    <figure
      className={cn("component block-quote w-full", styles?.trimEnd())}
      id={id}
      dir="inherit"
      data-slot="block-quote"
    >
      <blockquote
        className={cn("border-s-4 ps-6 md:ps-8", borderClass)}
        data-slot="block-quote-quote"
      >
        <p className="whitespace-pre-line font-heading text-2xl text-foreground leading-snug tracking-tight md:text-3xl">
          <Text
            value={quote}
            tag="span"
            placeholder="Quote"
            isEditing={isEditing}
          />
        </p>
      </blockquote>
      {/* Attribution sits OUTSIDE the <blockquote> (a quotation must
          not contain its own citation) but inside the <figure>,
          indented to align with the quote text. */}
      {hasAttribution || hasSource || isEditing ? (
        <figcaption className="mt-4 ps-6 text-muted-foreground text-sm md:ps-8">
          {hasAttribution || isEditing ? (
            <span className="font-medium text-foreground">
              <Text
                value={attribution}
                tag="span"
                placeholder="Attribution"
                isEditing={isEditing}
              />
            </span>
          ) : null}
          {hasSource || isEditing ? (
            <span className="block">
              <Text
                value={source}
                tag="span"
                placeholder="Role / source"
                isEditing={isEditing}
              />
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates — Pages chrome resolves named-export variants
 * client-side. See content-block.tsx for the full rationale.
 */
export const componentType = "universal";
