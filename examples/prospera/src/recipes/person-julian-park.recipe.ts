import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const personJulianParkRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "person-julian-park@1",
  name: "julian-park",
  displayName: "Julian Park",
  description: "Sample Person page — commercial banker.",
  template: "person@1",
  pageDesign: "person-page@1",
  itemPath: "/sitecore/content/{site}/Home/People/julian-park",
  fields: {
    Title: "Julian Park",
    FullName: "Julian Park",
    Role: "Commercial Banker",
    Eyebrow: "Business",
    Bio: "<p>Julian works with operators on treasury, payroll, and credit. He sits with controllers who already close the month and with owners who need a named banker on the file.</p>",
    Image: {
      shape: "image",
      mediaPath: picsum("hub-business"),
      alt: "Portrait of Julian Park",
    },
    Email: "julian.park@prospera.example",
    Phone: "+1 617 555 0198",
    MetaTitle: "Julian Park — Prospera",
    MetaDescription: "Commercial banker at Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default personJulianParkRecipe;
