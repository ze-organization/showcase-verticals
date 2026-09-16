import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `QuickLinkTile` — the leaf datasource item for the
 * `quick-links-tiles@1` family. Recipe-only (no rendering of its own,
 * like `versus-item@1`): the parent `quick-links-tiles` reads these
 * via its `Tiles` Treelist and renders each as a task-entry tile.
 */
export const quickLinkTileRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "quick-link-tile@1",
  icon: componentIcons["quick-link-tile@1"],
  name: "quick-link-tile",
  displayName: "Quick Link Tile",
  description:
    "Single task-entry tile for the quick-links-tiles family: a named vector icon picked from the icon-name@1 vocabulary, a short task label ('Pay my bill'), an optional one-line description, and the destination link the whole tile follows.",
  section: { handle: "navigation-section@1" },
  fields: [
    {
      // An icon is never an image upload: the authoring surface is this
      // named-glyph dropdown, and sizing/display belong to rendering
      // params/variants.
      name: "IconName",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "icon-name@1",
        hint: "Named vector icon for the task, picked from the shared icon-name@1 vocabulary (~80 semantic, domain-neutral names like bill, outage, claim, quote, sign-in, location — see the enumeration's per-value descriptions). Renders crisp at any size and recolors with the theme. `none` (default) shows no icon.",
        section: "Content",
        sortOrder: 150,
      },
    },
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Pay my bill",
        ar: "دفع فاتورتي",
        es: "Pagar mi factura",
        fr: "Payer ma facture",
        de: "Rechnung bezahlen",
        da: "Betal min regning",
        ja: "請求書を支払う",
        "zh-CN": "支付账单",
        "zh-TW": "支付賬單",
        it: "Paga la mia bolletta",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Short task label — an action phrase, not a heading.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional one-line supporting description. Shown in the grid variant only — the compact Row omits it.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Destination the whole tile links to (payment portal, outage map, claims flow).",
        section: "Content",
        sortOrder: 400,
      },
    },
  ],
  variants: [{ name: "Default" }],
} satisfies ComponentTemplateRecipe;

export default quickLinkTileRecipe;
