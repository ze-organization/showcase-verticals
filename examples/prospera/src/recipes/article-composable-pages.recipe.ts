import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const articleComposablePagesRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "article-composable-pages@1",
  name: "composable-pages",
  displayName: "How Prospera publishes APY",
  description:
    "How Prospera states annual percentage yield — as a fact, with a date, not a teaser.",
  template: "article@1",
  pageDesign: "article-page@1",
  itemPath: "/sitecore/content/{site}/Home/Articles/composable-pages",
  fields: {
    Title: "How Prospera publishes APY",
    Eyebrow: "Deposits",
    ShortDescription:
      "Annual percentage yield on this site is labeled illustrative for a demonstration. Here is how a live bank would still owe you the date, the compounding, and the fine print.",
    Content:
      "<p>APY is not a slogan. It is an annual percentage yield, compounded on a disclosed schedule, that can change. On this demonstration site every APY is illustrative — not a live offer and not a limited-time sale unless an Offers page says otherwise.</p><h2>What we show on the product page</h2><p>High-yield savings currently lists 4.15% APY as an illustration. Compounding is monthly in this demo. Six convenient withdrawals per statement cycle is the pattern we disclose. Fees and minimums sit on Rates &amp; fees.</p><h2>What we will not do</h2><p>We will not borrow a UK ISA wrapper, an AER table, or another bank’s numbers. U.S. households looking for yield get a high-yield savings account or, when listed, a certificate of deposit — not a tax wrapper from another country.</p><p><small>Prospera Bank, N.A., Member FDIC. Equal Housing Lender. APY figures are illustrative for a demo.</small></p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/home-hero.jpg",
      alt: "A couple reviewing household finances in a city apartment",
    },
    MetaTitle: "How Prospera publishes APY — Articles",
    MetaDescription:
      "How Prospera Bank, N.A. states APY as a fact. Illustrative yields, FDIC disclosure, and where to compare accounts.",
    OgType: "article",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
    JsonLd:
      '{"@context":"https://schema.org","@type":"Article","headline":"How Prospera publishes APY","author":{"@type":"Person","name":"Amira Hassan"}}',
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default articleComposablePagesRecipe;
