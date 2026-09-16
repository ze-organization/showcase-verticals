import type * as React from "react";

import { iconByName } from "./icon-vocabulary";

/**
 * `NamedIcon` — renders a crisp vector icon from the curated named-icon
 * vocabulary (see [icon-vocabulary.ts](./icon-vocabulary.ts)), so
 * AI-composed content can bind icons by semantic NAME ("bill",
 * "outage", "sign-in") instead of scraped image URLs.
 *
 * Accessibility: pass `label` when the icon carries meaning on its own
 * (it becomes `role="img"` + `aria-label`); omit it when the icon is
 * decorative next to visible text (rendered `aria-hidden`).
 *
 * Unknown or empty names render nothing — never a crash, never a broken
 * glyph — so callers can layer their own fallback (quick-links-tiles
 * falls back to its image `Icon` field).
 */

export interface NamedIconProps {
  /** Kebab-case vocabulary name, e.g. `"bill"`, `"arrow-right"`. */
  name?: string | null;
  /** Rendered square size in px. Defaults to 24. */
  size?: number;
  /**
   * Accessible label. When set the icon is announced (`role="img"`);
   * when omitted the icon is `aria-hidden` (decorative).
   */
  label?: string;
  className?: string;
  /** Stroke width forwarded to the lucide icon (default 2). */
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export function NamedIcon({
  name,
  size = 24,
  label,
  className,
  strokeWidth,
  style,
}: NamedIconProps) {
  const Icon = iconByName(name);
  if (!Icon) return null;
  return (
    <Icon
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      style={style}
      data-slot="named-icon"
      data-icon={name?.trim().toLowerCase()}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
