import { TypographyMuted } from "@/components/registry/primitives/core/typography";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import { RichText } from "@/components/registry/primitives/editables/richtext";
import {
  isEmptySource,
  isStringSource,
} from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";

export interface TextOrRichTextProps {
  /**
   * Description copy. Layout-service may deliver this as a Sitecore
   * `TextField`-backed string, a structured `RichTextField`, or a raw
   * pre-trusted HTML string. The helper picks the right path so each
   * banner/hero variant body doesn't repeat the dispatch.
   */
  value: TextSource | RichTextSource | undefined;
  /**
   * Class applied to the `<TypographyMuted>` wrapper when `value`
   * resolves to plain text. Use this to thread surface-tone overrides
   * (e.g. `text-inherit` over a background image).
   */
  textClassName?: string;
  /**
   * Class applied to the `<RichText>` wrapper when `value` is
   * structured rich text. Use this for prose tweaks like `[&_p]:mb-2`
   * so the rich-text paragraphs match the banner's spacing rhythm.
   */
  richTextClassName?: string;
}

/**
 * Dispatch helper for the hero/banner family's `description` slot.
 * Renders plain text via `<TypographyMuted>` and structured rich text
 * via `<RichText>` (which wraps in `<Prose>` for typography). Returns
 * `null` when the source is empty so the caller doesn't need to gate
 * the wrapping `<div>`.
 *
 * Server-safe — both downstream renderers are server-renderable; the
 * `RichText` editable handles its own SDK-edit detection internally.
 */
export function TextOrRichText({
  value,
  textClassName,
  richTextClassName,
}: TextOrRichTextProps) {
  if (value == null || isEmptySource(value)) return null;
  if (isStringSource(value)) {
    return <TypographyMuted className={textClassName}>{value}</TypographyMuted>;
  }
  return <RichText value={value} className={richTextClassName} />;
}
