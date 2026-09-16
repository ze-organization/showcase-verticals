import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * How the card-block's media slot is sized + placed relative to the
 * card padding. Authored as a dropdown rather than a boolean so the
 * shape can grow more treatments later (e.g. side-bleed, banner,
 * outset overlap) without breaking existing content.
 *
 *   - `fullbleed`  image extends to the card edges, ignoring padding (default)
 *   - `none`       image inset inside the padded content area — the
 *                  editorial opt-out from the edge-to-edge default
 *   - `icon`       small ~6rem image at the top of the card —
 *                  decorative, not the focal point
 */
export const cardMediaBleedEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "card-media-bleed@1",
  name: "CardMediaBleed",
  displayName: "Card Media Bleed",
  description:
    "Sizing + placement of a card's media slot. `fullbleed` is the default — the image extends to the card edges; `none` insets the image inside the card padding (editorial opt-out); `icon` renders a small decorative icon.",
  location: { scope: "site", folder: ["Components", "Card"] },
  default: "fullbleed",
  values: [
    { name: "fullbleed", displayName: "Full Width (edge-to-edge) (default)" },
    { name: "none", displayName: "Inside Padding" },
    { name: "icon", displayName: "Icon (small)" },
  ],
} satisfies EnumerationRecipe;

export default cardMediaBleedEnumRecipe;
