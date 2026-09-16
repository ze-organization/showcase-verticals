import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `CardBlock` component (./card-block.tsx).
 *
 * Two rendering variants:
 *
 *   Default       Source-driven everywhere. Title / Description /
 *                 Content / Footer / Media / Actions all come from
 *                 the fields below.
 *
 *   Placeholders  Body and footer become Sitecore placeholders so
 *                 authors can drop arbitrary renderings into the card
 *                 chrome. Title, Description, and Media still render
 *                 from sources; the Content / Footer / Action fields
 *                 are ignored.
 *
 * Both placeholders (`card-body-{*}` + `card-footer-{*}`) are declared
 * on the rendering so they're available whenever the Placeholders
 * variant is picked. The Default variant doesn't render them.
 */
export const cardBlockRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "card-block@1",
  icon: componentIcons["card-block@1"],
  name: "card-block",
  displayName: "Card",
  description:
    "Composable card with media, title, description, and body. Variants: Default (fully source-driven) and Placeholders (source-driven head + `card-body-{*}` / `card-footer-{*}` slots for arbitrary composed renderings — pick when the source shows a card whose body is another component, e.g. a card with a heading and chevron-led link rows → this variant with `link-list@1` NavList composed in `card-body-{*}`). Orthogonal chrome axes: elevation / padding / style, plus the utility-card kit — IconName (circular icon badge above the title) with IconBadgeSize (lg = the ~80px task-portal circle) and IconBadgeColorScheme (per-card tint), ShowDivider (hairline rule between header and body), AccentBar (thin solid/gradient strip across the top edge — alternate the accent/accent-2/accent-3/tertiary gradients across sibling cards for related hues), and TitleSize/TitleWeight (lg + regular = the light utility-card heading). The full Duke-Energy-style link-card grid: 4 Placeholders cards in a column-splitter, each IconName + IconBadgeSize lg + AccentBar gradient + ShowDivider + TitleSize lg + TitleWeight regular, with a NavList link-list (RowSeparators `plain`, LinkColorScheme primary, RowSize lg) in each card-body.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      // Standard Values seed for auto-created datasources.
      default: {
        en: "Card heading",
        ar: "عنوان البطاقة",
        es: "Título de la tarjeta",
        fr: "Titre de la carte",
        de: "Kartenüberschrift",
        da: "Kortoverskrift",
        ja: "カードの見出し",
        "zh-CN": "卡片标题",
        "zh-TW": "卡片標題",
        it: "Titolo della scheda",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Card heading.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "text",
      default: {
        en: "Short subheading shown under the title.",
        ar: "عنوان فرعي قصير يظهر أسفل العنوان.",
        es: "Subtítulo breve que se muestra debajo del título.",
        fr: "Court sous-titre affiché sous le titre.",
        de: "Kurze Unterüberschrift unter dem Titel.",
        da: "Kort underoverskrift, der vises under titlen.",
        ja: "タイトルの下に表示される短いサブ見出し。",
        "zh-CN": "显示在标题下方的简短副标题。",
        "zh-TW": "顯示在標題下方的簡短副標題。",
        it: "Breve sottotitolo mostrato sotto il titolo.",
      },
      sitecore: {
        type: "multi-line-text",
        hint: "Short subhead. Plain text, no formatting.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Content",
      shape: "richText",
      default: {
        en: "<p>Card body content goes here.</p>",
        ar: "<p>يوضع محتوى البطاقة هنا.</p>",
        es: "<p>El contenido de la tarjeta va aquí.</p>",
        fr: "<p>Le contenu de la carte s'affiche ici.</p>",
        de: "<p>Hier steht der Inhalt der Karte.</p>",
        da: "<p>Kortets indhold vises her.</p>",
        ja: "<p>ここにカードの本文が入ります。</p>",
        "zh-CN": "<p>卡片正文内容显示在此处。</p>",
        "zh-TW": "<p>卡片正文內容顯示於此處。</p>",
        it: "<p>Qui va il contenuto della scheda.</p>",
      },
      sitecore: {
        hint: "Card body. Supports rich-text formatting.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Media",
      shape: "image",
      role: "content",
      // Picsum seed so a freshly dropped card visualises with a real
      // image immediately. Pipe-separated `<alt>|<src>` — scai's
      // `encodeMediaXmlDefault` treats the LEFT side as `alt` and the
      // RIGHT side as `src`. Reverse order silently put the URL into
      // `alt` and made the picsum default never render.
      default: "Card visual|/theme-photos/home-hero.jpg",
      sitecore: {
        hint: "Image displayed above the header.",
        section: "Media",
        sortOrder: 100,
      },
    },
    {
      // Sitecore field name must be PascalCase no-space so the
      // convention map's `lowerFirst` produces `primaryAction`
      // (matching the React component's destructure). "Primary Action"
      // with a literal space yielded "primary Action" which never
      // matched, so the buttons never rendered.
      name: "PrimaryAction",
      shape: "link",
      // Standard Values seed so a freshly dropped card visualises a
      // real CTA immediately. Pipe-separated `<text>|<url>`; scai's
      // encoder lowers it to the link-XML payload Standard Values
      // store natively. The URL half is `/` on purpose — a `#` URL
      // makes scai emit a `linktype="anchor"` payload without the
      // `anchor` attribute the Layout Service builds the href from,
      // so the field arrived as `{ href: "" }` and the CTA rendered
      // blank (see cta-button.recipe.ts for the full diagnosis).
      default: "Learn more|/",
      sitecore: {
        hint: "Primary action link.",
        section: "Actions",
        sortOrder: 100,
      },
    },
    {
      name: "SecondaryAction",
      shape: "link",
      default: "More details|/",
      sitecore: {
        hint: "Secondary action link.",
        section: "Actions",
        sortOrder: 200,
      },
    },
    {
      name: "Footer",
      shape: "richText",
      default: {
        en: "<p>Optional footer note — replace or clear at placement.</p>",
        ar: "<p>ملاحظة تذييل اختيارية — استبدلها أو احذفها عند الإدراج.</p>",
        es: "<p>Nota de pie de página opcional: reemplázala o elimínala al colocarla.</p>",
        fr: "<p>Note de pied de page facultative — remplacez-la ou supprimez-la lors du placement.</p>",
        de: "<p>Optionale Fußzeilennotiz – beim Platzieren ersetzen oder entfernen.</p>",
        da: "<p>Valgfri sidefodsnote – erstat eller fjern ved placering.</p>",
        ja: "<p>任意のフッター注記です。配置時に置き換えるか削除してください。</p>",
        "zh-CN": "<p>可选的页脚注释——放置时可替换或清除。</p>",
        "zh-TW": "<p>可選的頁尾註釋——放置時可替換或清除。</p>",
        it: "<p>Nota a piè di pagina facoltativa: sostituiscila o rimuovila al momento del posizionamento.</p>",
      },
      sitecore: {
        hint: "Footer content.",
        section: "Footer",
        sortOrder: 300,
      },
    },
  ],

  // Two variants:
  //   Default       — body + footer + actions render from sources.
  //   Placeholders  — body + footer become Sitecore placeholders; the
  //                   Content / Footer / Action fields are ignored.
  variants: [{ name: "Default" }, { name: "Placeholders" }],

  // Headless placeholders for the `Placeholders` variant. Permissive —
  // any rendering can drop into either slot.
  dynamicPlaceholders: true,
  placeholders: [{ key: "card-body-{*}" }, { key: "card-footer-{*}" }],

  params: [
    {
      name: "Elevation",
      shape: "enum",
      default: "theme",
      sitecore: {
        enumHandle: "card-elevation@1",
        hint: "Shadow depth. `theme` defers to the active theme.",
        sortOrder: 100,
      },
    },
    {
      name: "Padding",
      shape: "enum",
      default: "lg",
      sitecore: {
        enumHandle: "card-padding@1",
        hint: "Inner padding density.",
        sortOrder: 200,
      },
    },
    {
      name: "Style",
      shape: "enum",
      default: "flat",
      sitecore: {
        enumHandle: "card-style@1",
        hint: "Card style: flat / outline / filled / elevated (opaque raised panel with a shadow — bind when the source shows white/raised cards standing off the section, especially on dark or coloured bands).",
        sortOrder: 300,
      },
    },
    {
      // Card-level scheme. Drives the outline-border color when
      // `Style=outline`, the pale-tint background + foreground text
      // when `Style=filled`, and is a no-op on the `flat` default
      // (border-transparent overrides any scheme-tinted border).
      // Action button schemes live on PrimaryActionColorScheme +
      // SecondaryActionColorScheme so authors can independently
      // pick a card body treatment and per-button treatments.
      name: "CardColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Card body scheme. Visible only when Style is outline (border) or filled (background tint). No effect on flat cards.",
        sortOrder: 400,
      },
    },
    {
      // Optional color band at the top of the card — when picked, the
      // title moves into the band and renders in the scheme's
      // saturated colors.
      name: "ColorBand",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-band@1",
        hint: "Optional color band hosting the title at the top of the card.",
        sortOrder: 500,
      },
    },
    {
      // Optional trailing chevron/arrow glyph beside the title — the
      // "Södra card" affordance signalling the whole card is a link /
      // expandable. `none` (default) keeps the plain title.
      name: "TitleLinkIcon",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "title-link-icon@1",
        hint: "Optional trailing glyph beside the title: `chevron` or `arrow`, signalling the whole card is a link/expandable. `none` (default) keeps the plain title.",
        sortOrder: 520,
      },
    },
    {
      // Thin decorative strip across the top edge — the utility-card
      // treatment (pairs with IconName + ShowDivider). Reuses the
      // shared color-scheme vocabulary; the two `-gradient` values run
      // the role pairing along the inline axis.
      name: "AccentBar",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Thin accent strip across the card's top edge. `none` (default) renders nothing; a scheme paints a 6px solid strip, the `-gradient` values a gradient strip (primary/secondary plus the neighbouring-role accent/accent-2/accent-3/tertiary gradients — alternate them across sibling cards when the source grid shows several related gradient hues). Pick when the source card shows a colored top bar.",
        sortOrder: 550,
      },
    },
    {
      // Named vector icon badge — replaces the Media image with a
      // circular soft-tinted badge above the title. Unknown/empty
      // names degrade to the authored Media image.
      name: "IconName",
      shape: "enum",
      sitecore: {
        enumHandle: "icon-name@1",
        hint: "Named vector icon (icon-name@1 vocabulary, e.g. `bill`, `globe`) rendered as a circular badge above the title. Wins over Media when set; pick `none` to clear a previously picked icon and return to the image-led card.",
        sortOrder: 560,
      },
    },
    {
      // Badge scale — bucketed size@1: xs/sm → 40px, default/md → the
      // historic 48px, lg/xl → the ~80px task-portal badge.
      name: "IconBadgeSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Icon badge scale (no effect without IconName): xs/sm compact 40px, default 48px, lg/xl the large ~80px task-portal badge — bind lg when the source card leads with a big tinted icon circle.",
        sortOrder: 562,
      },
    },
    {
      // Badge tint — soft `-background` surface + saturated glyph in
      // the picked role. Sibling cards can each carry their own hue.
      name: "IconBadgeColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Icon badge tint (no effect without IconName): soft role surface + the role's glyph color. `primary` (default) keeps the historic badge; vary across sibling cards when the source tints each card's badge differently. Gradient values fall back to `primary`.",
        sortOrder: 564,
      },
    },
    {
      // Title typography overrides — `default` keeps the Card
      // primitive's theme-token path byte-identical.
      name: "TitleSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Title scale override. `default` keeps the theme's card-title scale; `lg`/`xl` give the big utility-card heading (Duke-Energy-style link cards pair lg with TitleWeight regular).",
        sortOrder: 566,
      },
    },
    {
      name: "TitleWeight",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "title-weight@1",
        hint: "Title weight override. `default` defers to the --card-title-weight theme token (600 fallback); `regular` is the light editorial utility-card heading.",
        sortOrder: 568,
      },
    },
    {
      // Off by default — omitted `default` IS the unchecked Standard
      // Value (scai encodes a boolean default into the SV checkbox; absent
      // and "false" both land unchecked, so OFF checkboxes omit it per
      // project convention).
      name: "ShowDivider",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Render a hairline rule between the header (title + description) and the body — the icon badge / title / divider / rows utility-card rhythm.",
        sortOrder: 570,
      },
    },
    {
      name: "MediaFit",
      shape: "enum",
      default: "cover",
      sitecore: {
        enumHandle: "media-fit@1",
        hint: "How the image fills its media box. `cover` (default) scales up and crops — right for photography. `contain` fits the whole image in without cropping — bind for logos, brand marks, partner/analyst/award badges, certification seals, product cut-outs and screenshots, whose edges carry meaning.",
        section: "Style",
        sortOrder: 605,
      },
    },
    {
      name: "MediaBleed",
      shape: "enum",
      default: "fullbleed",
      sitecore: {
        enumHandle: "card-media-bleed@1",
        hint: "How the media slot is sized + placed within the card padding. `fullbleed` (default) extends the image to the card edges; `none` insets it inside the padding. When IconName is set the component auto-corrects fullbleed to none — a badge never wants to bleed into the corner.",
        sortOrder: 600,
      },
    },
    {
      // Renamed from `PrimaryActionStyle` (2026-07 param normalization —
      // *Variant matches the button-variant@1 vocabulary, e.g. cta-button's
      // Variant param).
      name: "PrimaryActionVariant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Visual treatment for the primary action. Same enum as CTA Button: default / outline / ghost / link. Corner radius is theme-owned (--button-radius).",
        sortOrder: 700,
      },
    },
    {
      // Per-button scheme — independent of CardColorScheme so a
      // `neutral` card can carry a `primary` action button (the
      // common case). Visible on every button style (default,
      // outline) and on the bare link variants (text color).
      name: "PrimaryActionColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Primary action button scheme. Independent of CardColorScheme.",
        sortOrder: 750,
      },
    },
    {
      name: "PrimaryActionShowArrow",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Append a trailing arrow (→) after the primary action label.",
        sortOrder: 760,
      },
    },
    {
      // Renamed from `SecondaryActionStyle` — same rename as
      // PrimaryActionVariant above.
      name: "SecondaryActionVariant",
      shape: "enum",
      default: "outline",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Visual treatment for the secondary action. Same enum as CTA Button. Defaults to `outline` so it reads as a calmer companion to the primary action.",
        sortOrder: 800,
      },
    },
    {
      // Per-button scheme for the secondary action. Defaults to
      // `neutral` so it reads as a calmer companion next to a
      // primary-tinted main CTA.
      name: "SecondaryActionColorScheme",
      shape: "enum",
      default: "neutral",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Secondary action button scheme. Independent of CardColorScheme.",
        sortOrder: 850,
      },
    },
    {
      name: "SecondaryActionShowArrow",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Append a trailing arrow (→) after the secondary action label.",
        sortOrder: 860,
      },
    },
    {
      // Size applied to BOTH action buttons (`size@1`, shared with
      // cta-button's own Size param). `default` defers to the button's
      // natural size; the scale values override it — shared across the
      // two actions so a card's CTAs read consistently.
      name: "ActionSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Size for BOTH action buttons. `default` keeps the button's natural size; the scale values (xs…xl) override it consistently across the card's actions.",
        sortOrder: 890,
      },
    },
    {
      name: "ActionPlacement",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "action-placement@1",
        hint: "Alignment of the action row. `start` or `end`.",
        sortOrder: 900,
      },
    },
    {
      // Tints the FOOTER region independently of the card body surface —
      // a full-width soft band under the content (the "Södra card"
      // footer). `none` (default) inherits the card surface; `muted` is
      // the shadcn quiet surface; role values render a soft-tint band.
      name: "FooterColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "footer-color-scheme@1",
        hint: "Tint for the footer band, independent of the card body. `none` (default) inherits the card surface; `muted` renders the quiet shadcn surface; a role value renders a soft-tint footer band. Bind when the source shows a footer in a different color from the card body.",
        sortOrder: 950,
      },
    },
  ],

  /**
   * Convention: card datasources live in the site's Data folder.
   * Tenants with a different content layout may need a per-install override.
   */
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Cards" },
      { scope: "site", subfolder: "Site Shared UI/Cards" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default cardBlockRecipe;
