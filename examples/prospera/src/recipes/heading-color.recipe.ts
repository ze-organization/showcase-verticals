import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `HeadingColor` rendering parameter —
 * a text-color override for the heading slot, distinct from
 * `color-scheme@1` (which is a paired bg + foreground surface tone).
 * Lands at `<enumerationsRoot>/Layout/Heading/HeadingColor` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "heading-color@1"`. Values map to the "role text on page"
 * composition from the `color-roles` skill — `text-<role>` only,
 * never `text-<role>-foreground` (which is reserved for text inside a
 * matching solid surface and breaks the moment a brand reweights the
 * role). `default` keeps the inherited `text-foreground`.
 */
export const headingColorEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "heading-color@1",
  name: "HeadingColor",
  displayName: "Heading Color",
  description:
    "Heading text color override. Resolves to text-<role>. `default` inherits the page foreground; `none` inherits the surrounding surface; `white`/`black` are fixed theme literals that ignore the brand palette.",
  location: { scope: "site", folder: ["Layout", "Heading"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    // Surface-neutral picks, mirroring `color-scheme@1`'s vocabulary.
    // `none` takes the surrounding surface's color rather than the page
    // foreground; black/white are the fixed theme literals (same policy
    // as the overlay header and the app-store badge) for headings that
    // must stay black-on-light / white-on-dark whatever the brand does.
    { name: "none", displayName: "None (inherit surface)" },
    { name: "white", displayName: "White" },
    { name: "black", displayName: "Black" },
    { name: "primary", displayName: "Primary" },
    { name: "secondary", displayName: "Secondary" },
    { name: "tertiary", displayName: "Tertiary" },
    { name: "accent", displayName: "Accent" },
    { name: "accent-2", displayName: "Accent 2" },
    { name: "accent-3", displayName: "Accent 3" },
    { name: "muted", displayName: "Muted" },
    { name: "success", displayName: "Success" },
    { name: "warning", displayName: "Warning" },
    { name: "info", displayName: "Info" },
    { name: "destructive", displayName: "Destructive" },
  ],
} satisfies EnumerationRecipe;

export default headingColorEnumRecipe;
