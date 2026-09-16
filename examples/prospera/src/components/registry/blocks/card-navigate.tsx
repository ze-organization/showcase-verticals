"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import {
  getLinkHref,
  getLinkText,
} from "@/components/registry/primitives/editables/source-normalizers";
import { useSitecore } from "@/lib/registry/sitecore";

function useEditingFlag(isEditingProp?: boolean): boolean {
  const sitecore = useSitecore() as {
    page?: { mode?: { isEditing?: boolean } };
  };
  return isEditingProp ?? Boolean(sitecore?.page?.mode?.isEditing);
}

export interface CardNavigateProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /**
   * Sitecore Link field (or a loose `{ href }` shape). Published pages
   * wrap children in a plain `<a>` so the whole card is clickable
   * without nested anchors. Editing mode (and a missing href) skip the
   * wrap so inner field chrome stays clickable.
   */
  link?: LinkSource;
  /**
   * Pages editing. Falls back to `useSitecore().page.mode.isEditing`
   * so listing shells (title-only rows) do not have to thread the flag.
   */
  isEditing?: boolean;
  children: ReactNode;
}

/**
 * Whole-card click target that does not steal Pages field chrome.
 *
 * Cards historically unwrapped the Link field to `{ href }` and wrapped
 * the tile in `<Link>`. The Link primitive drops `children` when the
 * field has text, so the card collapsed to the CTA label, and inner
 * Name/Title/Bio slots were no longer bindable.
 *
 * @param link - Destination field. Empty / missing href skips the wrap.
 * @param isEditing - When true, children render unwrapped.
 * @returns Children, optionally wrapped in a plain `<a>`.
 */
export function CardNavigate({
  link,
  isEditing: isEditingProp,
  children,
  className,
  ...rest
}: CardNavigateProps) {
  const isEditing = useEditingFlag(isEditingProp);
  const href = getLinkHref(link, "");
  if (isEditing || !href) {
    return className ? <div className={className}>{children}</div> : children;
  }
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

export interface CardCtaProps {
  /** Sitecore Link field whose `text` is the CTA label. */
  link?: LinkSource;
  /** Label used when the field has no authored text. */
  fallback: string;
  /**
   * Pages editing. Falls back to `useSitecore().page.mode.isEditing`.
   */
  isEditing?: boolean;
  className?: string;
}

/**
 * Card CTA label that binds to the real Link field in Pages.
 *
 * Published: a `<span>` (the card's outer `<a>` from {@link CardNavigate}
 * is the click target — a nested `<a>` would be invalid). Editing: the
 * Link primitive with `placeholder` so authors can click "View profile"
 * / "View" and bind the field.
 *
 * @param link - Link field to bind.
 * @param fallback - Visible label when the field has no text.
 * @returns A span (published) or an editable Link (Pages).
 */
export function CardCta({
  link,
  fallback,
  isEditing: isEditingProp,
  className,
}: CardCtaProps) {
  const isEditing = useEditingFlag(isEditingProp);
  if (isEditing) {
    return (
      <Link
        value={link}
        placeholder={fallback}
        isEditing
        className={className}
      />
    );
  }
  return <span className={className}>{getLinkText(link) || fallback}</span>;
}
