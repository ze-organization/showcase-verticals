import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `LinkedItemsRail` component (./linked-items-rail.tsx)
 * — the "Prepared with" / "Related items" cross-link band for
 * wildcard detail pages.
 *
 * The datasource is deliberately heading-only (Title + Intro): the
 * cards come from a *resolved reference field*, delivered through the
 * `WildcardBindings` rendering param when this rendering is composed
 * inside `wildcard-experience@1`, e.g.
 *
 *   WildcardBindings: {"items":"RelatedProducts"}
 *
 * The head app normalizes the resolved reference field (Multilist /
 * Treelist / Droplink) into linked-item cards; each card probes the
 * referenced item's conventional Title / Image / Tagline / Summary /
 * Description fields and links to the item's resolved URL. With no
 * resolved items the live page renders just the authored heading;
 * the editing canvas shows a labeled placeholder card row.
 */
export const linkedItemsRailRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "linked-items-rail@1",
  icon: componentIcons["linked-items-rail@1"],
  name: "linked-items-rail",
  displayName: "Linked Items Rail",
  description:
    "Cross-link band of resolved reference items for wildcard detail pages — 'Prepared with', 'Related cocktails', 'You may also like', recommendations. Compose it inside wildcard-experience and bind its items prop to a reference field via WildcardBindings ({\"items\":\"RelatedProducts\"}); each card probes the linked item's Title / Image / Tagline / Summary / Description with graceful omission and links to the item's URL. Datasource carries only the authored heading + intro. Variants: Rail (horizontal snap-scroll strip) and Grid (responsive 1/2/3-column grid). For curated card lists authored as Treelists use card-list components; for a full detail layout use wildcard-detail.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      default: "Related items",
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the cards (e.g. 'Prepared with').",
        sortOrder: 100,
      },
    },
    {
      name: "Intro",
      shape: "text",
      default: "",
      sitecore: {
        type: "multi-line-text",
        hint: "Optional intro line under the heading. Clear to hide.",
        sortOrder: 200,
      },
    },
  ],

  variants: [{ name: "Rail" }, { name: "Grid" }],

  params: [
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Section surface tone. `none` keeps the page surface; a role paints the band in that color with matching foreground.",
        section: "Style",
        sortOrder: 100,
      },
    },
    {
      name: "PaddingY",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Section vertical padding. `auto` keeps the component's natural responsive padding.",
        section: "Style",
        sortOrder: 110,
      },
    },
  ],

  datasource: {
    templates: [{ handle: "linked-items-rail@1" }],
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      {
        scope: "page",
        subfolder: "Linked Item Rails",
        allowedTemplates: [{ handle: "linked-items-rail@1" }],
      },
    ],
  },

  placedIn: ["headless-main-{*}"],
} satisfies ComponentTemplateRecipe;

export default linkedItemsRailRecipe;
