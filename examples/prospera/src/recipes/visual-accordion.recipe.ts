import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `VisualAccordion` component (./visual-accordion.tsx)
 * — the placeholder-composed sibling of `accordion-block@1`, and the
 * accordion counterpart of `visual-tabs@1`.
 *
 * accordion-block sources rows from an Items Treelist; VisualAccordion
 * sources them from a Sitecore placeholder: authors drop
 * `accordion-item-rendering@1` items into `visual-accordion-{*}` and
 * each dropped rendering becomes ANOTHER ROW. No Items field — the
 * placeholder is the item list.
 */
export const visualAccordionRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "visual-accordion@1",
  icon: componentIcons["visual-accordion@1"],
  name: "visual-accordion",
  displayName: "Visual Accordion",
  description:
    "Placeholder-composed accordion — drop Accordion Item Rendering items into the `visual-accordion-{*}` placeholder and each one becomes another row (trigger from its Title; panel from its Content / Description / Image / Link plus its own `accordion-panel-{*}` placeholder). Pick over `accordion-block@1` when rows are composed visually in Pages rather than curated via a Treelist.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Heading",
      shape: "text",
      default: {
        en: "Accordion heading",
        ar: "عنوان الأكورديون",
        es: "Título del acordeón",
        fr: "Titre de l'accordéon",
        de: "Akkordeon-Überschrift",
        da: "Harmonika-overskrift",
        ja: "アコーディオンの見出し",
        "zh-CN": "手风琴标题",
        "zh-TW": "手風琴標題",
        it: "Titolo della fisarmonica",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional heading shown above the accordion.",
        sortOrder: 100,
      },
    },
  ],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "visual-accordion-{*}",
      allowedRenderingHandles: ["accordion-item-rendering@1"],
    },
  ],

  params: [
    {
      name: "UseSectionWrapper",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Wrap the accordion in a SectionWrapper using Heading as the title.",
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
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Accordions/Visual Accordion" },
      {
        scope: "site",
        subfolder: "Site Shared UI/Accordions/Visual Accordion",
      },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default visualAccordionRecipe;
