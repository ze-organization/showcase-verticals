import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const landingWorkshopRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "landing-workshop@1",
  name: "budget-planner",
  displayName: "Budget planner",
  description:
    "Budget planner landing — analog tools page as landing@1 under Personal.",
  template: "landing@1",
  pageDesign: "landing-page@1",
  itemPath: "/sitecore/content/{site}/Home/Products/budget-planner",
  fields: {
    Eyebrow: "Checking",
    Title: "See the month before it spends you.",
    ShortDescription:
      "A budget planner tied to everyday checking: income, bills, and the cash you meant to save. This page describes the tool — it does not run a live calculator.",
    PrimaryAction: {
      href: "/Products/Checking-and-Savings/everyday-checking",
      text: "Everyday checking",
    },
    SecondaryAction: { href: "/Get-Started", text: "Apply Now" },
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/hub-01.jpg",
      alt: "Customer and banker reviewing a household budget",
    },
    Feature1IconName: "chart",
    Feature1Title: "Income and bills",
    Feature1Description:
      "<p>Start with paydays and the payments that already have a date. Bill pay on everyday checking can use the same list.</p>",
    Feature2IconName: "check",
    Feature2Title: "Savings goals",
    Feature2Description:
      "<p>Move surplus to high-yield savings and label it. Yields on that product page are illustrative.</p>",
    Feature3IconName: "users",
    Feature3Title: "A banker if the numbers stall",
    Feature3Description:
      "<p>Walk into a branch or write Contact. We will not clone an in-app worksheet on this landing.</p>",
    Stat1Number: "$0",
    Stat1Label: "Illustrative monthly checking fee with qualifying activity",
    Stat2Number: "6",
    Stat2Label: "Convenient savings withdrawals disclosed on HYSA",
    Stat3Number: "1",
    Stat3Label: "Checking account behind the planner",
    TestimonialQuote:
      "<p>We list rent, utilities, and the car payment once. Checking and the planner use the same dates.</p>",
    TestimonialAuthorName: "Amira Hassan",
    TestimonialAuthorTitle: "Head of Consumer Bank",
    TestimonialAuthorImage: {
      shape: "image",
      mediaPath: "/theme-photos/hub-01.jpg",
      alt: "Portrait of Amira Hassan",
    },
    Faq1Question: "Does this page calculate a budget?",
    Faq1Answer:
      "<p>No. It describes the tool. We do not submit household figures or run a live worksheet on this marketing site.</p>",
    Faq2Question: "Do I need checking first?",
    Faq2Answer:
      "<p>The planner is most useful with everyday checking. Apply Now if you do not have an account yet.</p>",
    Faq3Question: "Is this a Features mega-nav item?",
    Faq3Answer:
      "<p>No. Budget planner is a landing under Personal, next to checking — not a sixth header link.</p>",
    Faq4Question: "Can a joint household use it?",
    Faq4Answer:
      "<p>Joint owners share everyday checking. Add a co-applicant on Apply Now.</p>",
    Faq5Question: "Where are fees disclosed?",
    Faq5Answer:
      "<p>On everyday checking and Rates &amp; fees. Figures here are illustrative for a demonstration.</p>",
    FinalCtaTitle: "Open everyday checking",
    FinalCtaSubhead:
      "<p>The planner sits on the account. Apply Now starts the file.</p>",
    FinalCtaAction: { href: "/Get-Started", text: "Apply Now" },
    MetaTitle: "Budget planner — Prospera",
    MetaDescription:
      "Budget planner for Prospera everyday checking. Marketing landing under Personal. Not a live calculator.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default landingWorkshopRecipe;
