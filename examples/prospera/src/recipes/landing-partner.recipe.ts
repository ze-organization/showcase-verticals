import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const landingPartnerRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "landing-partner@1",
  name: "accounting",
  displayName: "Business accounting",
  description:
    "Business accounting landing — analog /business/accounting as landing@1 under Business.",
  template: "landing@1",
  pageDesign: "landing-page@1",
  itemPath: "/sitecore/content/{site}/Home/Business/accounting",
  fields: {
    Eyebrow: "Business",
    Title: "Keep the books next to the operating account.",
    ShortDescription:
      "Connect treasury and everyday commercial deposits to the way you already close the month. This landing describes the capability — it does not embed accounting software chrome.",
    PrimaryAction: { href: "/Services/treasury", text: "Treasury" },
    SecondaryAction: { href: "/Get-Started", text: "Apply Now" },
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/hub-02.jpg",
      alt: "Business owner and commercial banker on a factory floor",
    },
    Feature1IconName: "chart",
    Feature1Title: "Payables and receivables",
    Feature1Description:
      "<p>ACH, wires, and reporting a controller can reconcile — described on Treasury, linked from this landing.</p>",
    Feature2IconName: "users",
    Feature2Title: "A named banker",
    Feature2Description:
      "<p>Julian Park works commercial files. Eligibility is a conversation on the Business hub, not an instant-approve widget.</p>",
    Feature3IconName: "shield",
    Feature3Title: "Month-end without a second bank",
    Feature3Description:
      "<p>Operating deposits stay at Prospera. Export or connect books the way your accountant already works.</p>",
    Stat1Number: "ACH",
    Stat1Label: "Credits, debits, and payroll in this demonstration",
    Stat2Number: "1",
    Stat2Label: "Named commercial banker on the file",
    Stat3Number: "U.S.",
    Stat3Label: "Registered entities with an operating history",
    TestimonialQuote:
      "<p>Payroll, vendors, and the operating account finally sit in one conversation — not three logins we had to screenshot.</p>",
    TestimonialAuthorName: "Julian Park",
    TestimonialAuthorTitle: "Commercial Banker",
    TestimonialAuthorImage: {
      shape: "image",
      mediaPath: "/theme-photos/hub-02.jpg",
      alt: "Portrait of Julian Park",
    },
    Faq1Question: "Is there a monthly fee?",
    Faq1Answer:
      "<p>This demonstration does not advertise a no-monthly-fee business account on this landing. If a fee is waived, that fact is on Rates &amp; fees.</p>",
    Faq2Question: "Who is eligible?",
    Faq2Answer:
      "<p>U.S.-registered entities with an operating history. See eligibility on the Business hub. Approval is not guaranteed.</p>",
    Faq3Question: "Do you show accounting software screens?",
    Faq3Answer:
      "<p>No. We describe the banking relationship. We do not clone a bookkeeping interface.</p>",
    Faq4Question: "How do I apply?",
    Faq4Answer:
      "<p>Apply Now or Contact. Bring legal name, entity type, and monthly payment volume.</p>",
    Faq5Question: "Where is treasury?",
    Faq5Answer:
      "<p>Treasury is a Service page under Advice in the tree, linked from Business. It is not a header item.</p>",
    FinalCtaTitle: "Start a commercial conversation",
    FinalCtaSubhead:
      "<p>Apply Now for a banker follow-up. This is not a live account opening.</p>",
    FinalCtaAction: { href: "/Get-Started", text: "Apply Now" },
    MetaTitle: "Business accounting — Prospera",
    MetaDescription:
      "Connect Prospera treasury and operating accounts to month-end books. Eligibility on the Business hub. Apply Now.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default landingPartnerRecipe;
