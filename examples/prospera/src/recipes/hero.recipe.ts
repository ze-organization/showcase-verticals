import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `Hero` component (./hero.tsx).
 *
 * Page-top hero — the full-bleed editorial / overlay treatment. Two
 * variants:
 *
 *   - `FullBleed`    edge-to-edge media with overlay panel (flagship;
 *                    the unnamed `Default` resolves here).
 *   - `Placeholders` FullBleed shell with the overlay exposed as the
 *                    `hero-overlay-content-{*}` placeholder; heading
 *                    fields render above the slot when set.
 *
 * Two-column / stacked / centered editorial shapes deliberately live on
 * `promo@1`, not here — Hero owns the overlay-design treatment.
 *
 * Authors compose the surface via:
 *
 *   - **Background** — `BackgroundColor` paints the band when no
 *     image / video is set; image / video always wins when populated.
 *   - **Overlay** — `Overlay*` axes drive a floating-card or
 *     full-height tinted panel over the media. `OverlayEnabled = false`
 *     drops the panel and renders text directly over the background.
 *   - **Media** — `Image` + `VideoUrl` choose between still / video.
 *     `MediaInset` (`promo-inset@1`) frames the media: `fullBleed`
 *     (default) / `contained` / `card` (contained + card radius — the
 *     Greene-King inset photo). `MediaPlayback` (`video-playback@1`)
 *     picks how the video starts: `click-to-play` (default; the Image
 *     doubles as the poster) or `autoplay` (muted inline).
 *     `MediaMuted` / `MediaLoop` tune it.
 *   - **Breach + band** — `OverlayBreach` shifts the overlay card
 *     outward to straddle the media edge (card shape only; no-ops for
 *     band shapes). `BottomBandColorScheme` attaches a solid strip to
 *     the hero's bottom edge; a bottom-breaching card straddles onto
 *     it (Allstate tabs-on-band base).
 *
 * Simpler editorial shapes live on `promo@1` and `article-header@1`.
 */
