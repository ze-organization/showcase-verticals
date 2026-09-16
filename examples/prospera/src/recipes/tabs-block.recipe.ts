import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `TabsBlock` component (./tabs-block.tsx).
 *
 * Two composition modes — same dispatch shape as the
 * cards-and-lists family containers and the accordion-block.
 * Placeholder-composed tabs are their own component (`visual-tabs@1`).
 *
 *   1. **Curated** (Items Treelist) — `Items` accepts both
 *      `tabs-item@1` (content model) and `tab-rendering@1` (visual
 *      rendering used as a referenceable content item). The React
 *      adapter normalises both into the same per-tab shape.
 *
 *   2. **Search-driven** — `SearchConfig` Plugin field, authored via
 *      the `sai/search-source` Marketplace plugin. The tabs-block
 *      fetches matching items at render time and renders them in the
 *      same shape as curated mode.
 *
 * Three rendering variants ship: `Default` (text-labeled triggers +
 * rich text content), `ImageTriggers` (logo strip with image panels),
 * and `VerticalRails` (collapsed vertical rails with rotated labels
 * that expand horizontally on selection — the diageo home-page
 * pattern). They share the per-tab field
 * schema but render different compositions — per the
 * variant-vs-parameter rule, that warrants per-variant React exports
 * rather than a TabsStyle param.
 */
export const tabsBlockRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "tabs-block@1",
  icon: componentIcons["tabs-block@1"],
  name: "tabs-block",
  displayName: "Tabs",
  description:
    "Tabbed content block. Supports both related-items (Treelist) and child-items (insertOptions) modeling, with a text-trigger or image-trigger style.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Explore the details",
        ar: "استكشف التفاصيل",
        es: "Explora los detalles",
        fr: "Découvrir les détails",
        de: "Details entdecken",
        da: "Udforsk detaljerne",
        ja: "詳細を見る",
        "zh-CN": "了解详情",
        "zh-TW": "了解詳情",
        it: "Esplora i dettagli",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional heading shown above the tabs.",
        sortOrder: 100,
      },
    },
    {
      name: "Items",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        // Two template types pass the filter — content-model and the
        // visual rendering used as a referenced content item. The
        // React adapter normalises both into the same per-tab shape
        // (Label + Content + optional Description / TriggerImage /
        // PanelImage / Link).
        source: {
          kind: "filter",
          types: ["tabs-item@1", "tab-rendering@1"],
        },
        hint: "Pick TabsItem or TabRendering items. The component normalises both into the same per-tab shape.",
        sortOrder: 200,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin. When set, the tabs-block fetches items at render time instead of reading Items / placeholder children.",
        source: {
          kind: "plugin",
          id: "sai/list-source",
          defaultAppId: "a559eb70-e5c3-4b3c-a0de-84def425a9c4",
        },
        section: "Search",
        sortOrder: 100,
      },
    },
  ],

  insertOptions: ["tabs-item@1", "tab-rendering@1"],

  children: { allowedHandles: ["tabs-item@1"] },

  // Placeholder-composed tabs are their own component
  // (`visual-tabs@1`), which keeps the display-variant axis
  // (Default / ImageTriggers / VerticalRails) while dropping the
  // Items/SearchConfig fields.
  variants: [
    { name: "Default" },
    { name: "ImageTriggers" },
    // Collapsed vertical rails with rotated labels that expand
    // horizontally on selection — pick when the source shows a
    // full-width band of vertical label rails (diageo home page).
    { name: "VerticalRails" },
  ],

  params: [
    {
      name: "UseSectionWrapper",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Wrap the tabs in a SectionWrapper using Title as the heading.",
        sortOrder: 100,
      },
    },
    {
      name: "HeadingLayout",
      shape: "enum",
      default: "start-with-section-divider",
      sitecore: {
        enumHandle: "heading-layout@1",
        hint: "Heading alignment (start / center) and treatment (plain, accent scribble, or full-width section divider).",
        sortOrder: 200,
      },
    },
    {
      name: "HeadingAnimation",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "heading-animation@1",
        hint: "Heading entrance animation.",
        sortOrder: 300,
      },
    },
    {
      name: "HeadingSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "heading-size@1",
        hint: "Heading size.",
        sortOrder: 400,
      },
    },
    {
      // Horizontal placement of the tabs list within the block.
      // Reuses the shared `alignment@1` enum (start/center/end)
      // — same values authors see elsewhere for block alignment.
      name: "TabsAlignment",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Horizontal placement of the tabs list. `start` (default) aligns to the inline-start edge; `center` and `end` shift the row.",
        sortOrder: 500,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      // Nested leaf per-component — tabs-block and tab-rendering both
      // claim a Tabs parent, so the leaf disambiguates the per-recipe
      // data-folder template (see main-nav.recipe.ts for rationale).
      { scope: "page", subfolder: "Tabs/Tabs Block" },
      { scope: "site", subfolder: "Site Shared UI/Tabs/Tabs Block" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default tabsBlockRecipe;
