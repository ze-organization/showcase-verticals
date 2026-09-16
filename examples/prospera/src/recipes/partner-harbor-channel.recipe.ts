import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const partnerHarborChannelRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "partner-harbor-channel@1",
  name: "harbor-channel",
  displayName: "Harbor Payments",
  description: "Payments partner for ACH and merchant settlement.",
  template: "partner@1",
  pageDesign: "partner-page@1",
  itemPath: "/sitecore/content/{site}/Home/Partners/harbor-channel",
  fields: {
    Title: "Harbor Payments",
    Eyebrow: "Payments",
    PartnerType: "Channel",
    ShortDescription:
      "ACH and settlement connectivity for commercial clients who already run payroll on Prospera treasury.",
    Content:
      "<p>Harbor Payments is a demonstration channel partner. They sit next to treasury for operators who need ACH volume beyond a household bill-pay list. Eligibility remains on the Business hub.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/hub-02.jpg",
      alt: "Business owner and commercial banker on a factory floor",
    },
    Logo: {
      shape: "image",
      mediaPath: "/theme-photos/pdp-01.jpg",
      alt: "Harbor Payments mark",
    },
    Website: { href: "https://example.com", text: "Visit Harbor" },
    MetaTitle: "Harbor Payments — Partner — Prospera",
    MetaDescription: "Payments partner for ACH and settlement next to Prospera treasury.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default partnerHarborChannelRecipe;
