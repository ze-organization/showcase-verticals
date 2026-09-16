import type { ContentItemRecipe, PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  type LocationDemo,
  locationHref,
  locationItemPath,
  locationPageHandle,
} from "./_location-demo-data";

export function locationPageRecipeFromDemo(demo: LocationDemo): PageRecipe {
  return {
    kind: "page",
    schemaVersion: "1",
    handle: locationPageHandle(demo),
    name: demo.slug,
    displayName: demo.name,
    description: `Sample Location page — ${demo.name}.`,
    template: "location@1",
    pageDesign: "location-page@1",
    itemPath: locationItemPath(demo),
    fields: {
      Title: demo.name,
      Eyebrow: demo.eyebrow,
      Region: demo.region,
      ShortDescription: demo.shortDescription,
      Content: demo.content,
      Address1: demo.address1,
      ...(demo.address2 ? { Address2: demo.address2 } : {}),
      City: demo.city,
      State: demo.state,
      PostalCode: demo.postalCode,
      Country: demo.country,
      Phone: demo.phone,
      Email: demo.email,
      Hours: demo.hours,
      Latitude: String(demo.latitude),
      Longitude: String(demo.longitude),
      Image: {
        shape: "image",
        mediaPath: `/theme-photos/promo-closer.jpg`,
        alt: demo.imageAlt,
      },
      MetaTitle: `${demo.name} — Showcase`,
      MetaDescription: demo.shortDescription,
      OgType: "website",
      TwitterCard: "summary_large_image",
      IncludeInSitemap: "true",
      SitemapPriority: "0.6",
      ChangeFrequency: "monthly",
    },
    layout: { placeholders: {} },
  } satisfies PageRecipe;
}

export function locationCardRecipeFromDemo(demo: LocationDemo): ContentItemRecipe {
  return {
    kind: "content-item" as const,
    schemaVersion: "1" as const,
    handle: `location-card-${demo.slug}@1`,
    name: `location-card-${demo.slug}`,
    displayName: demo.name,
    description: `Finder card for ${demo.name}.`,
    templateType: "location-card@1",
    folder: ["Locations"],
    fields: {
      Name: { shape: "text" as const, value: demo.name },
      Address1: { shape: "text" as const, value: demo.address1 },
      ...(demo.address2
        ? { Address2: { shape: "text" as const, value: demo.address2 } }
        : {}),
      City: { shape: "text" as const, value: demo.city },
      State: { shape: "text" as const, value: demo.state },
      PostalCode: { shape: "text" as const, value: demo.postalCode },
      Country: { shape: "text" as const, value: demo.country },
      Phone: { shape: "text" as const, value: demo.phone },
      Email: { shape: "text" as const, value: demo.email },
      Hours: { shape: "richText" as const, value: demo.hours },
      Latitude: { shape: "number" as const, value: demo.latitude },
      Longitude: { shape: "number" as const, value: demo.longitude },
      Image: {
        shape: "image" as const,
        mediaPath: `/theme-photos/home-hero.jpg`,
        alt: demo.imageAlt,
      },
      Link: {
        shape: "link-external" as const,
        href: locationHref(demo),
        text: "View location",
      },
    },
  } satisfies ContentItemRecipe;
}
