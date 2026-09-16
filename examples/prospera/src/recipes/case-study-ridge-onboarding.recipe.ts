import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const caseStudyRidgeOnboardingRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "case-study-ridge-onboarding@1",
  name: "ridge-onboarding",
  displayName: "Ridge family office kept deposits next to the plan",
  description:
    "Commercial / wealth case study — a family office coordinated operating cash and advice.",
  template: "case-study@1",
  pageDesign: "case-study-page@1",
  itemPath: "/sitecore/content/{site}/Home/Case-Studies/ridge-onboarding",
  fields: {
    Title: "Ridge family office kept deposits next to the plan",
    Eyebrow: "Wealth",
    ShortDescription:
      "An owner-operated office needed operating cash, a HELOC conversation, and wealth planning without a private-bank-only brochure.",
    Client: "Ridge Family Office",
    Category: "Wealth",
    Problem:
      "<p>Operating cash sat at one institution. The investment conversation sat at another. A home-equity line for a renovation had no banker who knew both files.</p>",
    Solution:
      "<p>Ridge moved operating deposits to Prospera, opened a wealth-planning conversation with Sofia Lang, and started a HELOC file under lending. The owner still has a commercial banker for payroll when the operating company needs it.</p><p>Bank deposits in this demonstration are treated as FDIC-insured to applicable limits. Investment products would not be. We do not sell securities on this URL.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/home-hero.jpg",
      alt: "A couple reviewing household finances in a city apartment",
    },
    MetaTitle: "Ridge family office — Case study — Prospera",
    MetaDescription:
      "How a family office kept operating cash, a HELOC, and wealth planning at Prospera.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default caseStudyRidgeOnboardingRecipe;
