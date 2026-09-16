import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `LinkList` component (./link-list.tsx).
 *
 * **Compatible datasources.** The rendering declares two compatible
 * datasource templates via `datasource.templates`:
 *
 *   - `link-list-content@1` — generic shape (Title + Items Treelist of
 *     `link-list-item@1`). Pick for nav columns, footer columns,
 *     sidebar resource lists, in-page jump links — anything where the
 *     entries vary per placement.
 *   - `social-follow-content@1` — five named platform link fields
 *     (Facebook / Twitter / Instagram / YouTube / LinkedIn). Pick for
 *     a social follow block; pair with `itemStyle: "social-icon"` (or
 *     `social-icon-with-label`) on the placement's params so the React
 *     side resolves icons from each link's URL host.
 *
 * The React side detects which template shape arrives via the
 * layout-service `fields` object and renders accordingly — same
 * rendering, two datasource shapes.
 *
 * **Variants** map 1:1 to the React exports in `link-list.tsx`:
 *
 *   Default          vertical stack of links
 *   Horizontal       row of links with wrap (+ inline-start title /
 *                    `Columns` grid / `SeparatorGlyph` / bordered
 *                    surface modifiers via params)
 *   UtilityBar       thin quiet strip above the site header — locale /
 *                    sign-in / secondary links, right-aligned on a
 *                    muted surface (place flat into `headless-header`)
 *   Cards            title + grid of cards (topic-listing style;
 *                    `Columns` sizes the grid)
 *   Compact          title + vertical list (topic-listing, no cards)
 *   Pills            inline row of rounded chip links (optional
 *                    `SeparatorGlyph` between chips)
 *   NavList          vertical nav rows with a trailing (end-of-row)
 *                    chevron per link — composes into card-block@1
 *                    Placeholders for the "card of link rows" pattern
 *   MultiColumn      2-4 column link panel with optional per-group
 *                    headings (Items entries that are themselves Link
 *                    Lists become headed columns; flat items distribute
 *                    across the `Columns` param)
 *   InlineSeparated  single-line inline row with a separator glyph
 *                    between entries (`SeparatorGlyph` param)
 *   IconLed          vertical rows with a leading `icon-name@1` vector
 *                    icon per item + label + optional description
 *
 * The typed params below cover the layout knobs (`Columns`,
 * `SeparatorGlyph`) plus `ItemStyle` (`item-style@1`: text | icon-led
 * — icon-led rows inside MultiColumn columns and NavList) and
 * `ListMarker` (`list-marker@1`: none | bulleted — disc markers on the
 * vertical text-link variants Default/Compact/MultiColumn); the
 * remaining displayOptions (orientation, surface, etc.) keep their
 * React-side defaults and remain overridable via raw param names.
 */
