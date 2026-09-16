import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the link-list `ItemStyle` rendering
 * parameter — how each link row renders its content. Lands at
 * `<enumerationsRoot>/Navigation/ItemStyle` per-site.
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "item-style@1"`.
 *
 * `text` (the default) keeps the plain text-link row. `icon-led`
 * renders each entry's `IconName` (`icon-name@1` vocabulary) as a
 * leading vector icon plus the optional per-item `Description` — the
 * treatment the IconLed variant draws, made available inside other
 * layouts (MultiColumn columns, NavList rows). Rows without an
 * IconName degrade to text-only. No enum-level default: the
 * referencing param declares its own (`text`).
 */
export const itemStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "item-style@1",
  name: "ItemStyle",
  displayName: "Item Style",
  description:
    "How each link row renders: `text` (plain text link — the default) or `icon-led` (each row leads with its IconName vector icon plus the optional per-item Description; rows without an icon degrade to text).",
  location: { scope: "site", folder: ["Navigation"] },
  values: [
    { name: "text", displayName: "Text" },
    { name: "icon-led", displayName: "Icon-Led" },
  ],
} satisfies EnumerationRecipe;

export default itemStyleEnumRecipe;
