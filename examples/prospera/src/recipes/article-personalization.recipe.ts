import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const articlePersonalizationRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "article-personalization@1",
  name: "personalization-authors-can-run",
  displayName: "Reading spending insights",
  description: "How spending insights on everyday checking help you see the month.",
  template: "article@1",
  pageDesign: "article-page@1",
  itemPath:
    "/sitecore/content/{site}/Home/Articles/personalization-authors-can-run",
  fields: {
    Title: "Reading spending insights",
    Eyebrow: "Checking",
    ShortDescription:
      "Categories on everyday checking show where the month went. Pair them with the budget planner landing — this is not an in-app clone.",
    Content:
      "<p>Spending insights group debit and bill-pay activity into the categories you already use: housing, food, transport, and the rest. They sit on everyday checking. They are not a sixth header item and they are not a screenshot of another bank’s app.</p><h2>Use them with the planner</h2><p>The budget planner landing describes how income, bills, and savings goals fit together. It does not run a live calculator on this marketing site.</p><h2>Privacy</h2><p>Insights are for the people on the account. See Privacy for how this demonstration handles form data.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/hub-01.jpg",
      alt: "Customer and banker reviewing a household budget",
    },
    MetaTitle: "Reading spending insights — Articles",
    MetaDescription:
      "Spending insights on Prospera everyday checking. Pair with bill pay and the budget planner.",
    OgType: "article",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
    JsonLd:
      '{"@context":"https://schema.org","@type":"Article","headline":"Reading spending insights","author":{"@type":"Person","name":"Amira Hassan"}}',
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default articlePersonalizationRecipe;
