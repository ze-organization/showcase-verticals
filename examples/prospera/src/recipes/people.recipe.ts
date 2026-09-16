import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout } from "./_hub-grammar";

/**
 * People listing — `/People`. Stays on `page@1` + `standard-page@1`.
 * After push, set this listing item's insert options to Person.
 */
export const peopleRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "people@1",
  name: "People",
  displayName: "People",
  description: "People listing — grid of three sample person cards under Home.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/People",
  fields: {
    Title: "People",
    Eyebrow: "Team",
    MetaTitle: "People — Prospera",
    MetaDescription:
      "Amira Hassan, Julian Park, and Sofia Lang — consumer bank, commercial, and wealth at Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
        {
          componentHandle: "hero@1",
          variant: "FullBleed",
          params: {
            HeadingLayout: "display",
            Layout: "centered",
          },
          datasourceRef: {
            kind: "scoped",
            slot: "Hero",
            fields: {
              Eyebrow: "People",
              Title: "The people behind the bank.",
              Subtitle:
                "Consumer bank, commercial, and wealth. Three bankers you can meet.",
              Image: {
                shape: "image",
                mediaPath: "/theme-photos/hub-01.jpg",
                alt: "Portrait of Amira Hassan",
              },
              PrimaryAction: { href: "/People/amira-hassan", text: "Meet Amira" },
              SecondaryAction: { href: "/Careers", text: "See careers" },
            },
          },
        },
        {
          componentHandle: "person-list-grid@1",
          variant: "Grid",
          params: {
            HeadingLayout: "start",
          },
          datasourceRef: {
            kind: "scoped",
            slot: "People",
            fields: {
              Title: "People",
              Lead: "<p>Amira Hassan leads consumer bank. Julian Park works commercial. Sofia Lang advises households and owners.</p>",
            },
          },
          placeholders: {
            "cards-persons": [
              {
                componentHandle: "person-card@1",
                variant: "Featured",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardAmira",
                  fields: {
                    FullName: "Amira Hassan",
                    Role: "Head of Consumer Bank",
                    Eyebrow: "Personal",
                    Bio: "<p>Owns checking, savings, cards, and home lending — including the HELOC.</p>",
                    Image: {
                      shape: "image",
                      mediaPath: "/theme-photos/hub-02.jpg",
                      alt: "Portrait of Amira Hassan",
                    },
                    Link: {
                      href: "/People/amira-hassan",
                      text: "View profile",
                    },
                  },
                },
              },
              {
                componentHandle: "person-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardJulian",
                  fields: {
                    FullName: "Julian Park",
                    Role: "Commercial Banker",
                    Eyebrow: "Business",
                    Bio: "<p>Works with operators on treasury, payroll, and credit.</p>",
                    Image: {
                      shape: "image",
                      mediaPath: "/theme-photos/pdp-01.jpg",
                      alt: "Portrait of Julian Park",
                    },
                    Link: {
                      href: "/People/julian-park",
                      text: "View profile",
                    },
                  },
                },
              },
              {
                componentHandle: "person-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardSofia",
                  fields: {
                    FullName: "Sofia Lang",
                    Role: "Wealth Advisor",
                    Eyebrow: "Advice",
                    Bio: "<p>Plans that sit next to checking and the operating account.</p>",
                    Image: {
                      shape: "image",
                      mediaPath: "/theme-photos/promo-closer.jpg",
                      alt: "Portrait of Sofia Lang",
                    },
                    Link: {
                      href: "/People/sofia-lang",
                      text: "View profile",
                    },
                  },
                },
              },
            ],
          },
        },
        {
          componentHandle: "promo@1",
          variant: "Default",
          params: { ImagePosition: "end", SurfaceTone: "neutral" },
          datasourceRef: {
            kind: "scoped",
            slot: "Closer",
            fields: {
              Eyebrow: "Join us",
              Title: "Open roles and a way to write.",
              Description:
                "<p>Careers lists branch, lending, and treasury roles. Contact if the role you want is not on the board yet.</p>",
              Link: { href: "/Careers", text: "See careers" },
            },
          },
        },
      ]),
} satisfies PageRecipe;

export default peopleRecipe;
