/**
 * Shared SEO / OG / Twitter / Sitemap / JSON-LD fields copied from
 * `page@1` / `article@1`. Spread into insertable page templates after
 * the type-specific Content fields. `OgType` defaults to `website`.
 *
 * Sort orders start at 300 so Content fields stay 100–290.
 * Not a recipe — scai only globs `*.recipe.ts`.
 */
export const PAGE_SEO_FIELDS = [
  {
    name: "MetaTitle",
    shape: "text" as const,
    sitecore: {
      section: "SEO",
      hint: "`<title>` tag. Falls back to the item name when empty.",
      sortOrder: 300,
    },
  },
  {
    name: "MetaDescription",
    shape: "text" as const,
    sitecore: {
      section: "SEO",
      type: "multi-line-text" as const,
      hint: '`<meta name="description">`. 150–160 characters works best.',
      sortOrder: 400,
    },
  },
  {
    name: "CanonicalUrl",
    shape: "text" as const,
    sitecore: {
      section: "SEO",
      hint: "Override the canonical URL. Leave empty to use the page's own URL.",
      sortOrder: 500,
    },
  },
  {
    name: "NoIndex",
    shape: "boolean" as const,
    default: "false",
    sitecore: {
      section: "SEO",
      type: "checkbox" as const,
      hint: "Add `noindex` to the robots meta tag.",
      sortOrder: 600,
    },
  },
  {
    name: "NoFollow",
    shape: "boolean" as const,
    default: "false",
    sitecore: {
      section: "SEO",
      type: "checkbox" as const,
      hint: "Add `nofollow` to the robots meta tag.",
      sortOrder: 700,
    },
  },
  {
    name: "OgTitle",
    shape: "text" as const,
    sitecore: {
      section: "Open Graph",
      hint: "og:title. Falls back to Meta Title.",
      sortOrder: 800,
    },
  },
  {
    name: "OgDescription",
    shape: "text" as const,
    sitecore: {
      section: "Open Graph",
      type: "multi-line-text" as const,
      hint: "og:description. Falls back to Meta Description.",
      sortOrder: 900,
    },
  },
  {
    name: "OgImage",
    shape: "image" as const,
    sitecore: {
      section: "Open Graph",
      hint: "og:image. Recommended 1200x630.",
      sortOrder: 1000,
    },
  },
  {
    name: "OgType",
    shape: "enum" as const,
    values: ["website", "article"],
    default: "website",
    sitecore: {
      section: "Open Graph",
      type: "droplist" as const,
      hint: "og:type.",
      sortOrder: 1100,
    },
  },
  {
    name: "TwitterCard",
    shape: "enum" as const,
    values: ["summary", "summary_large_image"],
    default: "summary_large_image",
    sitecore: {
      section: "Twitter Card",
      type: "droplist" as const,
      hint: "twitter:card type. `summary_large_image` for a hero image.",
      sortOrder: 1200,
    },
  },
  {
    name: "TwitterTitle",
    shape: "text" as const,
    sitecore: {
      section: "Twitter Card",
      hint: "twitter:title. Falls back to OG Title, then Meta Title.",
      sortOrder: 1300,
    },
  },
  {
    name: "TwitterDescription",
    shape: "text" as const,
    sitecore: {
      section: "Twitter Card",
      type: "multi-line-text" as const,
      hint: "twitter:description. Falls back to OG Description, then Meta Description.",
      sortOrder: 1400,
    },
  },
  {
    name: "TwitterImage",
    shape: "image" as const,
    sitecore: {
      section: "Twitter Card",
      hint: "twitter:image. Falls back to OG Image.",
      sortOrder: 1500,
    },
  },
  {
    name: "IncludeInSitemap",
    shape: "boolean" as const,
    default: "true",
    sitecore: {
      section: "Sitemap",
      type: "checkbox" as const,
      hint: "Include this page in the generated sitemap.xml.",
      sortOrder: 1600,
    },
  },
  {
    name: "SitemapPriority",
    shape: "number" as const,
    default: "0.6",
    sitecore: {
      section: "Sitemap",
      hint: "sitemap.xml `<priority>`. 0.0–1.0, default 0.6 for insertable types.",
      sortOrder: 1700,
    },
  },
  {
    name: "ChangeFrequency",
    shape: "enum" as const,
    values: [
      "always",
      "hourly",
      "daily",
      "weekly",
      "monthly",
      "yearly",
      "never",
    ],
    default: "monthly",
    sitecore: {
      section: "Sitemap",
      type: "droplist" as const,
      hint: "sitemap.xml `<changefreq>`.",
      sortOrder: 1800,
    },
  },
  {
    name: "JsonLd",
    shape: "text" as const,
    sitecore: {
      section: "Structured Data",
      type: "multi-line-text" as const,
      hint: 'Raw JSON-LD pasted into a `<script type="application/ld+json">` tag. Leave empty if you don\'t need structured data.',
      sortOrder: 1900,
    },
  },
];
