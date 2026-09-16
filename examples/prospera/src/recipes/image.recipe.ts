import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `Image` component (./image.tsx).
 *
 * Three React variants:
 *
 *   Default          image with optional caption + optional link wrapper
 *   CaptionOverlay   caption overlays the image
 *   Simple           bare image, no caption chrome
 *
 * Datasource shape mirrors `ImageFields` in `./image.tsx` exactly —
 * scai hashes each name into a deterministic field GUID, and the
 * React side reads from those names via the layout-service `fields`
 * object. Use as the canonical image rendering anywhere a partial
 * design or page wants to place an image (logo slot, hero, inline
 * editorial figures).
 *
 * Rendering params (sortOrder bands: 100s content, 200s layout,
 * 300s media, 400s surface, 500s action):
 *
 *   CaptionStyle        caption-style@1   how the caption displays
 *   CaptionSize         size@1            caption text size
 *   Framing             image-framing@1   figure chrome (rounded/full-bleed/card/circle)
 *   CaptionColorScheme  color-scheme@1    solid color band behind the caption
 *
 * A link never replaces the image — it wraps it, with the authored
 * link text feeding the anchor's accessible name.
 */
export const imageRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "image@1",
  icon: componentIcons["image@1"],
  name: "image",
  displayName: "Image",
  description:
    "Image with optional caption and optional wrapping link (link wraps the image; its text feeds the accessible name). Framing param (rounded/full-bleed/card/circle) plus caption style, size, and color-band params. Four variants: Default, CaptionOverlay, Simple, Logo (brand-mark: natural aspect, height-capped, link-wrapped — for header/footer logo slots).",

  section: { handle: "cards-and-lists-section@1" },

  fields: [
    {
      name: "Image",
      shape: "image",
      role: "content",
      default: "Sample image|/theme-photos/home-hero.jpg",
      sitecore: {
        type: "image",
        required: true,
        hint: "The image asset.",
        sortOrder: 100,
      },
    },
    {
      name: "Caption",
      shape: "text",
      default: {
        en: "Image caption",
        ar: "وصف الصورة",
        es: "Pie de imagen",
        fr: "Légende de l'image",
        de: "Bildunterschrift",
        da: "Billedtekst",
        ja: "画像のキャプション",
        "zh-CN": "图片说明",
        "zh-TW": "圖片說明",
        it: "Didascalia immagine",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional caption shown below (Default) or overlaid (CaptionOverlay).",
        sortOrder: 200,
      },
    },
    {
      name: "Link",
      shape: "link",
      // No default — link is opt-in. Authors set it per-placement.
      sitecore: {
        type: "general-link",
        hint: "Optional target URL. When set, the image is wrapped in a link — the link text becomes the anchor's accessible name (it never replaces the image).",
        sortOrder: 300,
      },
    },
  ],

  params: [
    // 200s — layout: how the caption sits relative to the image.
    //
    // Intentionally NO default: the unset param is what lets each React
    // variant supply its own fallback (Default → `below`, CaptionOverlay
    // → `overlay`). A stamped standard value would override the
    // CaptionOverlay variant's overlay default on every new placement.
    {
      name: "CaptionStyle",
      shape: "enum",
      sitecore: {
        enumHandle: "caption-style@1",
        hint: "How the caption displays — `below` (default, prose under the image), `overlay` (band pinned over the image bottom; falls back to below inside circle framing), `card` (image + caption joined in card chrome), or `none` (hide it). The CaptionOverlay variant defaults this to `overlay`.",
        sortOrder: 200,
      },
    },
    {
      name: "CaptionSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Caption text size. `default` keeps the historical small body size (text-sm).",
        sortOrder: 210,
      },
    },
    // 300s — media: chrome of the image figure.
    {
      name: "Framing",
      shape: "enum",
      default: "rounded",
      sitecore: {
        enumHandle: "image-framing@1",
        hint: "Figure chrome — `rounded` (default, theme card radius; the historical look), `full-bleed` (edge-to-edge, no chrome), `card` (Card border + elevation), or `circle` (full-round clip; captions render below the circle). Ignored by Logo, which renders a bare header lockup (fixed-height `object-contain` image, no surface) — there is no frame to style.",
        sortOrder: 300,
      },
    },
    // 400s — surface: color band behind the caption.
    {
      name: "CaptionColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Solid color band behind the caption (scheme background + matching foreground text). `none`/`default` keep the plain caption (muted prose below, dark scrim for overlay). In circle framing the band renders below the circle so it is never clipped.",
        sortOrder: 400,
      },
    },
  ],

  variants: [
    { name: "Default" },
    { name: "CaptionOverlay" },
    { name: "Simple" },
    // Brand-mark treatment: natural aspect, height-capped,
    // object-contain, wrapped in the Link field (typically the home
    // page). Use for the site logo in header/footer slots — Simple's
    // media framing (full-width aspect-video crop) stretches a logo
    // into a banner there. Ignores Framing / caption params.
    { name: "Logo" },
  ],

  placedIn: [
    "header-start-{*}",
    "footer-main-{*}",
    "footer-bottom-{*}",
    "headless-main-{*}",
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Images" },
      { scope: "site", subfolder: "Images" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default imageRecipe;
