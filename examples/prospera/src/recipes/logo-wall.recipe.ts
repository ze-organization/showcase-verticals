import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `LogoWall` — a strip or grid of partner / sponsor /
 * client / brand logos. Authors drop `logo-item@1` renderings into the
 * `logo-wall-{*}` placeholder. Dispatches between a single row
 * (`Strip`, optionally an auto-scrolling marquee), a responsive grid
 * (`Grid`), and award rows (`RecognitionRows`).
 */
export const logoWallRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "logo-wall@1",
  icon: componentIcons["logo-wall@1"],
  name: "logo-wall",
  displayName: "Logo Wall",
  description:
    "Strip or grid of partner / sponsor / client / brand logos with an optional eyebrow + title. Monochrome (grayscale) treatment, size, columns, surface tone, and an auto-scrolling marquee (Strip variant, reduced-motion safe). Variants: Strip (single row / marquee), Grid, RecognitionRows (award / analyst-recognition rows — seal at the start, name + description in the middle, arrow CTA at the end; the Gartner MQ / Forrester Wave treatment).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Small uppercase line above the title, e.g. 'Official partners'.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Trusted by teams everywhere",
        ar: "موثوق به من قبل الفرق في كل مكان",
        es: "La confianza de equipos en todas partes",
        fr: "La confiance d'équipes partout",
        de: "Von Teams überall geschätzt",
        da: "Betroet af teams overalt",
        ja: "世界中のチームに信頼されています",
        "zh-CN": "深受各地团队信赖",
        "zh-TW": "深受各地團隊信賴",
        it: "Scelto da team ovunque",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional heading above the wall. Leave empty for a bare logo strip.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Logos",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick logo-item entries in display order.",
        source: { kind: "filter", types: ["logo-item@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
  ],
  params: [
    {
      name: "Monochrome",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Render logos in grayscale, restoring full color on hover — the quiet partner-wall treatment.",
        section: "Style",
        sortOrder: 100,
      },
    },
    {
      name: "Size",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "size-scale@1",
        hint: "Logo tile size.",
        section: "Style",
        sortOrder: 110,
      },
    },
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Background tone of the section around the wall.",
        section: "Style",
        sortOrder: 120,
      },
    },
    {
      // Defaults to the in-list `auto` member: the section's natural
      // padding is the responsive `py-10 md:py-14` (logo-wall.tsx),
      // which no concrete `padding-y@1` token reproduces. `auto` maps to
      // that ramp; a concrete pick takes over.
      name: "PaddingY",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding around the section. `auto` (default) keeps the section's natural responsive padding; `none` flattens it for dense stacked compositions.",
        section: "Style",
        sortOrder: 130,
      },
    },
    {
      name: "Columns",
      shape: "enum",
      default: "5",
      sitecore: {
        enumHandle: "logo-wall-columns@1",
        hint: "Columns at the lg breakpoint — Grid variant only.",
        section: "Layout",
        sortOrder: 200,
      },
    },
    {
      name: "Marquee",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Auto-scroll the strip as a continuous marquee — Strip variant only. Honors prefers-reduced-motion; static while editing.",
        section: "Behavior",
        sortOrder: 300,
      },
    },
  ],
  variants: [{ name: "Strip" }, { name: "Grid" }, { name: "RecognitionRows" }],
  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "logo-wall-{*}",
      allowedRenderingHandles: ["logo-item@1"],
    },
  ],
  placedIn: ["headless-main-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["logo-item@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["logo-item@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Logos" },
      { scope: "site", subfolder: "Logos" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default logoWallRecipe;
