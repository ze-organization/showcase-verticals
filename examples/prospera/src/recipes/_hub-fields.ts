import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

/**
 * Shared Content + SEO fields for hub page templates (Category,
 * Subcategory, Region, Country, Territory, Metro). Not a recipe —
 * scai only globs `*.recipe.ts`.
 */
export const HUB_PAGE_FIELDS = [
  {
    name: "Title",
    shape: "text" as const,
    sitecore: {
      section: "Content",
      hint: "Hub title used in the layout's primary heading. Distinct from Meta Title.",
      sortOrder: 100,
    },
  },
  {
    name: "Eyebrow",
    shape: "text" as const,
    sitecore: {
      section: "Content",
      hint: "Optional small label above the title — section name, etc.",
      sortOrder: 200,
    },
  },
  {
    name: "ShortDescription",
    shape: "text" as const,
    sitecore: {
      section: "Content",
      type: "multi-line-text" as const,
      hint: "Dek / standfirst for the hub. Used on cards that point here.",
      sortOrder: 210,
    },
  },
  {
    name: "Content",
    shape: "richText" as const,
    sitecore: {
      section: "Content",
      type: "rich-text" as const,
      hint: "Optional hub body. Most hub copy lives on the page design's scoped placements.",
      sortOrder: 220,
    },
  },
  {
    name: "Image",
    shape: "image" as const,
    sitecore: {
      section: "Content",
      type: "image" as const,
      hint: "Hub image. 16:9 recommended. Taken from a child when seeding.",
      sortOrder: 230,
    },
  },
  ...PAGE_SEO_FIELDS,
];