export const linkListRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "link-list@1",
  icon: componentIcons["link-list@1"],
  name: "link-list",
  displayName: "Link List",
  description:
    "Generic link list with multiple layouts. Accepts a generic `link-list-content@1` datasource or a focused `social-follow-content@1` for social-icon mode. The generic datasource's Items mix four entry sources: classic link-list-item entries, PAGES (row links to the page, label from its NavigationTitle/Title), link-item virtual links (explicit Url — external destinations), and nested Link Lists (MultiColumn column groups). Variants: Default (plain vertical links), Horizontal (wrap row or fixed-column grid — set the Columns param to 2/3/4 for a fixed-column link panel; `auto` keeps the wrapping row), UtilityBar (thin quiet strip above the header), Cards (grid of topic cards — set the Columns param to size the grid; `auto` keeps the 2-up/3-up), Compact (titled vertical topic list), Pills (inline row of rounded chip links — pick when the source shows links as pills/tags), NavList (vertical nav rows with hairline separators, label at the start and a chevron/arrow at the END of each row (trailing edge, RTL-aware) — pick when the source shows arrow-terminated link rows, e.g. utility 'more for customers' link stacks; for a card with a heading + chevron rows, compose this inside `card-block@1` Placeholders' `card-body-{*}` slot; set ItemStyle icon-led to lead each row with its IconName + Description; rows whose Link leaves the site swap the chevron for an external-link glyph automatically; the utility-card link stack sets RowSeparators `plain` (tinted-hover rows, no hairlines) and binds LinkColorScheme primary + RowSize lg), MultiColumn (2-4 column link panel with optional per-group headings — footer-style column groups outside the footer; pick for sitemap sections, 'explore' panels, and dense in-page link directories; reference nested Link Lists in Items for headed columns, or set the Columns param to distribute flat items; set ItemStyle icon-led for icon-led rows inside each column — the product-matrix panel), InlineSeparated (single-line inline row with a dot/pipe/slash separator glyph between entries — pick for legal-links rows and compact utility strips; set SeparatorGlyph to match the source), IconLed (vertical rows with a leading icon-name@1 vector icon + label + optional per-item description — pick for 'browse by' panels, service directories, and support hub link stacks).",

  section: { handle: "navigation-section@1" },

  variants: [
    { name: "Default" },
    { name: "Horizontal" },
    { name: "UtilityBar" },
    { name: "Cards" },
    { name: "Compact" },
    { name: "Pills" },
    { name: "NavList" },
    { name: "MultiColumn" },
    { name: "InlineSeparated" },
    { name: "IconLed" },
  ],

  params: [
    {
      // Default was the numeric `3` until 2026-08, when Horizontal
      // started reading this too. One Standard Value serves every
      // variant, so a numeric default meant "three columns" to each
      // new reader — connecting Horizontal would have re-laid-out
      // every wrap-row placement already out there. `auto` (added to
      // `column-count@1` for this) defers to the variant: MultiColumn
      // still distributes across 3, Horizontal keeps its wrap row.
      name: "Columns",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "column-count@1",
        hint: "How many columns entries lay out across (2-4; values above 4 clamp to 4), honored by the three variants that render tracks: MultiColumn, Horizontal and the Cards grid. `auto` (default) leaves each variant's own layout alone — MultiColumn distributes flat items across 3, Horizontal stays a wrapping row, Cards keeps its 2-up/3-up — so it is not a count of its own. Ignored by MultiColumn when Items reference nested Link Lists (each group is its own column), and by the single-column row stacks (Default, Compact, NavList, IconLed) and single-line strips (UtilityBar, InlineSeparated, Pills).",
        sortOrder: 100,
      },
    },
    {
      // Default was `dot` while only InlineSeparated read this. Now
      // that the horizontal strips read it too, the shared Standard
      // Value has to be the neutral one — a glyph-bearing default
      // would sprinkle separators through every Horizontal and
      // UtilityBar placement. InlineSeparated is built around the
      // glyph, so it falls back to `dot` in code rather than relying
      // on the SV; the visible consequence is that an author who
      // explicitly wants a non-dot glyph there now picks it.
      name: "SeparatorGlyph",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "separator-glyph@1",
        hint: "Glyph rendered between entries of an inline row — dot (·), pipe (|), or slash (/) — honored by the four variants that flow entries along one line: InlineSeparated, Horizontal, UtilityBar and Pills. `none` (default) draws nothing, which is what Horizontal, UtilityBar and Pills have always looked like; InlineSeparated is built around the glyph and falls back to `dot` when nothing is set, so leaving this alone keeps every variant as it was. The vertical row stacks (Default, Compact, NavList, IconLed, MultiColumn) ignore it — a rule between stacked rows is RowSeparators' job, not a glyph's — and so does the Cards grid.",
        sortOrder: 200,
      },
    },
    {
      name: "ItemStyle",
      shape: "enum",
      default: "text",
      sitecore: {
        enumHandle: "item-style@1",
        hint: "How each link row renders its content. `text` (default) keeps the plain text link. `icon-led` leads every row with the entry's IconName (icon-name@1) plus the optional per-item Description — honored by every vertical row variant: Default, Compact, MultiColumn (icon rows inside each headed column: the product-matrix read) and NavList (hairline separators and the end-of-row chevron kept). Rows without an IconName degrade to text-only, and icon-led suppresses ListMarker bullets since a leading icon and a disc read as two competing markers. Ignored where icons don't fit: a horizontal or social-icon Default, UtilityBar, InlineSeparated, Cards and Pills stay text-only, and the IconLed variant is inherently icon-led. Bind `icon-led` when the source shows a leading icon per link row.",
        sortOrder: 300,
      },
    },
    {
      name: "ListMarker",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "list-marker@1",
        hint: "Item marker for the vertical link variants. `none` (default) keeps the plain markerless stack. `bulleted` renders real disc markers (list-disc) whose color follows the row's text token — honored by Default (vertical orientation), Compact, and each MultiColumn column (the footer/body bulleted link-list read). Ignored where a disc is meaningless or competes with an existing marker: Horizontal, UtilityBar, Pills, InlineSeparated, NavList (chevron rows), IconLed, and any icon-led MultiColumn/NavList row. Bind `bulleted` when the source shows disc-bulleted link lists (e.g. nested link-lists under a card title).",
        sortOrder: 400,
      },
    },
    {
      // Was a checkbox until 2026-08. A checkbox could not express this
      // axis once it reached past NavList: its one Standard Value is
      // shared by every variant, so the checked default that gives
      // NavList its hairlines would have put hairlines on the four
      // plain row stacks too, changing every placement already out
      // there. `default` — the new SV — defers to each variant instead,
      // which is what makes the axis general. Legacy checked/unchecked
      // values are still mapped on read (`resolveRowSeparators`), so no
      // existing placement changes what it renders.
      name: "RowSeparators",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "row-separators@1",
        hint: "Hairline rules between rows, honored by every row-based variant: Default (vertical), Compact, NavList, IconLed and MultiColumn columns. `default` leaves each variant's own treatment alone — NavList keeps its historic hairlines, the plain stacks stay plain — so it is not a look of its own. `separated` draws rules between rows on any of them; `plain` removes them, which on NavList is the separator-less tinted-hover pill row of the utility-card link stack (Duke-Energy 'More for customers' cards). The horizontal strips — Horizontal, UtilityBar, Pills, InlineSeparated — and the Cards grid ignore it.",
        sortOrder: 500,
      },
    },
    {
      name: "LinkColorScheme",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Link color as a role text tone, honored by EVERY variant. `default` keeps each variant's own link colour; `primary` gives the classic blue link rows utility cards use. Gradients fall back to their base role. On NavList the trailing chevron / external-link glyph follows the same tone.",
        sortOrder: 510,
      },
    },
    {
      name: "RowSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Row density, honored by every row-based variant: Default, Compact, NavList, IconLed and MultiColumn. `default` leaves each variant's own metrics untouched (it is not a size of its own — nothing is overridden); `sm`/`xs` tighten, `lg` is the roomier utility-card row (pairs with RowSeparators off + LinkColorScheme primary), `xl` the sparse directory row. Padded rows (NavList, IconLed, icon-led columns) take it as row padding; plain vertical stacks take it as the gap between rows. The horizontal strips — Horizontal, UtilityBar, Pills, InlineSeparated — and the Cards grid ignore it.",
        sortOrder: 520,
      },
    },
    {
      // The list TITLE's colour, separate from LinkColorScheme (which
      // recolors the rows). Was hardcoded — `text-accent` on most
      // variants, the muted micro-label on Horizontal's inline title —
      // with no way to author it. `default` keeps each variant's
      // historic colour, so this is additive.
      name: "HeadingColor",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "heading-color@1",
        hint: "Colour of the list's TITLE (not its links — that is LinkColorScheme). `default` keeps each variant's own heading colour: the accent heading on most variants, the quiet uppercase micro-label on Horizontal's inline title. Any other value recolors the title, including `white`/`black` for titles that must hold on a fixed dark or light band. Honored by every variant that renders a title; UtilityBar and InlineSeparated have none.",
        sortOrder: 530,
      },
    },
  ],

  // Child-items authoring pattern (mirrors features-list-grid): authors
  // can create `link-list-item@1` items directly under this rendering's
  // datasource via the Sitecore "Insert" UX, then reference them from
  // the curated Treelist.
  insertOptions: ["link-list-item@1"],
  children: { allowedHandles: ["link-list-item@1"] },

  datasource: {
    templates: [
      { handle: "link-list-content@1" },
      { handle: "social-follow-content@1" },
    ],
    // With multiple compatible templates the compiler can't pick one
    // unambiguously, so dropping the rendering opens the datasource
    // picker. Authors choose between generic and social-follow
    // intentionally per placement.
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Link Lists" },
      { scope: "site", subfolder: "Link Lists" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default linkListRecipe;
