import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import { cardChromeParams } from "./_card-chrome-params";

/**
 * Recipe for `ReviewCard` — the leaf card rendering for the reviews
 * family. Authors drop these into the `cards-reviews-{*}` placeholder
 * exposed by `reviews-list-grid@1` and `reviews-carousel@1` (composed
 * mode).
 *
 * Variants `Default` and `Quote` map to the two ReviewCard shapes —
 * Default surfaces avatar + rating + author + quote, Quote is a
 * pull-quote with the author below. The DOM topology differs
 * meaningfully between the two, so the boundary stays a variant (see
 * [[feedback-variant-vs-parameter]]).
 *
 * In curated mode the review-card items themselves are the datasource
 * targets the parent reviews-list-grid/carousel's Treelist references.
 */
export const reviewCardRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "review-card@1",
  icon: componentIcons["review-card@1"],
  name: "review-card",
  displayName: "Review Card",
  description:
    "Single review card. Variants: Default (avatar + rating + author + quote), Quote (pull-quote with author below).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Quote",
      shape: "richText",
      default: {
        en: "This product changed how we work — the team adopted it overnight.",
        ar: "لقد غيّر هذا المنتج طريقة عملنا — تبنّاه الفريق بين عشية وضحاها.",
        es: "Este producto cambió nuestra forma de trabajar: el equipo lo adoptó de la noche a la mañana.",
        fr: "Ce produit a changé notre façon de travailler — l'équipe l'a adopté du jour au lendemain.",
        de: "Dieses Produkt hat unsere Arbeitsweise verändert — das Team hat es über Nacht übernommen.",
        da: "Dette produkt ændrede vores måde at arbejde på — teamet tog det til sig fra den ene dag til den anden.",
        ja: "この製品は私たちの働き方を変えました。チームは一夜にして使いこなすようになりました。",
        "zh-CN": "这款产品改变了我们的工作方式——团队一夜之间就上手了。",
        "zh-TW": "這款產品改變了我們的工作方式——團隊一夜之間就上手了。",
        it: "Questo prodotto ha cambiato il nostro modo di lavorare: il team lo ha adottato dall'oggi al domani.",
      },
      sitecore: {
        type: "rich-text",
        required: true,
        hint: "The review body. Rendered as the card's primary content.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "AuthorName",
      shape: "text",
      default: "Jordan Lee",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Reviewer name. Shown as the card's attribution.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "AuthorRole",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: 'Optional reviewer role/title (e.g. "Head of Experience, Arcadia").',
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "AuthorImage",
      shape: "image",
      role: "avatar",
      sitecore: {
        type: "image",
        hint: "Optional reviewer avatar — used by the Card variant.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Rating",
      shape: "number",
      sitecore: {
        type: "number",
        hint: "Star rating from 0 to 5. Used by the Card variant; ignored by Quote.",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "Source",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: 'Optional provenance label (e.g. "G2", "Trustpilot", "App Store").',
        section: "Content",
        sortOrder: 600,
      },
    },
  ],
  params: [
    {
      name: "ShowImages",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show avatar + review image inside the Card variant. Authors flip via Sitecore standard values; React leaves this undefaulted.",
        section: "Style",
        sortOrder: 200,
      },
    },
    ...cardChromeParams,
  ],
  variants: [{ name: "Default" }, { name: "Quote" }],
  placedIn: ["cards-reviews-{*}", "search-results-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Reviews" },
      { scope: "site", subfolder: "Reviews" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default reviewCardRecipe;
