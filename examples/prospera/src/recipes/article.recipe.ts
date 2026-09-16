import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";

/**
 * Article page template — the insert type under `/Home/Articles`.
 *
 * Same SEO / Open Graph / Twitter / Sitemap / JSON-LD field set as
 * `page@1`, plus the Article Details body fields (ShortDescription,
 * Content, Image) so `article-details@1` can use the page as its
 * datasource. Default `OgType` is `article`.
 *
 * Bound to `article-page@1` via that design's `appliesTo`. Home and
 * other marketing URLs stay on `page@1` + `standard-page@1`.
 *
 * `insertOptions: ["article@1"]` is the type-level Insert contract
 * (children of an Article are Article). The `/Articles` listing is
 * still `page@1`, so its Insert list is item-level — see
 * `articles.recipe.ts`.
 */
export const articleRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "article@1",
  name: "Article",
  displayName: "Article",
  thumbnail: pageTemplateThumbnail("Article_Page_Template.png", "Article"),
  description:
    "Article page template — Title / Eyebrow / ShortDescription / Content / Image plus the standard SEO field set. Insert this under Articles; article-page supplies the Article Details partial. insertOptions keep nested children as Article.",

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Page title used in the layout's primary `<h1>`. Distinct from Meta Title (which targets `<title>`).",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Optional small label above the title — section name, category, etc.",
        sortOrder: 200,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        section: "Content",
        type: "multi-line-text",
        hint: "Dek / standfirst under the title. Read by article-details@1.",
        sortOrder: 210,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "Article body. Read by article-details@1.",
        sortOrder: 220,
      },
    },
    {
      name: "Image",
      shape: "image",
      sitecore: {
        section: "Content",
        type: "image",
        hint: "Lead image for article-details@1. 16:9 recommended.",
        sortOrder: 230,
      },
    },
    {
      name: "MetaTitle",
      shape: "text",
      sitecore: {
        section: "SEO",
        hint: "`<title>` tag. Falls back to the item name when empty.",
        sortOrder: 300,
      },
    },
    {
      name: "MetaDescription",
      shape: "text",
      sitecore: {
        section: "SEO",
        type: "multi-line-text",
        hint: '`<meta name="description">`. 150–160 characters works best.',
        sortOrder: 400,
      },
    },
    {
      name: "CanonicalUrl",
      shape: "text",
      sitecore: {
        section: "SEO",
        hint: "Override the canonical URL. Leave empty to use the page's own URL.",
        sortOrder: 500,
      },
    },
    {
      name: "NoIndex",
      shape: "boolean",
      default: "false",
      sitecore: {
        section: "SEO",
        type: "checkbox",
        hint: "Add `noindex` to the robots meta tag.",
        sortOrder: 600,
      },
    },
    {
      name: "NoFollow",
      shape: "boolean",
      default: "false",
      sitecore: {
        section: "SEO",
        type: "checkbox",
        hint: "Add `nofollow` to the robots meta tag.",
        sortOrder: 700,
      },
    },
    {
      name: "OgTitle",
      shape: "text",
      sitecore: {
        section: "Open Graph",
        hint: "og:title. Falls back to Meta Title.",
        sortOrder: 800,
      },
    },
    {
      name: "OgDescription",
      shape: "text",
      sitecore: {
        section: "Open Graph",
        type: "multi-line-text",
        hint: "og:description. Falls back to Meta Description.",
        sortOrder: 900,
      },
    },
    {
      name: "OgImage",
      shape: "image",
      sitecore: {
        section: "Open Graph",
        hint: "og:image. Recommended 1200x630.",
        sortOrder: 1000,
      },
    },
    {
      name: "OgType",
      shape: "enum",
      values: ["website", "article"],
      default: "article",
      sitecore: {
        section: "Open Graph",
        type: "droplist",
        hint: "og:type.",
        sortOrder: 1100,
      },
    },
    {
      name: "TwitterCard",
      shape: "enum",
      values: ["summary", "summary_large_image"],
      default: "summary_large_image",
      sitecore: {
        section: "Twitter Card",
        type: "droplist",
        hint: "twitter:card type. `summary_large_image` for a hero image.",
        sortOrder: 1200,
      },
    },
    {
      name: "TwitterTitle",
      shape: "text",
      sitecore: {
        section: "Twitter Card",
        hint: "twitter:title. Falls back to OG Title, then Meta Title.",
        sortOrder: 1300,
      },
    },
    {
      name: "TwitterDescription",
      shape: "text",
      sitecore: {
        section: "Twitter Card",
        type: "multi-line-text",
        hint: "twitter:description. Falls back to OG Description, then Meta Description.",
        sortOrder: 1400,
      },
    },
    {
      name: "TwitterImage",
      shape: "image",
      sitecore: {
        section: "Twitter Card",
        hint: "twitter:image. Falls back to OG Image.",
        sortOrder: 1500,
      },
    },
    {
      name: "IncludeInSitemap",
      shape: "boolean",
      default: "true",
      sitecore: {
        section: "Sitemap",
        type: "checkbox",
        hint: "Include this page in the generated sitemap.xml.",
        sortOrder: 1600,
      },
    },
    {
      name: "SitemapPriority",
      shape: "number",
      default: "0.6",
      sitecore: {
        section: "Sitemap",
        hint: "sitemap.xml `<priority>`. 0.0–1.0, default 0.6 for articles.",
        sortOrder: 1700,
      },
    },
    {
      name: "ChangeFrequency",
      shape: "enum",
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
        type: "droplist",
        hint: "sitemap.xml `<changefreq>`.",
        sortOrder: 1800,
      },
    },
    {
      name: "JsonLd",
      shape: "text",
      sitecore: {
        section: "Structured Data",
        type: "multi-line-text",
        hint: 'Raw JSON-LD pasted into a `<script type="application/ld+json">` tag. Leave empty if you don\'t need structured data.',
        sortOrder: 1900,
      },
    },
  ],

  insertOptions: ["article@1"],
} satisfies PageTemplateRecipe;

export default articleRecipe;
