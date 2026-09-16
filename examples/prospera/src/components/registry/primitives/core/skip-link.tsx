"use client";

import * as React from "react";
import { cn } from "@/lib/registry/cn";

export interface SkipLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Target ID of the main content region (e.g. "main-content"). The
   *  link `href` becomes `#${targetId}`. The matching element MUST exist
   *  on the page; the registry's layout shell uses `id="main-content"`. */
  targetId: string;
  children?: React.ReactNode;
}

/**
 * "Skip to main content" (or custom target) link for accessibility.
 * Place as the first focusable element in the layout. Typically styled to appear only on focus.
 */
const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  function SkipLink(
    { targetId, className, children = "Skip to main content", ...props },
    ref,
  ) {
    return (
      <a
        ref={ref}
        data-slot="skip-link"
        href={`#${targetId}`}
        className={cn(
          "sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-100 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary",
          className,
        )}
        {...props}
      >
        {children}
      </a>
    );
  },
);
SkipLink.displayName = "SkipLink";

export { SkipLink };
