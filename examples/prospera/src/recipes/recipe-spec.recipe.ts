import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `RecipeSpec` component (./recipe-spec.tsx) — the
 * ingredients/preparation spec archetype from drink & dish detail
 * pages: a titled spec with serves / prep-time / glass / difficulty
 * meta, an ingredients list, garnish, an emphasized per-serve callout,
 * an equipment list, and a rich-text method.
 *
 * Every field is optional-tolerant on the React side: an empty field
 * simply doesn't render its row. That makes the same datasource work
 * two ways —
 *
 *   1. Curated: author the spec directly on the datasource.
 *   2. Wildcard: place it inside `wildcard-experience@1` and bind the
 *      props per-URL via a `WildcardBindings` rendering param, e.g.
 *      `{"title":"Title","ingredients":"Ingredients","method":"Method"}`
 *      — the authored datasource remains the fallback surface.
 *
 * Variants differ in layout only (both share this datasource):
 * `Default` (two-column: ingredients + meta / equipment + method) and
 * `Compact` (single column).
 */
export const recipeSpecRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "recipe-spec@1",
  icon: componentIcons["recipe-spec@1"],
  name: "recipe-spec",
  displayName: "Recipe Spec",
  description:
    "Ingredients-and-preparation spec panel — the 'how to make it' section of a cocktail, drink, or dish detail page. Renders serves / prep time / glass / difficulty meta chips, a bulleted ingredients list, a garnish note, an emphasized alcohol-per-serve callout, an equipment list, and a rich-text method. Every row is optional and omitted when empty, so it tolerates sparse content models — ideal inside wildcard-experience with WildcardBindings on wildcard detail pages. Variants: Default (two-column — ingredients + meta start, equipment + method end, stacking on mobile) and Compact (single column). For a generic definition-list detail use wildcard-detail; for prose-only sections use content-block.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      default: "Citrus Highball",
      sitecore: {
        type: "single-line-text",
        hint: "Spec heading — usually the drink or dish name.",
        sortOrder: 100,
      },
    },
    {
      name: "Serves",
      shape: "number",
      default: "1",
      sitecore: {
        type: "number",
        hint: "How many serves the ingredient quantities yield.",
        sortOrder: 200,
      },
    },
    {
      name: "Ingredients",
      shape: "text",
      default: "50 ml citrus spirit\n100 ml sparkling water\n2 lime wedges",
      sitecore: {
        type: "multi-line-text",
        hint: "Ingredient lines, one per line (quantity + ingredient).",
        sortOrder: 300,
      },
    },
    {
      name: "Garnish",
      shape: "text",
      default: "Lime wedge",
      sitecore: {
        type: "single-line-text",
        hint: "Garnish note shown under the ingredients. Clear to hide.",
        sortOrder: 400,
      },
    },
    {
      name: "AlcoholPerServe",
      shape: "text",
      default: "",
      sitecore: {
        type: "single-line-text",
        hint: "Small emphasized callout, e.g. '15.8 grams of alcohol per serve'. Clear to hide.",
        sortOrder: 500,
      },
    },
    {
      name: "Equipment",
      shape: "text",
      default: "Highball glass\nBar spoon\nJigger",
      sitecore: {
        type: "multi-line-text",
        hint: "Equipment lines, one item per line.",
        sortOrder: 600,
      },
    },
    {
      name: "Method",
      shape: "richText",
      default:
        "<p>Fill the glass with ice. Add the spirit, top with sparkling water, and stir once. Squeeze in the lime wedges and serve.</p>",
      sitecore: {
        type: "rich-text",
        hint: "Preparation method — rich text.",
        sortOrder: 700,
      },
    },
    {
      name: "PrepTimeMinutes",
      shape: "number",
      default: "5",
      sitecore: {
        type: "number",
        hint: "Preparation time in minutes (shown as a meta chip).",
        sortOrder: 800,
      },
    },
    {
      name: "GlassType",
      shape: "text",
      default: "Highball",
      sitecore: {
        type: "single-line-text",
        hint: "Recommended glassware (shown as a meta chip).",
        sortOrder: 900,
      },
    },
    {
      name: "Difficulty",
      shape: "text",
      default: "Easy",
      sitecore: {
        type: "single-line-text",
        hint: "Difficulty label, e.g. 'Easy' (shown as a meta chip).",
        sortOrder: 1000,
      },
    },
  ],

  variants: [{ name: "Default" }, { name: "Compact" }],

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
    templates: [{ handle: "recipe-spec@1" }],
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      {
        scope: "page",
        subfolder: "Recipe Specs",
        allowedTemplates: [{ handle: "recipe-spec@1" }],
      },
    ],
  },

  placedIn: ["headless-main-{*}"],
} satisfies ComponentTemplateRecipe;

export default recipeSpecRecipe;
