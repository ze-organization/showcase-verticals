import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const personAmiraHassanRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "person-amira-hassan@1",
  name: "amira-hassan",
  displayName: "Amira Hassan",
  description: "Sample Person page — head of consumer bank.",
  template: "person@1",
  pageDesign: "person-page@1",
  itemPath: "/sitecore/content/{site}/Home/People/amira-hassan",
  fields: {
    Title: "Amira Hassan",
    FullName: "Amira Hassan",
    Role: "Head of Consumer Bank",
    Eyebrow: "Personal",
    Bio: "<p>Amira leads consumer bank: everyday checking, high-yield savings, the Rewards Visa, the 30-year mortgage, and the home-equity line of credit.</p><p>She treats rates as facts. Apply Now is the conversion path. Login stays a header link.</p>",
    Image: {
      shape: "image",
      mediaPath: picsum("hub-personal"),
      alt: "Portrait of Amira Hassan",
    },
    Email: "amira.hassan@prospera.example",
    Phone: "+1 415 555 0142",
    MetaTitle: "Amira Hassan — Prospera",
    MetaDescription:
      "Head of Consumer Bank at Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default personAmiraHassanRecipe;
