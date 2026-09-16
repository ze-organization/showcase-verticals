import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  container1Layout,
  featureCardPlacement,
  featuresListGrid,
  hubContentBlock,
  hubHero,
  hubPromoCloser,
} from "./_hub-grammar";

/**
 * Business hub — `/Business`. page@1, not a new template. Header label Business.
 */
export const businessRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "business@1",
  name: "Business",
  displayName: "Business",
  description:
    "Business hub — commercial banking, treasury, accounting landing, and case studies.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Business",
  fields: {
    Title: "Business",
    Eyebrow: "Commercial",
    MetaTitle: "Business banking — Prospera",
    MetaDescription:
      "Treasury, operating accounts, and commercial case studies from Prospera Bank, N.A. Apply or talk to a banker. Member FDIC.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Business",
      title: "Commercial banking with a named banker.",
      subtitle:
        "Operating deposits, treasury, and credit sized to payroll and inventory. This demonstration does not advertise a no-monthly-fee business account unless the product page states an illustrative $0 maintenance fee.",
      imageSeed: "hub-business",
      imageAlt: "Business owner and commercial banker on a factory floor",
      primary: { href: "/Services/treasury", text: "Treasury" },
      secondary: { href: "/Get-Started", text: "Apply Now" },
    }),
    featuresListGrid({
      slot: "Capabilities",
      title: "How companies work with us",
      lead: "Treasury for cash movement, accounting tools for the books, and case studies from operators who already run payroll.",
      headingLayout: "start",
      firstFeatured: true,
      cards: [
        featureCardPlacement({
          slot: "CardTreasury",
          variant: "MediaStacked",
          title: "Treasury",
          description:
            "ACH, wires, payables, receivables, and liquidity reporting for a controller who already closes the month.",
          href: "/Services/treasury",
          linkText: "Treasury",
          imageSeed: "treasury",
          imageAlt: "Business owner and commercial banker reviewing a plan",
        }),
        featureCardPlacement({
          slot: "CardAccounting",
          title: "Books and payments",
          description:
            "Connect operating accounts to the way you already keep books — without cloning an in-app accounting screenshot.",
          href: "/Business/accounting",
          linkText: "Accounting",
          imageSeed: "hub-business",
          imageAlt: "Manufacturing floor viewed from a worktable",
        }),
        featureCardPlacement({
          slot: "CardCases",
          title: "Commercial case studies",
          description:
            "How midsize operators moved payroll, payables, or a credit line with a named banker.",
          href: "/Case-Studies",
          linkText: "Read case studies",
          imageSeed: "hub-02",
          imageAlt: "Business owner and commercial banker on a factory floor",
        }),
      ],
    }),
    hubContentBlock({
      slot: "Eligibility",
      eyebrow: "Eligibility",
      title: "Who we bank in this demonstration",
      body: "<p>Prospera commercial is for U.S.-registered entities with an operating history and a conversation — not an instant-approve widget. Typical files include legal name, entity type, beneficial owners, and monthly payment volume.</p><p>We do not claim a $0 monthly business-account fee on this hub. If a demonstration fee is waived, that fact lives on Rates &amp; fees and on the product you apply for.</p><p>A banker follows up after Apply Now or Contact. Approval is not guaranteed on this page.</p><p><small>Prospera Bank, N.A., Member FDIC. Equal Housing Lender. Terms shown on this site are illustrative for a demo.</small></p>",
    }),
    hubPromoCloser({
      eyebrow: "Next",
      title: "Apply Now, or write commercial directly.",
      description:
        "Tell us legal name, entity type, and what the account needs to do. A banker follows up with the documents we still need.",
      cta: { href: "/Get-Started", text: "Apply Now" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
    }),
  ]),
} satisfies PageRecipe;

export default businessRecipe;
