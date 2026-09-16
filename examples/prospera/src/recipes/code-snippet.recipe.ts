import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `CodeSnippet` component (./code-snippet.tsx).
 *
 * Three fields (Code, Language, Caption), one Default variant, no
 * params. Renders through the CodeBlock primitive — shiki syntax
 * highlighting, language badge, copy button, optional line numbers —
 * panel, horizontal scroll, whitespace preserved, optional language
 * chip and caption. No syntax highlighting by design.
 */
export const codeSnippetRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "code-snippet@1",
  icon: componentIcons["code-snippet@1"],
  name: "code-snippet",
  displayName: "Code Snippet",
  description:
    "Displays a code snippet through the CodeBlock primitive: shiki syntax highlighting (when Language matches the highlighter's vocabulary), language badge, copy-to-clipboard button, optional line numbers, preserved whitespace, horizontal scrolling, and an optional caption. Use for documentation pages, developer guides, API examples, configuration samples, and technical articles. For editorial pull quotes use `block-quote`; for general prose use `content-block`.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Code",
      shape: "text",
      // Standard Values seed for auto-created datasources.
      default: {
        en: 'npm install @sitecore/components\n\n// then import what you need\nimport { Hero } from "@sitecore/components";',
        ar: 'npm install @sitecore/components\n\n// ثم استورد ما تحتاجه\nimport { Hero } from "@sitecore/components";',
        es: 'npm install @sitecore/components\n\n// luego importa lo que necesites\nimport { Hero } from "@sitecore/components";',
        fr: 'npm install @sitecore/components\n\n// puis importez ce dont vous avez besoin\nimport { Hero } from "@sitecore/components";',
        de: 'npm install @sitecore/components\n\n// dann importieren Sie, was Sie brauchen\nimport { Hero } from "@sitecore/components";',
        da: 'npm install @sitecore/components\n\n// importér derefter det, du skal bruge\nimport { Hero } from "@sitecore/components";',
        ja: 'npm install @sitecore/components\n\n// 必要なものをインポートします\nimport { Hero } from "@sitecore/components";',
        "zh-CN":
          'npm install @sitecore/components\n\n// 然后导入所需内容\nimport { Hero } from "@sitecore/components";',
        "zh-TW":
          'npm install @sitecore/components\n\n// 然後匯入所需內容\nimport { Hero } from "@sitecore/components";',
        it: 'npm install @sitecore/components\n\n// poi importa ciò che ti serve\nimport { Hero } from "@sitecore/components";',
      },
      sitecore: {
        type: "multi-line-text",
        required: true,
        hint: "The code snippet. Line breaks and indentation are preserved exactly.",
        sortOrder: 100,
      },
    },
    {
      name: "Language",
      shape: "text",
      default: "bash",
      sitecore: {
        type: "single-line-text",
        hint: "Optional language label shown as a small chip at the panel's top corner (e.g. 'bash', 'tsx', 'json'). Clear to hide.",
        sortOrder: 200,
      },
    },
    {
      name: "Caption",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional caption rendered below the panel.",
        sortOrder: 300,
      },
    },
  ],

  variants: [{ name: "Default" }],

  params: [
    {
      // Line numbers in the gutter (the CodeBlock primitive renders
      // them). Off by default — omitted `default` IS the unchecked
      // Standard Value per the boolean convention.
      name: "ShowLineNumbers",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Render line numbers in the code panel's gutter.",
        sortOrder: 100,
      },
    },
    {
      // Copy-to-clipboard button, ON by default (the primitive's own
      // default) — `default: "true"` seeds the checked Standard Value.
      name: "ShowCopy",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Show the copy-to-clipboard button on the code panel.",
        sortOrder: 110,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Code" },
      { scope: "site", subfolder: "Site Shared UI/Code" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default codeSnippetRecipe;
