import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `TaglineBanner` component (./tagline-banner.tsx).
 *
 * Full-width text-only band. Two real-world shapes:
 *
 *   - SYNC's "LISTEN LOUD." display heading (xl size, top-start,
 *     default surface).
 *   - Northwind's "always by your side" brand band (sm size,
 *     centered, primary surface).
 *
 * Both share the same shape; difference is purely alignment + size +
 * tone, all exposed via rendering parameters. Tagline-banner has NO
 * CTAs out of the box and emits no CDP events — it's a decorative
 * editorial surface. Experiences that need interaction can use the
 * `children` slot to inject nav strips or link lists, but those
 * compositions track their own events.
 *
 * Fields organised into Sitecore section (Content). Params split into
 * two sections — Layout (Layout / Size / AlignX / AlignY, the structural
 * + positioning axes) and Style (SurfaceTone / PaddingY, the surface
 * appearance axes) — following the section-banded sortOrder convention
 * the sibling hero recipe uses: each section owns a hundreds band and
 * items step by 10. SurfaceTone is wired to the shared `color-scheme@1`
 * enum so authors get the same dropdown shape as every other component.
 * Standard values seeded so the editor surface shows meaningful copy out
 * of the box.
 */
export const taglineBannerRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "tagline-banner@1",
  icon: componentIcons["tagline-banner@1"],
  name: "tagline-banner",
  displayName: "Tagline Banner",
  description:
    "Full-width tagline / marquee band. Big bold text that renders static or as a continuously scrolling marquee, with an optional supporting lead (in marquee mode the lead renders as a static caption below the scrolling track) and an optional background image. Use for scrolling marquees (e.g. 'LISTEN LOUD.', 'IN THE MUSIC.'), announcement bars, hero taglines / section headings, and sign-off CTA bands (e.g. 'LET'S SYNC.'). Tone, alignment, size, marquee scroll, and background image controlled via params/fields. Tint part of the tagline by wrapping it in {{accent}}…{{/accent}} in the Tagline text (color picked by AccentColor). Variants: Default (static band; marquee opt-in via param), Marquee (always-scrolling announcement band, pause on hover).",

  section: { handle: "heros-and-promos-section@1" },

  fields: [
    {
      name: "Tagline",
      shape: "text",
      default: {
        en: "Listen Loud.",
        ar: "استمع بصوت عالٍ.",
        es: "Escucha a todo volumen.",
        fr: "Écoutez fort.",
        de: "Hör laut.",
        da: "Lyt højt.",
        ja: "大音量で聴こう。",
        "zh-CN": "大声聆听。",
        "zh-TW": "大聲聆聽。",
        it: "Ascolta ad alto volume.",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Big bold display text (e.g. 'LISTEN LOUD.', 'You're in good hands.'). Wrap a span in {{accent}}…{{/accent}} to tint it with the AccentColor param — e.g. 'LISTEN {{accent}}LOUD.{{/accent}}'. Malformed (unclosed/nested) tokens render as typed. To show the literal text '{{accent}}', escape it with a backslash: \\{{accent}}.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Lead",
      shape: "text",
      default: {
        en: "Come join us.",
        ar: "انضم إلينا.",
        es: "Únete a nosotros.",
        fr: "Rejoignez-nous.",
        de: "Werden Sie Teil unseres Teams.",
        da: "Kom og vær med.",
        ja: "ぜひご参加ください。",
        "zh-CN": "加入我们吧。",
        "zh-TW": "加入我們吧。",
        it: "Unisciti a noi.",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional caption rendered below the tagline (e.g. 'Come join us.').",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "BackgroundImage",
      shape: "image",
      // Deliberately NO `role` and NO `default`: this background is
      // very optional — the band renders as a solid color by default.
      // A role would make the installer's image-defaults map fill the
      // slot on every install (role alone declares the dependency),
      // turning an opt-in embellishment into always-on imagery.
      sitecore: {
        type: "image",
        hint: "Optional full-bleed background image behind the band. Painted with a dim layer for legibility; text flips to white over it on the transparent surface.",
        section: "Content",
        sortOrder: 300,
      },
    },
  ],

  params: [
    {
      name: "Layout",
      shape: "enum",
      default: "stacked",
      sitecore: {
        enumHandle: "tagline-banner-layout@1",
        hint: "Composition of tagline + lead. `stacked` keeps them in a column. `row` flows them inline next to each other (content-sized). `row-split` puts them in a 50/50 split. `row-spread` pins tagline to the inline-start edge and lead to the inline-end edge.",
        section: "Layout",
        sortOrder: 100,
      },
    },
    // Tagline-banner uses its own size enum (sm / md / lg / xl) for
    // the banner height + tagline type scale, distinct from the
    // shared `size@1` axis (which doesn't map cleanly — there's no
    // "default" entry on this banner since picking a size is
    // load-bearing for the visual treatment).
    {
      name: "Size",
      shape: "enum",
      default: "xl",
      sitecore: {
        enumHandle: "tagline-banner-size@1",
        hint: "Banner height + tagline type scale. `sm` = thin brand strip; `md` = medium band; `lg` = section-height; `xl` = display heading.",
        section: "Layout",
        sortOrder: 110,
      },
    },
    {
      name: "AlignX",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Inline-axis alignment of the text. `start` / `end` are RTL-aware logical edges. In `stacked` layout it aligns the text column; in `row` it positions the tagline + lead pair along the row; in `row-split` it aligns the text inside each half. `row-spread` pins the two edges itself, so this only affects wrapped lines there.",
        section: "Layout",
        sortOrder: 120,
      },
    },
    {
      name: "AlignY",
      shape: "enum",
      default: "top",
      sitecore: {
        enumHandle: "tagline-banner-align-y@1",
        hint: "Block-axis alignment — `top` / `middle` / `bottom`. In every `row` layout it aligns the tagline and lead against each other within the row (visible when their sizes differ). In `stacked` layout it justifies the text column, which only shifts when the band has spare height beyond its content.",
        section: "Layout",
        sortOrder: 130,
      },
    },
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Background tone + foreground text color. Aligned to the shared color-scheme set — picking `primary` paints the band in the brand color with inverted text, `none` leaves the surface transparent.",
        section: "Style",
        sortOrder: 200,
      },
    },
    {
      // Defaults to the in-list `auto` member: the banner's natural
      // padding is Size-dependent (`sizeDefaultPaddingClass[size]` in
      // tagline-banner.tsx), so no concrete `padding-y@1` token
      // reproduces it. `auto` lets Size drive the padding; a concrete
      // pick takes over entirely.
      name: "PaddingY",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding band applied as `py-*`. `auto` (default) lets the size-bound padding drive spacing; the other values take over entirely.",
        section: "Style",
        sortOrder: 210,
      },
    },
    // RETIRED: `BackgroundScrim` (background-scrim@1) was removed from the
    // authoring surface. It only ever did anything with a BackgroundImage
    // set, and it expressed the band's tone INDIRECTLY — dimming a photo
    // to make text legible — which competes with ColorScheme, the axis
    // that actually controls this band's background. Colour control now
    // lives in one place. The prop stays accepted in tagline-banner.tsx
    // so stored placements don't error; it simply paints nothing.
    // Do not re-add.
    {
      name: "BackgroundPosition",
      shape: "enum",
      default: "center",
      sitecore: {
        enumHandle: "background-position@1",
        hint: "Crop anchor of the BackgroundImage (`object-position`) — `center` / `top` / `bottom`. No effect without a BackgroundImage.",
        section: "Style",
        sortOrder: 214,
      },
    },
    {
      name: "Marquee",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Scroll the tagline horizontally as a continuous marquee (e.g. 'LISTEN LOUD.'). Layout doesn't apply; the Lead renders as a static caption below the scrolling track. Honors `prefers-reduced-motion`.",
        section: "Style",
        sortOrder: 220,
      },
    },
    {
      name: "AccentColor",
      shape: "enum",
      default: "accent",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Tint for {{accent}}…{{/accent}} spans typed in the Tagline. `accent` (default) uses the design system's accent color. No effect when the Tagline has no accent tokens.",
        section: "Style",
        sortOrder: 230,
      },
    },
  ],

  // `Marquee` is the always-scrolling announcement-band variant (same
  // content shape; scroll always on, pause on hover/focus). The
  // `Marquee` boolean param above turns the same scroll on for a
  // `Default` placement.
  variants: [{ name: "Default" }, { name: "Marquee" }],

  placedIn: ["header-announcement-{*}", "headless-main-{*}"],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Tagline Banners" },
      { scope: "site", subfolder: "Tagline Banners" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default taglineBannerRecipe;
