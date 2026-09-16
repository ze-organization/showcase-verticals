import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Separator` rendering parameter on
 * `breadcrumb@1` — the glyph rendered between crumbs. Mirrors the
 * `BreadcrumbNav` primitive's `separator` axis one-to-one. Lands at
 * `<enumerationsRoot>/Navigation/BreadcrumbSeparator` per-site with
 * one child item per value.
 *
 * Distinct from `separator-glyph@1` (link-list's InlineSeparated
 * row): breadcrumbs default to the chevron icon, which that
 * text-glyph-only enum doesn't model, and its `dot` default would be
 * wrong here.
 */
export const breadcrumbSeparatorEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "breadcrumb-separator@1",
  name: "BreadcrumbSeparator",
  displayName: "Breadcrumb Separator",
  description:
    "Glyph rendered between breadcrumb crumbs: chevron icon (default), slash (/), dot (·), or pipe (|).",
  location: { scope: "site", folder: ["Navigation"] },
  default: "chevron",
  values: [
    { name: "chevron", displayName: "Chevron (› icon)" },
    { name: "slash", displayName: "Slash (/)" },
    { name: "dot", displayName: "Dot (·)" },
    { name: "pipe", displayName: "Pipe (|)" },
  ],
} satisfies EnumerationRecipe;

export default breadcrumbSeparatorEnumRecipe;
