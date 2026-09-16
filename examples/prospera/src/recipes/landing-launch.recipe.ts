import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const landingLaunchRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "landing-launch@1",
  name: "virtual-cards",
  displayName: "Virtual cards",
  description:
    "Virtual cards landing — analog /features/virtual-cards as landing@1 under Personal.",
  template: "landing@1",
  pageDesign: "landing-page@1",
  itemPath: "/sitecore/content/{site}/Home/Products/virtual-cards",
  fields: {
    Eyebrow: "Cards",
    Title: "A number for the vendor. Keep the physical card in the wallet.",
    ShortDescription:
      "Issue virtual card numbers from your Rewards Visa for subscriptions, ads, and one-off vendors — without sharing the plastic.",
    PrimaryAction: { href: "/Products/Cards/rewards-visa", text: "Rewards Visa" },
    SecondaryAction: { href: "/Get-Started", text: "Apply Now" },
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/pdp-01.jpg",
      alt: "Person reviewing household finances at a desk",
    },
    Feature1IconName: "shield",
    Feature1Title: "Lock a merchant",
    Feature1Description:
      "<p>Create a number that only one merchant can charge. Close it when the subscription ends.</p>",
    Feature2IconName: "chart",
    Feature2Title: "Set a limit",
    Feature2Description:
      "<p>Cap a virtual card for ads, software, or a contractor so a surprise invoice cannot run past the line you set.</p>",
    Feature3IconName: "check",
    Feature3Title: "Keep the Visa",
    Feature3Description:
      "<p>Virtual numbers sit on the Rewards Visa. Everyday spend and cash back stay on the physical card.</p>",
    Stat1Number: "1.5%",
    Stat1Label: "Illustrative cash back on eligible spend",
    Stat2Number: "0",
    Stat2Label: "Illustrative annual fee on the Rewards Visa",
    Stat3Number: "1",
    Stat3Label: "Physical card behind every virtual number",
    TestimonialQuote:
      "<p>We issue a virtual number for each vendor. The Rewards Visa stays in the drawer until we travel.</p>",
    TestimonialAuthorName: "Amira Hassan",
    TestimonialAuthorTitle: "Head of Consumer Bank",
    TestimonialAuthorImage: {
      shape: "image",
      mediaPath: "/theme-photos/hub-01.jpg",
      alt: "Portrait of Amira Hassan",
    },
    PartnerLogosImage: {
      shape: "image",
      mediaPath: "/theme-photos/hub-02.jpg",
      alt: "Editorial still of a metropolitan branch interior",
    },
    Faq1Question: "Do I need the Rewards Visa first?",
    Faq1Answer:
      "<p>Yes. Virtual numbers are issued on an approved Rewards Visa. Apply Now starts that file.</p>",
    Faq2Question: "Is this an in-app product screen?",
    Faq2Answer:
      "<p>No. This is a marketing landing. After approval, virtual cards are managed in online banking — we do not clone that chrome here.</p>",
    Faq3Question: "Do virtual charges earn cash back?",
    Faq3Answer:
      "<p>Eligible purchase volume follows the Rewards Visa terms. Illustrative 1.5% cash back is not a live offer.</p>",
    Faq4Question: "Can a business issue virtual cards?",
    Faq4Answer:
      "<p>Commercial virtual cards are a treasury conversation. Start on Business or Contact.</p>",
    Faq5Question: "Are rates and fees live?",
    Faq5Answer:
      "<p>No. Figures on this landing are illustrative for a demonstration. See Rates &amp; fees.</p>",
    FinalCtaTitle: "Apply for the Rewards Visa",
    FinalCtaSubhead:
      "<p>Virtual numbers are available after the card is approved. This form does not open a live account.</p>",
    FinalCtaAction: { href: "/Get-Started", text: "Apply Now" },
    MetaTitle: "Virtual cards — Prospera",
    MetaDescription:
      "Issue virtual card numbers from a Prospera Rewards Visa. Marketing landing under Personal. Apply Now.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default landingLaunchRecipe;
