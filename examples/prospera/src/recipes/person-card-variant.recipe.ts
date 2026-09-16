import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the grid-level `CardVariant` rendering parameter
 * on the persons renderings (`person-list-grid@1` /
 * `person-carousel@1`). Values match the `ALLOWED_CARD_VARIANTS` set the
 * `persons.sitecore.ts` adapter parses. Lands at
 * `<enumerationsRoot>/Card/PersonCardVariant` per-site.
 *
 * Reference via `sitecore.enumHandle: "person-card-variant@1"`.
 */
export const personCardVariantEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "person-card-variant@1",
  name: "PersonCardVariant",
  displayName: "Person Card Variant",
  description:
    "Card shape forwarded to every person/doctor card in a curated grid/carousel: default (headshot + name + role + bio), title-only, image-title-only, or overlay.",
  location: { scope: "site", folder: ["Card"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "title-only", displayName: "Title Only" },
    { name: "image-title-only", displayName: "Image + Title" },
    { name: "overlay", displayName: "Overlay" },
  ],
} satisfies EnumerationRecipe;

export default personCardVariantEnumRecipe;
