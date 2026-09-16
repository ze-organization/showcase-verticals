import type * as React from "react";

export type IconSetId =
  | "lucide"
  | "heroicons"
  | "tabler"
  | "phosphor"
  | "mui"
  | "fontawesome";

export type IconStyle = "outline" | "solid";

export type LibraryIconComponent = React.ComponentType<{
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  "aria-label"?: string;
  "aria-hidden"?: React.AriaAttributes["aria-hidden"];
  "aria-busy"?: boolean;
}>;

/**
 * Shape exported by each non-default icon-set module under
 * `library-icon-sets/<set>.tsx`. The runtime master `library-icon.tsx`
 * dynamically imports these modules so each set's icon library lands in
 * its own webpack chunk and is only fetched when that set is active.
 */
export type IconSetModule = {
  outlineIcons: Record<string, LibraryIconComponent>;
  solidIcons?: Record<string, LibraryIconComponent>;
};
