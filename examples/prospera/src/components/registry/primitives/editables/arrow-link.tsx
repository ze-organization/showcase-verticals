import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import * as React from "react";
import { cn } from "@/lib/registry/cn";
import { Link as LinkPrimitive, type LinkProps } from "./link";

// `group` lets the trailing arrow respond to wrapper hover via
// `group-hover:translate-x-1` — the classic editorial "Read more →"
// nudge. Subtle, ~150ms, signals affordance without re-styling the
// text. RTL flips the nudge direction via `rtl:group-hover:-translate-x-1`.
const ARROW_LINK_BASE =
  "group inline-flex items-center gap-3 pb-0.5 leading-8 font-semibold no-underline hover:no-underline";
const ARROW_LINK_BORDER = "border-b border-current";
const ARROW_ICON_CLASSES =
  "size-4 shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1";

export interface ArrowLinkProps extends Omit<LinkProps, "children"> {
  /** Override the trailing icon. Defaults to lucide `ArrowRight`. */
  icon?: ReactNode;
  /** Suppress the bottom border (text-only arrow link). */
  hideBorder?: boolean;
}

/**
 * Editorial "Read more →" link. Composes the Link primitive with an
 * inline trailing arrow icon and a `border-current`-keyed bottom rule
 * so the chrome inherits text color automatically.
 *
 * The arrow ships as JSX (no global `[data-arrow-button]` CSS hook)
 * so the editorial treatment installs cohesively in every downstream
 * project. Themes or call-sites can swap the icon via the `icon` prop.
 */
export const ArrowLink = React.forwardRef<HTMLAnchorElement, ArrowLinkProps>(
  ({ icon, hideBorder, className, value, ...rest }, ref) => {
    const arrow = icon ?? (
      <ArrowRight className={ARROW_ICON_CLASSES} aria-hidden />
    );
    // Ride the Link's `after` adornment slot rather than passing the arrow
    // as children: the Link resolves its own text from `value`, and any
    // children are dropped once that authored text exists — which would
    // silently swallow the arrow for every populated link. `after` renders
    // unconditionally, so the arrow survives.
    return (
      <LinkPrimitive
        ref={ref}
        value={value}
        className={cn(
          ARROW_LINK_BASE,
          !hideBorder && ARROW_LINK_BORDER,
          className,
        )}
        after={arrow}
        {...rest}
      />
    );
  },
);
ArrowLink.displayName = "ArrowLink";
