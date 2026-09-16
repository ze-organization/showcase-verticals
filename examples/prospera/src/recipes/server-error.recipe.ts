import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout, hubHero } from "./_hub-grammar";

export const serverErrorRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "server-error@1",
  name: "Server-Error",
  displayName: "Server Error",
  description:
    "500 page — short hero and content-block. Not in nav/footer. Bind in site Settings / Channels after push.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Server-Error",
  fields: {
    Title: "Server Error",
    Eyebrow: "Error",
    MetaTitle: "Something went wrong — Showcase",
    MetaDescription: "The server could not finish this request.",
    OgType: "website",
    TwitterCard: "summary",
    NoIndex: "true",
    IncludeInSitemap: "false",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "500",
      title: "The server could not finish this request.",
      subtitle:
        "Try home or search. If a form just submitted, wait a moment and send it once.",
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
            "<p>Refresh once. If the page still fails, go home or search for the listing you wanted. Sample content on this site should not require a login.</p>",
        },
      },
    },
  ]),
} satisfies PageRecipe;

export default serverErrorRecipe;
