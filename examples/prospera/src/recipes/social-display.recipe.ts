import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing `SocialShare`'s `Display` rendering parameter —
 * which parts of each platform button render. Lands at
 * `<enumerationsRoot>/Social/Social Display` per-site.
 *
 *   icons-only        Icon chips with sr-only labels + tooltips. The
 *                     compact classic share row; the default.
 *   labels-only       Accessible text-only links — no icon chip. The
 *                     platform name renders as neutral page text.
 *   icons-and-labels  Icon chip plus a visible platform-name label.
 *                     The ColorScheme tints the chip only; the label
 *                     stays neutral page text.
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "social-display@1"`.
 */
export const socialDisplayEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "social-display@1",
  name: "Social Display",
  displayName: "Social Display",
  description:
    "Which parts of each social-share platform button render: icon chips only (default), text-only labels, or icon chips with visible labels.",
  location: { scope: "site", folder: ["Social"] },
  default: "icons-only",
  values: [
    { name: "icons-only", displayName: "Icons Only" },
    { name: "labels-only", displayName: "Labels Only" },
    { name: "icons-and-labels", displayName: "Icons and Labels" },
  ],
} satisfies EnumerationRecipe;

export default socialDisplayEnumRecipe;
