import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `BottomContent` rendering parameter
 * on the `section-wrapper@1` component (and future siblings that
 * expose an optional bottom region).
 *
 *   - `none`      — no bottom region.
 *   - `button`    — render a CTA button driven by the recipe's `Link` field.
 *   - `subscribe` — render the inline subscribe form.
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "bottom-content@1"`.
 */
export const bottomContentEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "bottom-content@1",
  name: "BottomContent",
  displayName: "Bottom Content",
  description:
    "What to render in the optional bottom region of a section-wrapped component.",
  location: { scope: "site", folder: ["Layout", "Section Wrapper"] },
  default: "none",
  values: [
    { name: "none", displayName: "None" },
    { name: "button", displayName: "Button" },
    { name: "subscribe", displayName: "Subscribe" },
  ],
} satisfies EnumerationRecipe;

export default bottomContentEnumRecipe;
