import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `WildcardExperience` — the composable wrapper for
 * Sitecore *wildcard pages*, modeled on `search-experience@1`.
 *
 * A wildcard page is a page item literally named `*` (a Page recipe
 * whose `itemPath` ends in `/*`). Where `wildcard-detail@1` is the
 * quick all-in-one detail rendering, this wrapper lets authors compose
 * the detail page out of ANY renderings and map the resolved content
 * model onto them:
 *
 *   1. The wrapper resolves `<SourceRoot>/<URL slug>` once at request
 *      time (head-app client hook via the server-only Edge GraphQL
 *      proxy) and provides the resolved item through React context.
 *   2. Authors fill the unrestricted `wildcard-content-{*}`
 *      placeholder with ordinary renderings (hero, content-block,
 *      media, card lists, …).
 *   3. Each child rendering may carry a `WildcardBindings` rendering
 *      parameter — a JSON object mapping the child's prop names to
 *      resolved field names, e.g.
 *      `{"title":"Title","image":"Image","body":"Story"}`. The head
 *      app overlays the mapped resolved fields onto that child's
 *      props; the child's authored datasource content remains the
 *      fallback (editing mode, preview, unresolved slugs).
 *
 * The datasource is therefore tiny: `SourceRoot` (resolver
 * configuration) plus `Title` (canvas label for the editing-mode
 * hint). No authored content lives on the wrapper itself.
 */
export const wildcardExperienceRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "wildcard-experience@1",
  icon: componentIcons["wildcard-experience@1"],
  name: "wildcard-experience",
  displayName: "Wildcard Experience",
  description:
    "Composable wrapper for Sitecore wildcard (*) pages. Resolves the URL slug to a content item under the configured Source Root once, exposes it through context, and renders an unrestricted placeholder; child renderings bind resolved fields to their props via a WildcardBindings rendering parameter.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "SourceRoot",
      shape: "text",
      default: "",
      sitecore: {
        type: "single-line-text",
        hint: "Content-tree path of the data folder the URL slug resolves under (e.g. /sitecore/content/<Site>/Home/Data/Items). Enter the real site path — a {site} token is NOT substituted at runtime. Leave empty to always render the children's authored content.",
        sortOrder: 100,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Wildcard experience",
        ar: "تجربة العنصر البديل",
        es: "Experiencia comodín",
        fr: "Expérience générique",
        de: "Wildcard-Erlebnis",
        da: "Wildcard-oplevelse",
        ja: "ワイルドカード エクスペリエンス",
        "zh-CN": "通配符体验",
        "zh-TW": "萬用字元體驗",
        it: "Esperienza jolly",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Canvas label only — shown in the editing-mode hint so authors can tell wildcard wrappers apart. Never rendered on the live page.",
        sortOrder: 200,
      },
    },
  ],

  variants: [{ name: "Default" }],

  placeholders: [
    {
      key: "wildcard-content-{*}",
      // Intentionally unrestricted — the whole point of the wrapper is
      // that ANY rendering can be composed inside and bound to the
      // resolved content model via its WildcardBindings param.
    },
  ],

  placedIn: ["headless-main-{*}"],

  datasource: {
    templates: [{ handle: "wildcard-experience@1" }],
    autoCreate: true,
    openPropertiesAfterAdd: true,
    locations: [
      {
        scope: "page",
        subfolder: "Wildcard Experiences",
        allowedTemplates: [{ handle: "wildcard-experience@1" }],
      },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default wildcardExperienceRecipe;
