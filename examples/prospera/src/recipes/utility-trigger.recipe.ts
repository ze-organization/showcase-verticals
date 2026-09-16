import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `UtilityTrigger` component (./utility-trigger.tsx).
 *
 * A single header utility affordance — an icon, a label, or both,
 * optionally with a panel placeholder for richer behavior. Three
 * rendering paths driven by field presence:
 *
 *   1. `Link` only             → plain link (Log in, Find an Agent)
 *   2. `HasPanel` (no Link)    → trigger toggles the panel (Search →
 *                                input, Location → ZIP picker)
 *   3. `Link` + `HasPanel`     → text-link + chevron (mega-menu
 *                                trigger: the label navigates, the
 *                                chevron opens the panel)
 *
 * Label precedence: `Label` is ALWAYS the visible label; the Link
 * field's own text is hover metadata (title attribute) and is only
 * used as the visible label when `Label` is empty.
 *
 * Panel content is authored into the dynamic `trigger-panel-{*}`
 * placeholder — typically a Form (search/zip/login), PreviewSearch,
 * or composed mega-menu content (RichText + LinkLists + Buttons).
 * `PanelLayout` picks how it opens (inline dropdown / full-width
 * header band / modal dialog); `PanelBackground` (+ intensity) paints
 * its surface. `TriggerStyle` + `ColorScheme` style the trigger
 * itself; `IconName` picks the leading icon from the shared
 * `icon-name@1` vocabulary.
 *
 * Two variants:
 *
 *   Default  — the three field-driven trigger paths above.
 *   Search   — icon + expanding inline input (presentational, CSS
 *              hover/focus only). `IconName` picks the leading icon
 *              (default "search"); `Label` doubles as the input
 *              placeholder. Place flat into a header slot for the
 *              fifa/emirates-style search affordance — no panel
 *              composition needed.
 */
export const utilityTriggerRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "utility-trigger@1",
  icon: componentIcons["utility-trigger@1"],
  name: "utility-trigger",
  displayName: "Utility Trigger",
  description:
    "Single header utility control — icon, label, or both, with optional panel placeholder (inline dropdown, full-width band, or modal) and trigger style/color axes.",

  section: { handle: "layout-section@1" },

  fields: [
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Log in",
        ar: "تسجيل الدخول",
        es: "Iniciar sesión",
        fr: "Se connecter",
        de: "Anmelden",
        da: "Log ind",
        ja: "ログイン",
        "zh-CN": "登录",
        "zh-TW": "登入",
        it: "Accedi",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Visible trigger text (e.g. 'Log in', 'Español', 'Explore Northwind'). Always wins over the Link field's own text — that text becomes hover metadata. Required if IconName is `none`.",
        sortOrder: 100,
      },
    },
    {
      name: "Link",
      shape: "link",
      // The URL half is `/` on purpose — scai encodes a `#` URL as
      // linktype="anchor" WITHOUT the `anchor` attribute the Layout
      // Service builds hrefs from, so the SV arrived as href:"" and the
      // link rendered blank (see cta-button.recipe.ts diagnosis).
      default: "Log in|/",
      sitecore: {
        type: "general-link",
        hint: "Optional target URL. When set without HasPanel, the trigger is a plain link. When set with HasPanel, the label navigates and the chevron opens the panel. The link's own text renders as hover metadata (title), not as the visible label — author the visible label in Label.",
        sortOrder: 300,
      },
    },
    {
      name: "HasPanel",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Enable the panel placeholder. When on, a `trigger-panel-{ph}` placeholder appears (visible as a tray in editing mode) and the trigger toggles it per PanelLayout.",
        sortOrder: 400,
      },
    },
  ],

  variants: [{ name: "Default" }, { name: "Search" }],

  // Single panel placeholder per trigger. SDK substitutes the
  // rendering's DynamicPlaceholderId for the {*} wildcard at render
  // time, so different placements on the same page get scoped names.
  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "trigger-panel-{*}",
    },
  ],

  params: [
    {
      name: "IconName",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "icon-name@1",
        hint: "Leading icon from the shared icon-name@1 vocabulary (e.g. `search`, `account`, `cart`, `location`, `globe`). `none` (default) renders no icon — the Label alone is the trigger.",
        sortOrder: 100,
      },
    },
    {
      name: "TriggerStyle",
      shape: "enum",
      default: "ghost",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Visual treatment of the trigger. `ghost` (default) is the quiet dropdown-caret look; `default`/`pill` render a filled button, `outline` a bordered one, `link` an underlined text link.",
        sortOrder: 200,
      },
    },
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Trigger color role. `none` (default) inherits the header's text color. Filled trigger styles pair the role's solid fill with its foreground token; ghost/outline/link tint the text. Honored by BOTH variants — on Search it tints the trigger, while the expanded field itself takes the Input primitive's theme tokens (`--input-background`/`--input-border`) so it matches every other field on the site.",
        sortOrder: 300,
      },
    },
    {
      name: "PanelLayout",
      shape: "enum",
      default: "inline",
      sitecore: {
        enumHandle: "panel-layout@1",
        hint: "How the panel opens when HasPanel is on: `inline` (anchored dropdown, default), `full-width` (band spanning the header row), or `modal` (dialog overlay).",
        sortOrder: 400,
      },
    },
    {
      name: "PanelBackground",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Panel surface color (section-surface vocabulary). `none` (default) keeps the page background; pair with PanelBackgroundIntensity for tint vs. solid.",
        sortOrder: 500,
      },
    },
    {
      name: "PanelBackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "How saturated the panel fill is: `subtle` (default) uses the soft `-background` tint; `bold` uses the pure role color and re-tones panel content via surface-invert.",
        sortOrder: 600,
      },
    },
  ],

  placedIn: [
    "header-end-{*}",
    "header-utility-start-{*}",
    "header-utility-end-{*}",
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Utility Triggers" },
      { scope: "site", subfolder: "Utility Triggers" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default utilityTriggerRecipe;
