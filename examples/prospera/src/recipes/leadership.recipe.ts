import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout, hubHero, hubPromoCloser } from "./_hub-grammar";
import { peopleDemoGrid } from "./_people-demo-cards";

export const leadershipRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "leadership@1",
  name: "Leadership",
  displayName: "Leadership",
  description:
    "Leadership — hub grammar over the existing three Person URLs. Path /Leadership.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Leadership",
  fields: {
    Title: "Leadership",
    Eyebrow: "People",
    MetaTitle: "Leadership — Prospera",
    MetaDescription:
      "Amira Hassan, Julian Park, and Sofia Lang — consumer bank, commercial, and wealth.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.7",
    ChangeFrequency: "monthly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Leadership",
      title: "The people who own the franchise.",
      subtitle:
        "Consumer bank, commercial, and wealth. The same three people as /People.",
      primary: { href: "/People/amira-hassan", text: "Meet Amira" },
      secondary: { href: "/People", text: "All people" },
      imageSeed: "amira-hassan",
      imageAlt: "Portrait of Amira Hassan",
    }),
    peopleDemoGrid({
      title: "Leadership",
      lead: "Amira Hassan leads consumer bank. Julian Park works commercial. Sofia Lang advises households and owners.",
    }),
    hubPromoCloser({
      eyebrow: "Join us",
      title: "Open roles, or write if the board is wrong.",
      description:
        "Careers lists branch, lending, and treasury roles. Contact if the role you want is not posted yet.",
      cta: { href: "/Careers", text: "See careers" },
    }),
  ]),
} satisfies PageRecipe;

export default leadershipRecipe;
