import {
  pageTemplateThumbnail,
  type PageTemplateRecipe,
} from "./_wireframe-thumbnail";

/**
 * The shared marketing `Page` template. Lands at
 * `templates/Project/<site>/Page`. Home, listings, and generic URLs
 * use this. Insertable types (Article, …) are a **separate** page
 * template — copy `article.recipe.ts` + `article-page.recipe.ts` +
 * `article-details-partial.recipe.ts`. Do not grow this template with
 * type-specific body fields.
 *
 * Field layout:
 *
 *   Content        — page-level fields the layout may consume directly
 *                    (title for `<h1>`, eyebrow for breadcrumb-ish
 *                    contexts). Most authored content lives on rendering
 *                    datasources, not on the page itself; this section
 *                    stays small on purpose.
 *   SEO            — `<title>` + meta description + canonical + robots.
 *   Open Graph     — og:* tags; all four fall back to the SEO section
 *                    values when blank at render time.
 *   Twitter Card   — twitter:* tags; same fallback chain (Twitter →
 *                    Open Graph → SEO).
 *   Sitemap        — inclusion flag + priority + change frequency. The
 *                    sitemap generator reads these per page.
 *   Structured Data — a raw JSON-LD blob authors paste in. Optional.
 *
 * The template→design binding lives on the `PageDesignRecipe.appliesTo`
 * side, not here — see `src/recipes/standard-page.recipe.ts`, which
 * declares `appliesTo: ["page@1"]` to bind itself to this template
 * via the Sitecore Page Designs root `TemplatesMapping` field.
 *
 * Do not add `insertOptions` here for a listing type. That would
 * offer Article (etc.) under Home as well as `/Articles`. Listing
 * Insert lists are item-level; nested inserts of a type belong on
 * that type's `PageTemplateRecipe.insertOptions` (see `article@1`).
 *
 * Field model: scai's `PageTemplateRecipe` is a FLAT `fields[]` list (it
 * has no `sections[]`). The named sections above are expressed per-field via
 * `sitecore.section`; the compiler groups fields into Template Sections by
 * that name. `sitecore.sortOrder` is global (increments of 100) so the
 * cross-section emission order is preserved.
 */
export const pageRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "page@1",
  name: "Page",
  displayName: "Page",
  thumbnail: pageTemplateThumbnail("Standard_Page_Template.png", "Page"),
  description:
    "Shared Page template for every showcase experience. Carries the standard SEO / Open Graph / Twitter / Sitemap field set.",

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
      default: "website",
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
      default: "0.5",
      sitecore: {
        section: "Sitemap",
        hint: "sitemap.xml `<priority>`. 0.0–1.0, default 0.5.",
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
      default: "weekly",
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
} satisfies PageTemplateRecipe;

export default pageRecipe;