export const heroRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "hero@1",
  icon: componentIcons["hero@1"],
  name: "hero",
  displayName: "Hero",
  description:
    "Page-top hero with image/video backdrop, eyebrow + title + supporting copy, optional primary/secondary CTAs, and a `hero-overlay-content-{*}` placeholder for arbitrary blocks. Two variants — FullBleed (the flagship full-bleed overlay treatment) and Placeholders (same shell; the overlay panel renders the heading fields above a Sitecore placeholder slot). WHEN TO PICK Placeholders: the source shows a photo band with a heading and a floating row of small icon/utility cards (the 'How can we help you?' task-portal band) — set Image, a centered Title (`Layout: centered`), a dark full-band scrim (`OverlayShape: full-height`, `OverlayWidth: full`, `OverlayStyle: solid`, `OverlayColorScheme: black`, `OverlayOpacity: 45`), and compose `quick-links-tiles@1` (Default, Columns 4, TileSize sm, MaxWidth standard, PaddingY none, icons from icon-name@1) into the `hero-overlay-content-{*}` slot. Inset treatments: `MediaInset` frames the photo inside the page surface (`contained` / `card` — card radius), `OverlayBreach` shifts the overlay card outward to straddle the media edge (the Greene-King inset-photo + breaching-card look), and `BottomBandColorScheme` attaches a solid color strip to the hero's bottom edge (the Allstate tabs-on-band base; pair with overlap-top on the next section).",

  section: { handle: "heros-and-promos-section@1" },

  // Authors can drop any rendering into the overlay panel — badge
  // strips, stats grids, subscribe forms, etc. — without the
  // component learning new fields.
  dynamicPlaceholders: true,
  placeholders: [{ key: "hero-overlay-content-{*}" }],

  fields: [
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Small uppercase line above the title (topic tag).",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Headline goes here",
        ar: "العنوان الرئيسي هنا",
        es: "Aquí va el titular",
        fr: "Titre à insérer ici",
        de: "Überschrift hier einfügen",
        da: "Overskrift her",
        ja: "ここに見出しが入ります",
        "zh-CN": "此处填写标题",
        "zh-TW": "此處填寫標題",
        it: "Titolo qui",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Hero headline. Renders as the H1 inside the overlay/heading column.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Subtitle",
      shape: "richText",
      default: {
        en: "<p>Optional supporting subtitle.</p>",
        ar: "<p>عنوان فرعي داعم اختياري.</p>",
        es: "<p>Subtítulo de apoyo opcional.</p>",
        fr: "<p>Sous-titre d'accompagnement facultatif.</p>",
        de: "<p>Optionaler ergänzender Untertitel.</p>",
        da: "<p>Valgfri understøttende undertitel.</p>",
        ja: "<p>任意の補足サブタイトルです。</p>",
        "zh-CN": "<p>可选的辅助副标题。</p>",
        "zh-TW": "<p>可選的輔助副標題。</p>",
        it: "<p>Sottotitolo di supporto facoltativo.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Optional supporting subtitle / lead paragraph.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Description",
      shape: "richText",
      default: {
        en: "<p>Longer descriptive copy under the title.</p>",
        ar: "<p>نص وصفي أطول أسفل العنوان.</p>",
        es: "<p>Texto descriptivo más largo debajo del título.</p>",
        fr: "<p>Texte descriptif plus long sous le titre.</p>",
        de: "<p>Längerer beschreibender Text unter dem Titel.</p>",
        da: "<p>Længere beskrivende tekst under titlen.</p>",
        ja: "<p>タイトルの下に表示する、やや長めの説明文です。</p>",
        "zh-CN": "<p>标题下方较长的描述性文案。</p>",
        "zh-TW": "<p>標題下方較長的描述性文案。</p>",
        it: "<p>Testo descrittivo più lungo sotto il titolo.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Longer descriptive copy under the title.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "hero",
      // Picsum seed so a freshly dropped hero visualises immediately —
      // and so the field ALWAYS materialises a media item at push time.
      // With an installer image-defaults map, the brand's `hero` image
      // substitutes this URL; without one, the stock seed uploads.
      // Pipe convention: `<alt>|<src>`.
      default: "Hero visual|/theme-photos/home-hero.jpg",
      sitecore: {
        type: "image",
        hint: "Background or accompanying media image.",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "VideoUrl",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional background video URL. Takes precedence over Image.",
        section: "Content",
        sortOrder: 600,
      },
    },
    {
      name: "VideoLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Accessible label for the background video (screen readers). Falls back to the hero Title when empty.",
        section: "Content",
        sortOrder: 610,
      },
    },
    {
      name: "VideoCaptionUrl",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional captions track URL (WebVTT) attached to the background video.",
        section: "Content",
        sortOrder: 620,
      },
    },
    {
      name: "PrimaryAction",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Primary CTA. Tracked as `hero.primary-cta-clicked`.",
        section: "Action",
        sortOrder: 100,
      },
    },
    {
      name: "SecondaryAction",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional secondary CTA. Tracked as `hero.secondary-cta-clicked`.",
        section: "Action",
        sortOrder: 200,
      },
    },
  ],

  params: [
    // ─── Layout ───────────────────────────────────────────────────
    // Frame layout is the VARIANT axis on Hero — FullBleed (the
    // overlay shell) or Placeholders. It is not a param because the
    // shapes are structurally distinct (different shells). Authors
    // switch by choosing the variant in Pages; `Layout` below is the
    // text-block alignment, shared with Promo.
    // ─── Action ───────────────────────────────────────────────────
    // CTA treatment. `ActionSize` sizes BOTH buttons; each button then
    // carries its own variant + colorScheme (secondary keeps the
    // outline default it has always rendered).
    {
      name: "ActionSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Size token shared by BOTH CTA buttons. Uses the shared size scale.",
        section: "Action",
        sortOrder: 300,
      },
    },
    {
      name: "PrimaryActionVariant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Visual style of the primary CTA (filled / outline / ghost / link).",
        section: "Action",
        sortOrder: 310,
      },
    },
    {
      name: "PrimaryActionColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color scheme of the primary CTA button. Independent from the overlay/background tone.",
        section: "Action",
        sortOrder: 320,
      },
    },
    {
      name: "PrimaryActionShowArrow",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Append a trailing arrow (→) after the primary CTA label.",
        section: "Action",
        sortOrder: 325,
      },
    },
    {
      name: "SecondaryActionVariant",
      shape: "enum",
      default: "outline",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Visual style of the secondary CTA. Defaults to outline.",
        section: "Action",
        sortOrder: 330,
      },
    },
    {
      name: "SecondaryActionColorScheme",
      shape: "enum",
      default: "neutral",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color scheme of the secondary CTA button.",
        section: "Action",
        sortOrder: 340,
      },
    },
    {
      name: "SecondaryActionShowArrow",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Append a trailing arrow (→) after the secondary CTA label.",
        section: "Action",
        sortOrder: 345,
      },
    },
    {
      name: "HeadingLayout",
      shape: "enum",
      sitecore: {
        enumHandle: "hero-heading-layout@1",
        hint: "Heading SCALE preset — `display` (oversized editorial title, tight line-height, kicker-size eyebrow) or `compact` (smaller title + discreet eyebrow). Sets the default title ramp only: an explicit `TitleSize` overrides the title part and this then affects the eyebrow scale alone. Not a line-height control — pair with `TitleSize` / `TitleWeight` for full title treatment.",
        section: "Layout",
        sortOrder: 110,
      },
    },
    {
      name: "TitleSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Title scale. `default` keeps the layout-driven ramp (display / compact); explicit values pin the responsive text size from `xs` to `xl` (display-poster).",
        section: "Layout",
        sortOrder: 112,
      },
    },
    {
      name: "TitleWeight",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "title-weight@1",
        hint: "Title font weight. `default` reads the theme's `--heading-weight` token (falls back to the hero's light 300 face); `light` … `heavy` pin an explicit weight.",
        section: "Layout",
        sortOrder: 114,
      },
    },
    {
      name: "Layout",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "text-alignment@1",
        hint: "Text-block alignment of the eyebrow + title + body + CTA column. `start` (default), `centered`, or `end`. Shared with Promo's Layout param.",
        section: "Layout",
        sortOrder: 120,
      },
    },
    {
      name: "EyebrowColorScheme",
      shape: "enum",
      default: "neutral",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Brand-toned eyebrow color. `neutral` (default) inherits the muted text color; any other value pins to a role color.",
        section: "Layout",
        sortOrder: 130,
      },
    },
    // ─── Background ───────────────────────────────────────────────
    {
      name: "BackgroundColor",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Solid background color for the hero band. Used when no `Image` / `VideoUrl` is set — image / video always wins when populated. `none` falls back to the page surface.",
        section: "Background",
        sortOrder: 200,
      },
    },
    // Bottom band strip. Always spans the full bleed width (even with
    // contained/card media) and resolves through the shared
    // section-surface intensity classes; a bottom-breaching overlay
    // card straddles onto it.
    {
      name: "BottomBandColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Solid color strip attached to the hero's bottom edge. Pair with an overlapping row below (overlap-top on the next component) for the Allstate-style tabs-on-band look. `none` = no band.",
        section: "Background",
        sortOrder: 210,
      },
    },
    // Named for the band (not `BackgroundIntensity`) — hero has no
    // section-background intensity axis, and this knob must not imply
    // it re-tones the `BackgroundColor` surface.
    {
      name: "BottomBandIntensity",
      shape: "enum",
      default: "bold",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "How saturated the bottom band strip is. `bold` (default) paints the pure brand color with inverted text tokens — the Allstate solid strip; `subtle` uses the soft `-background` tint.",
        section: "Background",
        sortOrder: 220,
      },
    },
    // ─── Overlay ──────────────────────────────────────────────────
    {
      name: "OverlayEnabled",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Render the overlay panel on top of the background. Off = headline + CTAs without a tinted container.",
        section: "Overlay",
        sortOrder: 300,
      },
    },
    {
      name: "OverlayStyle",
      shape: "enum",
      default: "solid",
      sitecore: {
        enumHandle: "overlay-style@1",
        hint: "Visual treatment for the overlay surface. `solid` paints `OverlayColorScheme` at `OverlayOpacity`. `gradient` fades from the color toward the opposite edge. `blur` adds backdrop-blur over the color.",
        section: "Overlay",
        sortOrder: 310,
      },
    },
    {
      name: "OverlayColorScheme",
      shape: "enum",
      default: "black",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Base color of the overlay surface. `black` / `white` / role colors all valid; pairs with `OverlayOpacity` for the final blend over the background.",
        section: "Overlay",
        sortOrder: 320,
      },
    },
    {
      name: "OverlayOpacity",
      shape: "text",
      default: "45",
      sitecore: {
        type: "single-line-text",
        hint: "Overlay alpha, 0–100. Applied to the fill layer only (text stays at 100%). Runtime clamps invalid values to 45.",
        section: "Overlay",
        sortOrder: 330,
      },
    },
    {
      name: "OverlayShape",
      shape: "enum",
      default: "card",
      sitecore: {
        enumHandle: "overlay-shape@1",
        hint: "`card` — floating rounded panel that fits its content. `full-height` — overlay stretches the full hero band height. `lower-third` — flush text band anchored to the bottom of the hero (pairs well with `OverlayStyle: gradient`). All shapes respect `OverlayWidth` + `OverlayPosition`.",
        section: "Overlay",
        sortOrder: 340,
      },
    },
    {
      name: "OverlayWidth",
      shape: "enum",
      default: "half",
      sitecore: {
        enumHandle: "overlay-width@1",
        hint: "Desktop width fraction — `quarter` / `third` / `half` (default) / `two-thirds` / `three-quarters` / `full`. Mobile collapses to full width.",
        section: "Overlay",
        sortOrder: 350,
      },
    },
    {
      name: "OverlayPosition",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "overlay-position@1",
        hint: "Inline-axis placement on desktop — `start` / `center` / `end`. The gap from the edge is set by `OverlayPadding` (`default` = flush).",
        section: "Overlay",
        sortOrder: 360,
      },
    },
    {
      name: "OverlayMobilePosition",
      shape: "enum",
      default: "top",
      sitecore: {
        enumHandle: "overlay-mobile-position@1",
        hint: "Block-axis placement on mobile widths — `top` (panel at the top of the band) or `bottom`. On mobile, full-height overlays become partial-height strips so the background stays visible above or below the panel.",
        section: "Overlay",
        sortOrder: 365,
      },
    },
    {
      name: "OverlayPadding",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Inline gutter that offsets a `start` / `end` overlay from the edge. `default` = flush; `xs` … `xl` push the panel inward.",
        section: "Overlay",
        sortOrder: 370,
      },
    },
    // OFF-checkbox convention: no `default` — absent param = no breach,
    // so stored placements render byte-identically.
    {
      name: "OverlayBreach",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Shift the overlay card outward to straddle the media edge. Reads best with an inset MediaInset — with full-bleed media the card hangs into the section padding. No effect for full-width overlay shapes.",
        section: "Overlay",
        sortOrder: 375,
      },
    },
    // ─── Media ────────────────────────────────────────────────────
    // Media-frame inset. Reuses the shared band-inset enum
    // (`promo-inset@1` — the handle keeps its historical name; the
    // vocabulary is band-generic). Absent param = fullBleed, so stored
    // placements render byte-identically.
    {
      name: "MediaInset",
      shape: "enum",
      default: "fullBleed",
      sitecore: {
        enumHandle: "promo-inset@1",
        hint: "How the media sits in the band: `fullBleed` (default) — edge-to-edge photo/video; `contained` — the page background frames the media with the content-container gutter around it; `card` — contained plus the theme's card radius on the media (the Greene-King-style inset hero photo). Pair `card` with `OverlayBreach` for the card-straddling-the-photo-edge look.",
        section: "Media",
        sortOrder: 390,
      },
    },
    // ─── Media (video controls) ───────────────────────────────────
    // One `MediaPlayback` axis for how an authored video starts
    // (see resolveVideoPlayback in src/lib/registry/media-playback.ts).
    {
      name: "MediaPlayback",
      shape: "enum",
      default: "click-to-play",
      sitecore: {
        enumHandle: "video-playback@1",
        hint: "How the video starts. `click-to-play` (default): the Image field (or the provider thumbnail) renders as the poster with a play button — clicking loads AND plays. `autoplay`: muted inline background playback (reduced-motion safe); the Image serves as the loading placeholder.",
        section: "Media",
        sortOrder: 400,
      },
    },
    {
      name: "MediaMuted",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Mute click-to-play playback. Autoplay is ALWAYS muted regardless (browsers require it).",
        section: "Media",
        sortOrder: 410,
      },
    },
    {
      name: "MediaLoop",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Loop the video. Autoplay backdrops loop by default.",
        section: "Media",
        sortOrder: 420,
      },
    },
    // ─── Analytics ────────────────────────────────────────────────
    {
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable author-friendly handle for analytics (e.g. 'home-hero-2026-q2'). Defaults to the rendering id when blank.",
        section: "Analytics",
        sortOrder: 900,
      },
    },
    {
      name: "InstanceScope",
      shape: "enum",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Whether this hero is reused site-wide or unique per page. Drives personalization partition keys.",
        section: "Analytics",
        sortOrder: 910,
      },
    },
    {
      name: "TrackEvents",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Emit CDP events for view + CTA clicks. Off by default.",
        section: "Analytics",
        sortOrder: 920,
      },
    },
  ],

  // Two variants — the flagship overlay shell plus a Placeholders shell.
  //   FullBleed     — edge-to-edge media with overlay panel (flagship;
  //                   the unnamed `Default` export aliases this).
  //   Placeholders  — FullBleed shell with the overlay panel exposing
  //                   the `hero-overlay-content-{*}` Sitecore
  //                   placeholder. The heading fields (Eyebrow / Title /
  //                   Subtitle / Description / CTAs) render ABOVE the
  //                   slot when set; leave them empty for a bare drop
  //                   zone. Canonical use: photo band + dark scrim +
  //                   centered Title + a compact quick-links-tiles row
  //                   composed in the slot (see `description`).
  variants: [{ name: "FullBleed" }, { name: "Placeholders" }],

  // CTA-click events deferred until the anchor data-cdp-* tagging
  // pass — semantic CTA distinction rides on those attrs, not on
  // dedicated catalog entries.
  events: [
    {
      name: "view",
      type: "hero.viewed",
      description:
        "Fires once when the hero becomes ≥ 50% visible. Routed through SDK pageView().",
      action: "view",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "VIEW",
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Heros" },
      { scope: "site", subfolder: "Heros" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default heroRecipe;
