import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout } from "./_hub-grammar";

export const privacyRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "privacy@1",
  name: "Privacy",
  displayName: "Privacy",
  description:
    "Privacy policy — content-block including cookie copy (consent policy target). Path /Privacy.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Privacy",
  fields: {
    Title: "Privacy",
    Eyebrow: "Legal",
    MetaTitle: "Privacy — Prospera",
    MetaDescription:
      "How Prospera handles personal data, cookies, and consent on this sample site.",
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
              Eyebrow: "Privacy",
              Title: "Privacy and cookies",
              Body:
                "<p>This site stores the minimum needed to run the experience: pages you request, forms you submit, and optional analytics events. We do not sell personal data.</p><p><strong>Cookies.</strong> We use a small set of cookies to remember consent, keep a session, and measure whether a form was submitted. The cookie banner points at this page as the policy target. You can withdraw consent by clearing site data in your browser.</p><p>Contact details you send on <a href=\"/Contact\">/Contact</a> or <a href=\"/Get-Started\">/Get-Started</a> (Apply Now) are used only to reply. Sample people, products, and branches on this site are demonstration content for the fictional Prospera Bank, N.A., not a live customer file.</p>",
            },
          },
        },
      ]),
} satisfies PageRecipe;

export default privacyRecipe;
