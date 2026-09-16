import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `Promo` component (./promo.tsx).
 *
 * Mid-page promo / banner unit — title + description + optional media
 * + optional CTA. Two orthogonal layout axes plus three variants:
 *
 *   - `Layout` (param) — text-block alignment only: `start` /
 *                        `centered` / `end`.
 *   - `ImagePosition` (param) — where the media sits: `start` / `end`
 *                        (two-column split), `above` / `below`
 *                        (stacked), `hidden` (text only), `background`
 *                        (media full-bleed behind the text; falls back
 *                        to the SurfaceTone band when unset).
 *
 *   - `Default`      — source-driven; media reads the `Image` field.
 *   - `Media`        — media side reads the `promo-media-{*}` placeholder.
 *   - `Placeholders` — authored copy renders first, then the
 *                      `promo-content-{*}` placeholder BELOW it; media
 *                      side reads `promo-media-{*}`.
 *
 * The two-tone panel read is Default's `SecondarySurfaceTone` axis on
 * the start/end splits.
 *
 * `SurfaceTone` (band color) and the per-action variant / color-scheme
 * params are shared across every variant. Each CTA renders
 * automatically whenever its Link field is populated.
 */
export const promoRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "promo@1",
  icon: componentIcons["promo@1"],
  name: "promo",
  displayName: "Promo",
  description:
    "Mid-page promo / banner unit with title, description, optional image or video media, and an optional CTA. Three variants — Default (source-driven; Layout sets text alignment), Media (media side reads the `promo-media-{*}` placeholder), Placeholders (authored copy renders first, then the `promo-content-{*}` placeholder below it; media side reads `promo-media-{*}`; `ImagePosition: background` coerces to `above` here). The two-tone read is Default's SecondarySurfaceTone param on the start/end splits. VideoUrl turns the Default variant into a video promo in any ImagePosition — full-bleed background video band or split/stacked video + text; the Image field becomes the poster / click-to-play thumbnail, and VideoPlayback picks click-to-play (default) vs muted ambient autoplay. Layout axes: MediaFraction sets the start/end split ratio (half / third / twoThirds), ContentAlign + ContentVAlign place the copy block, and Inset switches full-width band vs contained vs card (rounded panel). Background tone and CTA color are rendering parameters shared across every variant. For a photo band with a heading and a floating row of small icon/utility cards, use hero@1 Placeholders + quick-links-tiles@1 instead of promo.",

  section: { handle: "heros-and-promos-section@1" },

  fields: [
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional small uppercase line above the title (e.g. 'CASE STUDY', 'NEW'). Mirrors the article-header / editorial-hero treatment.",
        section: "Content",
        sortOrder: 50,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Tell your story here",
        ar: "اروِ قصتك هنا",
        es: "Cuenta tu historia aquí",
        fr: "Racontez votre histoire ici",
        de: "Erzählen Sie hier Ihre Geschichte",
        da: "Fortæl din historie her",
        ja: "ここにあなたのストーリーを綴りましょう",
        "zh-CN": "在此讲述您的故事",
        "zh-TW": "在此講述您的故事",
        it: "Racconta qui la tua storia",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Promo headline.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      default: {
        en: "<p>Short supporting copy framing the promo. Two to three sentences keeps the unit punchy.</p>",
        ar: "<p>نص داعم قصير يُؤطّر العرض الترويجي. جملتان أو ثلاث تحافظ على قوة الوحدة وتأثيرها.</p>",
        es: "<p>Texto de apoyo breve que enmarca la promoción. Dos o tres frases mantienen el bloque impactante.</p>",
        fr: "<p>Texte d'accompagnement court qui présente la promo. Deux à trois phrases gardent le bloc percutant.</p>",
        de: "<p>Kurzer Begleittext, der die Aktion einrahmt. Zwei bis drei Sätze halten das Element prägnant.</p>",
        da: "<p>Kort støttetekst, der rammer kampagnen ind. To til tre sætninger holder enheden slagkraftig.</p>",
        ja: "<p>プロモーションを引き立てる短い補足文です。2〜3文にまとめると、まとまりよく印象的になります。</p>",
        "zh-CN":
          "<p>用于衬托促销内容的简短文案。两到三句话可让该单元更具冲击力。</p>",
        "zh-TW":
          "<p>用於襯托促銷內容的簡短文案。兩到三句話可讓該單元更具衝擊力。</p>",
        it: "<p>Breve testo di supporto che introduce la promo. Due o tre frasi mantengono l'elemento incisivo.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Supporting copy under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "content",
      sitecore: {
        type: "image",
        hint: "Promo media image. Default paints it as a background image (image overrides SurfaceTone fill). Image uses it as the media-side slot. Media ignores it — drop renderings into the `promo-media-{*}` placeholder instead.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "VideoUrl",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional video URL (YouTube / Vimeo / direct file). On the Default variant it takes precedence over Image in EVERY ImagePosition: `background` paints it full-bleed behind the text; split / stacked positions render it in the media column. The Image field always becomes the video's poster / click-to-play thumbnail. See the VideoPlayback param for how it starts.",
        section: "Content",
        sortOrder: 350,
      },
    },
    {
      name: "VideoLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Accessible NAME for the video — announced by screen readers and used as the embed's title and the play button's label. Not rendered as visible text on the page. Falls back to the Title when blank.",
        section: "Content",
        sortOrder: 360,
      },
    },
    {
      name: "VideoCaptionUrl",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional WebVTT captions track URL for direct-file (.mp4/.webm) videos — appears via the player's CC control during playback, not as visible page text. Ignored for YouTube / Vimeo embeds (their captions come from the provider).",
        section: "Content",
        sortOrder: 370,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Primary CTA. Renders automatically when populated; leave empty to omit. Tracked as `promo.primary-cta-clicked`.",
        section: "Action",
        sortOrder: 100,
      },
    },
    {
      name: "SecondaryAction",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional secondary CTA. Renders alongside the primary when populated. Tracked as `promo.secondary-cta-clicked`.",
        section: "Action",
        sortOrder: 200,
      },
    },
  ],

  // Params are grouped for the authoring panel: Layout -> Media ->
  // Surface -> Text -> Action -> Analytics. Sitecore orders the panel
  // by sortOrder, so groups sit 100 apart and rows step by 10 inside
  // a group; the `section` name matches the group.
  params: [
    // ─── Layout ──────────────────────────────────────────────────
    {
      name: "Layout",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "text-alignment@1",
        hint: "Text-block alignment — `start` / `centered` / `end`. Controls only how the title, copy, and CTAs align; media placement is the separate ImagePosition axis.",
        section: "Layout",
        sortOrder: 100,
      },
    },
    {
      name: "ImagePosition",
      shape: "enum",
      default: "background",
      sitecore: {
        enumHandle: "promo-image-position@1",
        hint: "Where the media sits relative to the text. `background` (default) paints it full-bleed behind the text (or a clean SurfaceTone band when unset); `start` / `end` split into two columns with the media inline-start / inline-end; `above` / `below` stack it over / under the text; `hidden` drops it even when populated. On Media / Placeholders `background` falls back to `above`. Bind from the measured section: media on the left → `start`, media on the right → `end`.",
        section: "Layout",
        sortOrder: 110,
      },
    },
    {
      name: "MediaFraction",
      shape: "enum",
      default: "half",
      sitecore: {
        enumHandle: "media-fraction@1",
        hint: "Split ratio when ImagePosition is start/end: `half` (default 50/50), `third` (media 1/3, copy 2/3), `twoThirds` (media 2/3, copy 1/3). Bind from the source's measured column proportions — a dominant packshot side → `twoThirds`, a slim media rail → `third`. Inert on stacked / background / hidden positions.",
        section: "Layout",
        sortOrder: 120,
      },
    },
    {
      name: "ContentAlign",
      shape: "enum",
      // Defaults to the in-list `auto` member: the copy block's natural
      // alignment defers to the Layout axis rather than a fixed pick.
      // `auto` defers to Layout; a concrete `start`/`center`/`end`
      // wins over Layout.
      default: "auto",
      sitecore: {
        // `content-alignment@1`, not `alignment@1` — promo is the one
        // consumer with a second axis (`Layout`) for `auto` to defer
        // to, so it gets the enum that carries the sentinel.
        enumHandle: "content-alignment@1",
        hint: "Horizontal alignment of the copy block (`start` / `center` / `end`). `auto` (default) defers to the Layout axis; a concrete value wins over Layout. Works on every ImagePosition.",
        section: "Layout",
        sortOrder: 130,
      },
    },
    {
      name: "ContentVAlign",
      shape: "enum",
      default: "center",
      sitecore: {
        enumHandle: "content-valign@1",
        hint: "Vertical alignment of the copy block in the start/end splits: `top` / `center` (default) / `bottom` relative to the media column. Bind `top` when the source's copy hugs the top of a tall media panel. Inert on stacked / background / hidden positions.",
        section: "Layout",
        sortOrder: 140,
      },
    },
    {
      name: "Inset",
      shape: "enum",
      default: "fullBleed",
      sitecore: {
        enumHandle: "promo-inset@1",
        hint: "Band inset: `fullBleed` (default) spans the page edge-to-edge; `contained` constrains the band (surface + background media) to the content container; `card` adds the theme's `--card-radius` rounding so the promo reads as a large rounded panel. With SurfaceTone `none` and no background media an inset band falls back to the neutral tint — otherwise there would be nothing visible to inset. Pick `card` for rounded, inset promo panels rather than a full-width band.",
        section: "Layout",
        sortOrder: 150,
      },
    },
    {
      name: "PaddingY",
      shape: "enum",
      // Defaults to the in-list `auto` member: the promo's natural band
      // padding is the responsive `py-12 md:py-16 lg:py-24` ramp, which
      // no concrete `padding-y@1` token reproduces. `auto` maps to
      // that ramp; a concrete pick wins.
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding around the band. `auto` (default) keeps the standard promo padding; `none` flattens it so stacked bands sit flush. Ignored in the two-tone panel read (SecondarySurfaceTone set on a split) — the panels carry their own padding.",
        section: "Layout",
        sortOrder: 160,
      },
    },
    // ─── Media ───────────────────────────────────────────────────
    {
      name: "MediaShape",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "media-shape@1",
        hint: "Framing of the media box on the start/end splits and stacked positions: `default` keeps the stock chrome (theme card radius), `rounded` steps up to an explicitly larger radius, `circle` clips the media to a full circle in a constrained square box (the resmed circular-photo promo — bind when the source shows a circular image beside copy). Inert on background / hidden positions.",
        section: "Media",
        sortOrder: 200,
      },
    },
    {
      name: "VideoPlayback",
      shape: "enum",
      default: "click-to-play",
      sitecore: {
        enumHandle: "video-playback@1",
        hint: "How the video starts (needs VideoUrl). `click-to-play` (default): the Image field shows as a poster with a play button; the video loads and starts on click. `autoplay`: starts inline immediately — ALWAYS muted (browsers block unmuted autoplay), looped by default; the ambient background-band treatment. Reduced-motion visitors always get click-to-play.",
        section: "Media",
        sortOrder: 210,
      },
    },
    {
      name: "MediaMuted",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Mute the video. Composes with both playback modes; forced ON under `autoplay` (browsers block unmuted autoplay), so it only makes an audible difference on click-to-play.",
        section: "Media",
        sortOrder: 220,
      },
    },
    {
      name: "MediaLoop",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Loop the video. Composes with both playback modes; unset defaults on for `autoplay` (ambient band) and off for `click-to-play`.",
        section: "Media",
        sortOrder: 230,
      },
    },
    // ─── Surface ─────────────────────────────────────────────────
    {
      name: "SurfaceTone",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Background tone + foreground text color, aligned to the shared color-scheme set. A background image/video (ImagePosition=background with media set) covers this fill — the text tone then follows BackgroundScrim. In the two-tone panel read (SecondarySurfaceTone set on a split) it colors the COPY half only.",
        section: "Surface",
        sortOrder: 300,
      },
    },
    {
      name: "SecondarySurfaceTone",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Fill behind the MEDIA side. Pick a concrete tone on ImagePosition start/end to flip the band into the flush two-tone panel read (copy half on SurfaceTone, media half on this tone, contained media shot) — e.g. primary copy / accent media. `none` (default) keeps the classic single-surface split. Inert on stacked / background / hidden positions.",
        section: "Surface",
        sortOrder: 310,
      },
    },
    {
      name: "BackgroundScrim",
      shape: "enum",
      default: "dark",
      sitecore: {
        enumHandle: "background-scrim@1",
        hint: "Scrim over the full-bleed background media when ImagePosition=background AND an Image or VideoUrl is set — the scrim then owns the text tone: `dark` (default) dims the media and flips the text light; `light` washes it and keeps text dark; `none` leaves the media untreated (text keeps the page tone — only pick it when the raw media is legible). NO EFFECT without background media, on other ImagePositions, or on the Media / Placeholders variants.",
        section: "Surface",
        sortOrder: 320,
      },
    },
    {
      name: "BackgroundPosition",
      shape: "enum",
      default: "center",
      sitecore: {
        enumHandle: "background-position@1",
        hint: "Crop anchor of the background image (`object-position`) — `center` / `top` / `bottom`. Only meaningful when ImagePosition=background with an Image set.",
        section: "Surface",
        sortOrder: 330,
      },
    },
    // ─── Text ────────────────────────────────────────────────────
    {
      name: "TitleSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "heading-size@1",
        hint: "Title scale. `default` matches the Promo body; `large`, `xl`, and `text-banner` step up to the Editorial / FiftyFifty Hero range — pick `xl` when the source shows a strong headline block (often with an eyebrow kicker).",
        section: "Text",
        sortOrder: 400,
      },
    },
    {
      name: "HeadingAnimation",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "heading-animation@1",
        hint: "Entrance animation for the title (`none` (default) / `banner-start` / `banner-end` / `banner-center`). Mirrors article-header + accordion-block.",
        section: "Text",
        sortOrder: 410,
      },
    },
    {
      name: "EyebrowColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Brand color of the eyebrow above the title. `none` inherits the surface foreground at reduced opacity. When `EyebrowStyle = badge`, drives both the badge fill and label.",
        section: "Text",
        sortOrder: 420,
      },
    },
    {
      name: "EyebrowStyle",
      shape: "enum",
      default: "text",
      sitecore: {
        enumHandle: "eyebrow-style@1",
        hint: "Visual treatment for the eyebrow. `text` (default) is small uppercase prose; `badge` is a pill-shaped chip tinted by EyebrowColorScheme.",
        section: "Text",
        sortOrder: 430,
      },
    },
    // ─── Action ──────────────────────────────────────────────────
    {
      name: "ActionSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Size token shared by BOTH CTA buttons. Uses the shared size scale.",
        section: "Action",
        sortOrder: 500,
      },
    },
    {
      name: "PrimaryActionVariant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Visual style of the primary CTA (filled / outline / ghost / link / pill). For the editorial 'Read more →' treatment pick `link` + PrimaryActionShowArrow.",
        section: "Action",
        sortOrder: 510,
      },
    },
    {
      name: "PrimaryActionColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color scheme of the primary CTA button. Independent from SurfaceTone.",
        section: "Action",
        sortOrder: 520,
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
        sortOrder: 530,
      },
    },
    {
      name: "SecondaryActionVariant",
      shape: "enum",
      default: "outline",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Visual style of the secondary CTA.",
        section: "Action",
        sortOrder: 540,
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
        sortOrder: 550,
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
        sortOrder: 560,
      },
    },
    // ─── Analytics ───────────────────────────────────────────────
    {
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable author-friendly handle for analytics (e.g. 'home-q2-promo'). Defaults to the rendering id when blank.",
        section: "Analytics",
        sortOrder: 600,
      },
    },
    {
      name: "InstanceScope",
      shape: "enum",
      default: "site",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Whether this instance is reused site-wide or unique per page. Drives personalization partition keys.",
        section: "Analytics",
        sortOrder: 610,
      },
    },
    {
      name: "TrackEvents",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Emit CDP events for view + CTA click. Off by default.",
        section: "Analytics",
        sortOrder: 620,
      },
    },
  ],

  // Two placeholders so authors can extend either column without
  // forking the rendering. Both permissive — any rendering registered
  // in the site can drop in. Used primarily by the Media variant for
  // its media slot; either variant can use `promo-content-{*}` for an
  // extra decoration next to the heading.
  dynamicPlaceholders: true,
  placeholders: [{ key: "promo-media-{*}" }, { key: "promo-content-{*}" }],

  // Three variants — two source-driven shapes plus a Placeholders
  // shell for author-extended compositions. Image placement across
  // all of them is the `ImagePosition` param, not the variant.
  //   Default       — source-driven; media reads the `Image` field.
  //   Media         — media side reads the `promo-media-{*}` placeholder.
  //   Placeholders  — authored copy (eyebrow / title / description /
  //                   CTAs) renders first, then the
  //                   `promo-content-{*}` placeholder BELOW it; media
  //                   side reads `promo-media-{*}`. `ImagePosition:
  //                   background` is coerced to `above` on the
  //                   placeholder variants — a slot can't sit behind a
  //                   full-bleed photo here. WHEN THE SOURCE SHOWS a
  //                   photo band with a heading and a floating row of
  //                   small icon/utility cards, do NOT reach for promo:
  //                   use hero@1's Placeholders variant (photo +
  //                   full-band dark overlay + centered Title) and
  //                   compose quick-links-tiles@1 (Default, Columns 4,
  //                   TileSize sm, MaxWidth standard, PaddingY none,
  //                   icons from icon-name@1) into its
  //                   `hero-overlay-content-{*}` slot. Promo's
  //                   Placeholders is for split/stacked editorial
  //                   two-column compositions.
  //
  // Default + SecondarySurfaceTone covers the two-tone read.
  variants: [{ name: "Default" }, { name: "Media" }, { name: "Placeholders" }],

  // CTA-click events deferred until the anchor data-cdp-* tagging
  // pass — semantic CTA distinction rides on those attrs.
  events: [
    {
      name: "view",
      type: "promo.viewed",
      description:
        "Fires once when the promo becomes ≥ 50% visible. Routed through SDK pageView().",
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
      { scope: "page", subfolder: "Promos" },
      { scope: "site", subfolder: "Promos" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default promoRecipe;
