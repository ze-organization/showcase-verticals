import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `MediaItem` — the leaf gallery item for the media-gallery
 * family. Authors drop these into the `cards-media-gallery-{*}`
 * placeholder exposed by `media-gallery-list-grid@1` (composed mode).
 *
 * Variants `Image`, `Video`, `ImageWithCaption` map to the three
 * compositional shapes a media tile can take — different field-shape
 * requirements (Image-only, VideoUrl-driven, or image + caption block),
 * so the variant boundary captures real composition differences (see
 * [[feedback-variant-vs-parameter]]).
 *
 * Drop into `cards-media-gallery-{*}`, `cards-media-carousel-{*}`, or
 * `cards-media-wall-{*}`.
 */
export const mediaItemRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "media-item@1",
  icon: componentIcons["media-item@1"],
  name: "media-item",
  displayName: "Media Item",
  description:
    "Single media tile (image or video) for the media gallery family. Variants: Image, Video, ImageWithCaption.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Image",
      shape: "image",
      role: "content",
      // Picsum seed so a freshly dropped tile visualises immediately —
      // same `<alt>|<src>` convention as hero@1 / image@1.
      default: "Media item|/theme-photos/home-hero.jpg",
      sitecore: {
        type: "image",
        hint: "Tile image. Used by the Image and ImageWithCaption variants.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "VideoUrl",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Video source URL. Used by the Video variant.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "ThumbnailUrl",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional thumbnail/poster image URL for the video variant. Triggers autoplay-muted preview when present.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Media item",
        ar: "عنصر وسائط",
        es: "Elemento multimedia",
        fr: "Élément multimédia",
        de: "Medienelement",
        da: "Medieelement",
        ja: "メディア項目",
        "zh-CN": "媒体项",
        "zh-TW": "媒體項目",
        it: "Elemento multimediale",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Tile title. Shown as the caption headline.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Caption",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Caption copy shown under the title. Used by the ImageWithCaption variant.",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "AltText",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Accessible alternative text for the image.",
        section: "Accessibility",
        sortOrder: 100,
      },
    },
    // Social provenance — optional; consumed by the media-wall's
    // Lightbox detail panel (author handle, platform icon derived from
    // the permalink, display date, view-post link / embed).
    {
      name: "AuthorHandle",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Social author handle (with or without the leading @). Shown in the lightbox detail panel on social/UGC walls.",
        section: "Social",
        sortOrder: 100,
      },
    },
    {
      name: "PostUrl",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Permalink of the original post (e.g. an instagram.com/p/… URL). Drives the lightbox's platform icon, view-post link, and — when LightboxEmbedPost is on — the in-place embed.",
        section: "Social",
        sortOrder: 110,
      },
    },
    {
      name: "PostDate",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Pre-formatted display date for the lightbox detail panel (e.g. 27 Jun).",
        section: "Social",
        sortOrder: 120,
      },
    },
  ],
  variants: [
    { name: "Image" },
    { name: "Video" },
    { name: "ImageWithCaption" },
  ],
  placedIn: [
    "cards-media-gallery-{*}",
    "cards-media-carousel-{*}",
    "cards-media-wall-{*}",
  ],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Media Items" },
      { scope: "site", subfolder: "Media Items" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default mediaItemRecipe;
