import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `Action` rendering parameter on offer-card.
 *
 * Reference via `sitecore.enumHandle: "offer-action@1"`. Lands at
 * `<enumerationsRoot>/Card/OfferAction` per-site.
 */
export const offerActionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "offer-action@1",
  name: "OfferAction",
  displayName: "Offer Action",
  description:
    "Offer card action affordance: auto (link when a URL is present, else copy code), link, copy, or none.",
  location: { scope: "site", folder: ["Card"] },
  default: "auto",
  values: [
    { name: "auto", displayName: "Auto" },
    { name: "link", displayName: "Link" },
    { name: "copy", displayName: "Copy Code" },
    { name: "none", displayName: "None" },
  ],
} satisfies EnumerationRecipe;

export default offerActionEnumRecipe;
