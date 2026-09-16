import type { SiteTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe/unstable";

/**
 * Site template for this head app — the catalog that declares which
 * page templates and page designs the starter site offers. Bound to
 * the existing tenant site (`starter` / `starter-collection`); this
 * is NOT a `SiteRecipe` and does not provision a new Sitecore site.
 *
 * **scai-side gap.** scai's `compileSiteTemplateRecipe` accepts
 * `pageTemplates`, `pageDesigns`, `templatesToDesigns`, and
 * `dictionaries` but currently drops them at install time. Author them
 * anyway: when scai catches up, this template starts wiring the actual
 * site shape with no recipe rewrite. Until then the live binding is
 * `standard-page@1`'s `appliesTo: ["page@1"]`,
 * `article-page@1`'s `appliesTo: ["article@1"]`,
 * `article-with-toc-page@1`'s `appliesTo: ["article-with-toc@1"]`,
 * and the Product / Person / Destination / Service / Landing /
 * Blank Landing / Case Study / Location designs' `appliesTo`, which the compiler
 * aggregates into the Page Designs root `TemplatesMapping` field.
 *
 * `dictionaries` lists only handles that exist under `src/recipes/`.
 * Do not add `core-ui-labels-*` until those recipes are in this repo.
 */
export const starterSiteTemplateRecipe = {
  kind: "site-template",
  schemaVersion: "1",
  handle: "starter-site-template@1",
  name: "Starter",
  displayName: "Starter Site",
  description:
    "Canonical site shape for this head app — marketing Page + insertable Article, Article with Table of Contents, Product, Person, Destination, Service, Landing, Blank Landing, Case Study, Location, News, Partner, Event, Job, Offer, browse hubs (Category / Subcategory / Region / Country / Territory / Metro), their page designs, header/footer/details partials. Does not create a Sitecore site; it catalogs the templates and designs the existing starter site uses.",
  pageTemplates: [
    "page@1",
    "article@1",
    "article-with-toc@1",
    "product@1",
    "person@1",
    "destination@1",
    "service@1",
    "landing@1",
    "blank-landing@1",
    "case-study@1",
    "location@1",
    "product-category@1",
    "product-subcategory@1",
    "destination-region@1",
    "destination-country@1",
    "location-territory@1",
    "location-metro@1",
    "news@1",
    "partner@1",
    "event@1",
    "job@1",
    "offer@1",
  ],
  pageDesigns: [
    "standard-page@1",
    "article-page@1",
    "article-with-toc-page@1",
    "product-page@1",
    "person-page@1",
    "destination-page@1",
    "service-page@1",
    "landing-page@1",
    "blank-landing-page@1",
    "case-study-page@1",
    "location-page@1",
    "hub-page@1",
    "news-page@1",
    "partner-page@1",
    "event-page@1",
    "job-page@1",
    "offer-page@1",
  ],
  templatesToDesigns: {
    "page@1": "standard-page@1",
    "article@1": "article-page@1",
    "article-with-toc@1": "article-with-toc-page@1",
    "product@1": "product-page@1",
    "person@1": "person-page@1",
    "destination@1": "destination-page@1",
    "service@1": "service-page@1",
    "landing@1": "landing-page@1",
    "blank-landing@1": "blank-landing-page@1",
    "case-study@1": "case-study-page@1",
    "location@1": "location-page@1",
    "product-category@1": "hub-page@1",
    "product-subcategory@1": "hub-page@1",
    "destination-region@1": "hub-page@1",
    "destination-country@1": "hub-page@1",
    "location-territory@1": "hub-page@1",
    "location-metro@1": "hub-page@1",
    "news@1": "news-page@1",
    "partner@1": "partner-page@1",
    "event@1": "event-page@1",
    "job@1": "job-page@1",
    "offer@1": "offer-page@1",
  },
  insertOptionsMatrix: {
    "page@1": ["page@1"],
    "article@1": ["article@1"],
    "article-with-toc@1": ["article-with-toc@1"],
    "product@1": ["product@1"],
    "person@1": ["person@1"],
    "destination@1": ["destination@1"],
    "service@1": ["service@1"],
    "landing@1": ["landing@1"],
    "blank-landing@1": ["blank-landing@1"],
    "case-study@1": ["case-study@1"],
    "location@1": ["location@1"],
    "product-category@1": ["product-subcategory@1", "product@1"],
    "product-subcategory@1": ["product@1"],
    "destination-region@1": ["destination-country@1", "destination@1"],
    "destination-country@1": ["destination@1"],
    "location-territory@1": ["location-metro@1", "location@1"],
    "location-metro@1": ["location@1"],
    "news@1": ["news@1"],
    "partner@1": ["partner@1"],
    "event@1": ["event@1"],
    "job@1": ["job@1"],
    "offer@1": ["offer@1"],
  },
  dictionaries: [
    "ai-chat-ui-labels-composer@1",
    "ai-chat-ui-labels-conversation@1",
    "ai-chat-ui-labels-actions@1",
    "ai-chat-ui-labels-tools@1",
    "ai-chat-ui-labels-overlays@1",
  ],
} satisfies SiteTemplateRecipe;

export default starterSiteTemplateRecipe;
