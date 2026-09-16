import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `LogoItem` — leaf rendering for the `logo-wall@1` family.
 * Authors drop these into the `logo-wall-{*}` placeholder. Variants:
 * Default (strip/grid tile) and Recognition (award-row treatment).
 */
export const logoItemRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "logo-item@1",
  icon: componentIcons["logo-item@1"],
  name: "logo-item",
  displayName: "Logo Item",
  description:
    "Single partner / sponsor / client logo for the logo-wall family: a logo image, a name (accessible label), and an optional link.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Logo",
      shape: "image",
      sitecore: {
        type: "image",
        required: true,
        hint: "The logo image. Transparent PNG/SVG renders best; the wall can apply a monochrome treatment.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Name",
      shape: "text",
      default: {
        en: "Partner name",
        ar: "اسم الشريك",
        es: "Nombre del socio",
        fr: "Nom du partenaire",
        de: "Partnername",
        da: "Partnernavn",
        ja: "パートナー名",
        "zh-CN": "合作伙伴名称",
        "zh-TW": "合作夥伴名稱",
        it: "Nome del partner",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Partner / brand name — used as the accessible label and alt-text fallback.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Description",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: 'Optional short copy for the recognition-rows treatment — e.g. "Named a Leader in the 2026 Gartner® Magic Quadrant™ for DXP". Ignored by the Strip / Grid walls (logo-only tiles).',
        section: "Content",
        sortOrder: 250,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional destination when the logo is clicked. RecognitionRows renders it as the row's arrow CTA (authored link text shows; falls back to 'Learn more').",
        section: "Content",
        sortOrder: 300,
      },
    },
  ],
  variants: [{ name: "Default" }, { name: "Recognition" }],
  placedIn: ["logo-wall-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Logos" },
      { scope: "site", subfolder: "Logos" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default logoItemRecipe;
