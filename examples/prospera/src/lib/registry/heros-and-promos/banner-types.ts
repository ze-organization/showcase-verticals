import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import {
  getNonEmptySource,
  isEmptySource as isEmptySourceValue,
} from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

/** Shared banner field shape (title/heading, description, optional CTA, optional email placeholder). */
export interface BannerFields {
  /** Main heading (alias: Title) */
  Title?: TextSource;
  /** For text-banner compatibility */
  Heading?: TextSource;
  Description?: RichTextSource | TextSource;
  /** Optional background image (full-bleed option shared by banner variants). */
  Image?: ImageSource;
  /** Optional hero background video source. */
  Video?: ImageSource;
  Link?: LinkSource;
  /** Optional hero CTA link alias. */
  CtaLink?: LinkSource;
  /** Subscription: CTA link */
  ButtonLink?: LinkSource;
  /** Subscription: email input placeholder */
  EmailPlaceholder?: TextSource;
  /** Subscription: optional consent copy below email form */
  ConsentText?: RichTextSource | TextSource;
  // ---- Subscription-banner expanded vocabulary (mirrors subscribe-section)
  SuccessMessage?: TextSource;
  ErrorMessage?: TextSource;
  NameLabel?: TextSource;
  NamePlaceholder?: TextSource;
  /** Sitecore string-boolean ("1" / "true" for on). */
  NameRequired?: TextSource | string;
  EmailLabel?: TextSource;
  /** Sitecore string-boolean. */
  EmailRequired?: TextSource | string;
  /** Sitecore string-boolean. */
  ConsentRequired?: TextSource | string;
  SubmitText?: TextSource;
  SubmitAction?: TextSource;
  SubmitMethod?: TextSource;
  /** Legacy promo fields normalized into banner. */
  PromoImageOne?: ImageSource;
  PromoImageTwo?: ImageSource;
  PromoImageThree?: ImageSource;
  PromoTitle?: TextSource;
  PromoDescription?: RichTextSource | TextSource;
  PromoSubTitle?: TextSource;
  PromoMoreInfo?: LinkSource;
}

export interface BannerBlockProps extends ComponentProps {
  fields: BannerFields;
}

export function isEmptySource(
  value: TextSource | RichTextSource | LinkSource | ImageSource | undefined,
): boolean {
  return isEmptySourceValue(value);
}

export function getTitle(fields: BannerFields): TextSource | undefined {
  // First non-empty of Title/Heading. Resolving each side independently
  // avoids a blank Title masking a valid Heading via `??`.
  return getNonEmptySource(fields?.Title) ?? getNonEmptySource(fields?.Heading);
}
