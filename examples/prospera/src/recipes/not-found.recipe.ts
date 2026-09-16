import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout, hubHero } from "./_hub-grammar";

export const notFoundRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "not-found@1",
  name: "Not-Found",
  displayName: "Not Found",
  description:
    "404 page — short hero and content-block. Not in nav/footer. Bind in site Settings / Channels after push.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Not-Found",
  fields: {
    Title: "Not Found",
    Eyebrow: "Error",
    MetaTitle: "Page not found — Showcase",
    MetaDescription: "This URL is not in the catalog.",
    OgType: "website",
    TwitterCard: "summary",
    NoIndex: "true",
    IncludeInSitemap: "false",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "404",
      title: "This URL is not in the catalog.",
      subtitle:
        "The path may be leftover from a Title-Case rename, or it was never a page. Search or go home.",
      primary: { href: "/", text: "Go home" },
      secondary: { href: "/Search", text: "Search" },
      backgroundColor: "none",
    }),
    {
      componentHandle: "content-block@1",
      variant: "Default",
      datasourceRef: {
        kind: "scoped",
        slot: "Body",
        fields: {
          Title: "What to try",
          Body:
            "<p>Section pages use Title-Case segments (<code>/About</code>, <code>/Get-Started</code>). Leaf PDPs keep kebab slugs. If you followed an old lowercase bookmark, look for the Title-Case twin.</p>",
        },
      },
    },
  ]),
} satisfies PageRecipe;

export default notFoundRecipe;
