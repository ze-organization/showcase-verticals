import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout } from "./_hub-grammar";

export const accessibilityRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "accessibility@1",
  name: "Accessibility",
  displayName: "Accessibility",
  description: "Accessibility statement — content-block. Path /Accessibility.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Accessibility",
  fields: {
    Title: "Accessibility",
    Eyebrow: "Legal",
    MetaTitle: "Accessibility — Prospera",
    MetaDescription:
      "How Prospera Bank, N.A. intends this demonstration site to work with assistive technology.",
    OgType: "website",
    TwitterCard: "summary",
    IncludeInSitemap: "true",
    SitemapPriority: "0.3",
    ChangeFrequency: "yearly",
  },
  layout: container1Layout([
        {
          componentHandle: "content-block@1",
          variant: "Default",
          datasourceRef: {
            kind: "scoped",
            slot: "Body",
            fields: {
              Eyebrow: "Accessibility",
              Title: "Accessible by default",
              Body:
                "<p>Pages use semantic headings, labeled form fields, and text alternatives on images. Apply Now is a visible button. Login is a header link with visible text — not an icon-only control.</p><p>If a page fails keyboard or screen-reader use, write us at <a href=\"/Contact\">Contact</a>. Legal pages stay as content-blocks so disclosures can be updated without a new layout.</p>",
            },
          },
        },
      ]),
} satisfies PageRecipe;

export default accessibilityRecipe;
