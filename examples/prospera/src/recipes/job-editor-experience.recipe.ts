import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const jobEditorExperienceRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "job-editor-experience@1",
  name: "treasury-specialist",
  displayName: "Treasury specialist",
  description: "Treasury specialist — payables, receivables, and liquidity.",
  template: "job@1",
  pageDesign: "job-page@1",
  itemPath: "/sitecore/content/{site}/Home/Careers/treasury-specialist",
  fields: {
    Title: "Treasury specialist",
    Eyebrow: "Business",
    ShortDescription:
      "Sit with commercial clients on ACH, wires, and reporting for operators who already have a controller.",
    Content:
      "<p>You support named bankers on commercial files. Eligibility is a conversation on the Business hub. You do not advertise a no-monthly-fee business account unless Rates &amp; fees states an illustrative $0 maintenance fee.</p>",
    Department: "Treasury",
    EmploymentType: "Full-time",
    LocationName: "Remote",
    MetaTitle: "Treasury specialist — Careers — Prospera",
    MetaDescription: "Full-time treasury role at Prospera Bank, N.A. Remote.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default jobEditorExperienceRecipe;
