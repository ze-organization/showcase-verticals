import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `Container` component (./container.tsx).
 *
 * A permissive layout shell: one dynamic placeholder slot, no field
 * datasource. Any rendering can be dropped inside — the recipe records
 * an open allow-list (`allowedRenderingHandles` deliberately omitted).
 *
 * Two variants share that slot (`container-{*}`):
 *   - `Default`   — original marketing indent (MaxWidth / PaddingY).
 *                   Never edge-to-edge.
 *   - `FullBleed` — viewport width, no padding. Page-top heroes belong
 *                   here. The variant is the constraint axis, not the
 *                   MaxWidth param.
 *
 * **Param vocabulary.** Shared with the rest of the section-shell
 * family. FullBleed ignores MaxWidth / Alignment / PaddingY at
 * render time (the variant is the constraint axis).
 */

export const containerRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "container@1",
  icon: componentIcons["container@1"],
  name: "container",
  displayName: "Container",
  description:
    "Layout shell with optional background image and a permissive placeholder for nested renderings. Default caps width and padding; FullBleed is edge-to-edge (page-top heroes). Shares the section-shell param vocabulary: Position, MaxWidth, Alignment.",

  section: { handle: "layout-section@1" },

  variants: [{ name: "Default" }, { name: "FullBleed" }],

  params: [
    {
      name: "Position",
      shape: "enum",
      default: "inline",
      sitecore: {
        enumHandle: "position@1",
        hint: "Inline in page flow, or pin to top / bottom (CSS `position: sticky`).",
        sortOrder: 100,
      },
    },
    {
      name: "MaxWidth",
      shape: "enum",
      default: "standard",
      sitecore: {
        enumHandle: "max-width@1",
        hint: "Semantic width cap for the inner content block. `standard` (default) is the article-width column; `full` removes the cap. Ignored by the FullBleed variant.",
        sortOrder: 200,
      },
    },
    {
      name: "Alignment",
      shape: "enum",
      default: "center",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Horizontal placement of the constrained block. `center` (default) centers it; no-op when MaxWidth is `full` or the variant is FullBleed.",
        sortOrder: 300,
      },
    },
    {
      name: "BackgroundImage",
      shape: "image",
      sitecore: {
        type: "image",
        hint: "Optional background image. URL is parsed by the React component.",
        sortOrder: 400,
      },
    },
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Surface fill. `none` is transparent — the container adopts whatever's behind it. The other schemes apply the matching subdued background.",
        sortOrder: 450,
      },
    },
    {
      name: "BackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "`subtle` keeps the soft -background tint (default). `bold` uses the pure scheme color (any scheme, incl. status colors) and inverts text inside the container.",
        sortOrder: 460,
      },
    },
    {
      name: "PaddingY",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding (`py-*`). Default = none; pick `md` for a comfortable colored band. Ignored by the FullBleed variant.",
        sortOrder: 500,
      },
    },
  ],

  dynamicPlaceholders: true,

  placeholders: [{ key: "container-{*}" }],
} satisfies ComponentTemplateRecipe;

export default containerRecipe;
