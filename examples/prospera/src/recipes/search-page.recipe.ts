import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout } from "./_hub-grammar";

/**
 * Site search — `/Search`. No FullBleed hero. Search-bar Action points
 * here so header/standalone bars land on this URL.
 */
export const searchPageRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "search-page@1",
  name: "Search",
  displayName: "Search",
  description:
    "Search — search-experience with a bar (Action /Search) and an articles grid. Path /Search.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Search",
  fields: {
    Title: "Search",
    Eyebrow: "Find",
    MetaTitle: "Search — Showcase",
    MetaDescription:
      "Search articles and other listings on the showcase site.",
    OgType: "website",
    TwitterCard: "summary",
    IncludeInSitemap: "true",
    SitemapPriority: "0.5",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
        {
          componentHandle: "search-experience@1",
          variant: "Default",
          params: {
            HeadingLayout: "start",
          },
          datasourceRef: {
            kind: "scoped",
            slot: "Search",
            fields: {
              Title: "Search",
              Lead: "<p>Start with a query. Results below use the Article cards already on the site.</p>",
            },
          },
          placeholders: {
            "search-controls-leading": [
              {
                componentHandle: "search-bar@1",
                variant: "Default",
                datasourceRef: {
                  kind: "scoped",
                  slot: "Bar",
                  fields: {
                    Action: { href: "/Search", text: "Search" },
                    PlaceholderText: "Search articles",
                  },
                },
              },
            ],
            "search-results": [
              {
                componentHandle: "articles-list-grid@1",
                variant: "Grid",
                params: {
                  HeadingLayout: "start",
                },
                datasourceRef: {
                  kind: "scoped",
                  slot: "Results",
                  fields: {
                    Title: "Articles",
                    Lead: "<p>Sample stories the search experience can filter.</p>",
                  },
                },
                placeholders: {
                  "cards-articles": [
                    {
                      componentHandle: "article-card@1",
                      variant: "Featured",
                      datasourceRef: {
                        kind: "scoped",
                        slot: "CardComposablePages",
                        fields: {
                          Title: "Composable pages without a template explosion",
                          Excerpt:
                            "<p>One shared Page template for marketing URLs. A dedicated Article template only when insert options and layout actually change.</p>",
                          Image: {
                            shape: "image",
                            mediaPath:
                              "/theme-photos/home-hero.jpg",
                            alt: "Modular blocks on a studio bench",
                          },
                          Link: {
                            href: "/Articles/composable-pages",
                            text: "Read article",
                          },
                          Date: "2026-04-02T09:00:00Z",
                          Eyebrow: "Architecture",
                        },
                      },
                    },
                    {
                      componentHandle: "article-card@1",
                      variant: "Standard",
                      datasourceRef: {
                        kind: "scoped",
                        slot: "CardAuthoring",
                        fields: {
                          Title:
                            "Authoring that scales: insert Article, not rebuild",
                          Excerpt:
                            "<p>When editors add a page under Articles they should get an article, already laid out — not an empty marketing Page.</p>",
                          Image: {
                            shape: "image",
                            mediaPath:
                              "/theme-photos/hub-01.jpg",
                            alt: "Editor working in a page canvas",
                          },
                          Link: {
                            href: "/Articles/authoring-that-scales",
                            text: "Read article",
                          },
                          Date: "2026-04-18T09:00:00Z",
                          Eyebrow: "Authoring",
                        },
                      },
                    },
                    {
                      componentHandle: "article-card@1",
                      variant: "Standard",
                      datasourceRef: {
                        kind: "scoped",
                        slot: "CardPersonalization",
                        fields: {
                          Title: "Personalization authors can actually run",
                          Excerpt:
                            "<p>Variants belong in Pages, not in a parallel template tree.</p>",
                          Image: {
                            shape: "image",
                            mediaPath:
                              "/theme-photos/hub-02.jpg",
                            alt: "Row of related still-life variants",
                          },
                          Link: {
                            href: "/Articles/personalization-authors-can-run",
                            text: "Read article",
                          },
                          Date: "2026-05-06T09:00:00Z",
                          Eyebrow: "Personalization",
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ]),
} satisfies PageRecipe;

export default searchPageRecipe;
