import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const partnerRidgeLabsRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "partner-ridge-labs@1",
  name: "ridge-labs",
  displayName: "Ridge Analytics",
  description: "Reporting partner for treasury and liquidity packs.",
  template: "partner@1",
  pageDesign: "partner-page@1",
  itemPath: "/sitecore/content/{site}/Home/Partners/ridge-labs",
  fields: {
    Title: "Ridge Analytics",
    Eyebrow: "Technology",
    PartnerType: "Technology",
    ShortDescription:
      "Liquidity and payables reporting a controller can reconcile — used next to Prospera treasury.",
    Content:
      "<p>Ridge Analytics is a demonstration reporting partner. Month-end packs sit next to treasury, not inside a cloned bookkeeping screen. Commercial clients still apply through Apply Now or Contact.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/pdp-01.jpg",
      alt: "Person reviewing finances at a desk",
    },
    Logo: {
      shape: "image",
      mediaPath: "/theme-photos/promo-closer.jpg",
      alt: "Ridge Analytics mark",
    },
    Website: { href: "https://example.com", text: "Visit Ridge" },
    MetaTitle: "Ridge Analytics — Partner — Prospera",
    MetaDescription: "Reporting partner for treasury and liquidity at Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default partnerRidgeLabsRecipe;
