import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  container1Layout,
  hubContentBlock,
  hubHero,
  hubPromoCloser,
  hubStatsGrid,
} from "./_hub-grammar";
import { peopleDemoGrid } from "./_people-demo-cards";

export const aboutRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "about@1",
  name: "About",
  displayName: "About",
  description:
    "About Prospera — national bank story, stats, people, Careers closer.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/About",
  fields: {
    Title: "About Prospera",
    Eyebrow: "The bank",
    MetaTitle: "About — Prospera",
    MetaDescription:
      "Prospera Bank, N.A. is a fictional U.S. Category I bank: consumer products, advice, commercial relationships, and branches. Member FDIC.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "monthly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "About",
      title: "A national bank with a long memory for deposits.",
      subtitle:
        "Consumer products, advice, commercial relationships, and branches. Calm, regulated, and built for households and operators who already keep books.",
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
      primary: { href: "/People", text: "Leadership & people" },
      secondary: { href: "/Locations", text: "Find a branch" },
    }),
    hubContentBlock({
      slot: "Intro",
      eyebrow: "Who we are",
      title: "Prospera Bank, N.A.",
      body: "<p>Prospera is a fictional U.S. nationally chartered bank used for this demonstration. The franchise you see here covers everyday banking, home lending, wealth and retirement advice, treasury for operating companies, and a branch network.</p><p>We publish rates as facts, keep Login as a header link, and put Apply Now on one conversion path. Advice lives under Services. We do not tell a neobank or branchless story.</p><p><small>Member FDIC. Equal Housing Lender. Rates and fees on this site are illustrative for a demo.</small></p>",
    }),
    hubStatsGrid({
      slot: "Stats",
      title: "The franchise, in brief",
      lead: "Personal products, advice services, and bankers you can meet on this site.",
      stats: [
        { slot: "StatProducts", label: "Personal products", value: "5" },
        { slot: "StatAdvice", label: "Advice services", value: "3" },
        { slot: "StatPeople", label: "Named bankers", value: "3" },
      ],
    }),
    peopleDemoGrid({
      title: "People",
      lead: "Amira Hassan leads consumer bank. Julian Park works commercial. Sofia Lang advises households and owners.",
    }),
    hubPromoCloser({
      eyebrow: "Careers",
      title: "Join the team, or write if the listing is wrong.",
      description:
        "Careers lists branch, lending, and treasury roles. Contact if you need a person, not a posting.",
      cta: { href: "/Careers", text: "See careers" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
    }),
  ]),
} satisfies PageRecipe;

export default aboutRecipe;
