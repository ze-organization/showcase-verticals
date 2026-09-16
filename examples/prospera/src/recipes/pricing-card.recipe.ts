import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  cardChromeParams,
  cardTitleLinkIconParam,
} from "./_card-chrome-params";

/**
 * Recipe for `PricingCard` — the leaf card rendering for the pricing
 * family. Authors drop these into the `cards-pricing-{*}` placeholder
 * exposed by `pricing-list-grid@1` and `pricing-carousel@1` (composed
 * mode).
 *
 * In curated mode the pricing-card items themselves are the datasource
 * targets the parent pricing-list-grid/carousel's Treelist references.
 *
 * Variant model: today the React component exposes a single
 * `PricingCard` export, so the recipe ships a single `Default`
 * variant. When secondary layouts (e.g. compact summary, comparison
 * row) are added, append matching PascalCase variants here and
 * named-export the corresponding function from `pricing-card.tsx`.
 */
export const pricingCardRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "pricing-card@1",
  icon: componentIcons["pricing-card@1"],
  name: "pricing-card",
  displayName: "Pricing Card",
  description:
    "Single pricing plan card. Carries name, price, currency, features list, optional CTA, and a highlight flag for the recommended plan.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Name",
      shape: "text",
      default: {
        en: "Starter",
        ar: "الباقة الأساسية",
        es: "Inicial",
        fr: "Essentiel",
        de: "Starter",
        da: "Starter",
        ja: "スターター",
        "zh-CN": "入门版",
        "zh-TW": "入門版",
        it: "Base",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Plan name (e.g. Starter, Growth, Enterprise).",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Price",
      shape: "text",
      default: "$29",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Headline price (e.g. `$29`, `Custom`). Pair with Currency for locale-aware formatting.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "PricePeriod",
      shape: "text",
      default: "/month",
      sitecore: {
        type: "single-line-text",
        hint: "Trailing period next to Price (e.g. `/month`). Hidden when Price is `Custom`.",
        section: "Content",
        sortOrder: 250,
      },
    },
    {
      name: "Currency",
      shape: "text",
      default: "USD",
      sitecore: {
        type: "single-line-text",
        hint: "ISO 4217 currency code. Used by downstream formatters; the Price field stays the source of truth for what authors see.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Features",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        hint: "One feature per line. Each non-empty line renders as a separate list row in the card.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Highlighted",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Mark this plan as the recommended one. Sitecore Standard Values drives the initial state — no React-side default.",
        section: "Style",
        sortOrder: 100,
      },
    },
    {
      name: "HighlightLabel",
      shape: "text",
      default: "Most popular",
      sitecore: {
        type: "single-line-text",
        hint: "Badge copy shown when Highlighted is on.",
        section: "Style",
        sortOrder: 150,
      },
    },
    {
      name: "CtaLabel",
      shape: "text",
      default: {
        en: "Get started",
        ar: "ابدأ الآن",
        es: "Comenzar",
        fr: "Commencer",
        de: "Loslegen",
        da: "Kom i gang",
        ja: "始める",
        "zh-CN": "开始使用",
        "zh-TW": "開始使用",
        it: "Inizia",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Call-to-action button label.",
        section: "Action",
        sortOrder: 100,
      },
    },
    {
      name: "CtaLink",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Destination for the CTA button.",
        section: "Action",
        sortOrder: 200,
      },
    },
  ],
  params: [...cardChromeParams, cardTitleLinkIconParam],
  variants: [{ name: "Default" }],
  placedIn: ["cards-pricing-{*}", "search-results-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Pricing" },
      { scope: "site", subfolder: "Pricing" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default pricingCardRecipe;
