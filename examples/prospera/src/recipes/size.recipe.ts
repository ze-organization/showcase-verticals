import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing components' `Size` rendering parameter
 * when they want a Droplink-backed picker — display name distinct from
 * stored value, value items reusable across recipes. Lands at
 * `<enumerationsRoot>/Size` per-site with one child item per value.
 *
 * Reference from a component recipe via `sitecore.enumHandle: "size@1"`
 * on any enum-shaped param. Adding a value here and re-pushing surfaces
 * it in every consumer's dropdown automatically (the Droplink Source
 * resolves by location at editor time, so existing field-definitions
 * don't need to change).
 *
 * Components whose Size scale is intentionally local (e.g. an accordion
 * that only supports `sm | md | lg`) should keep their inline pipe-list
 * Droplist values rather than reaching for this enum — the shared scale
 * implies sharing intent.
 *
 * `default` is intentionally a value (not just a Sitecore Standard Value
 * setting): authors picking "Default" delegate the concrete size choice
 * to the component, which maps it to whatever its natural default is
 * (`md` for badge, the button primitive's own `default` for CTA, etc.).
 * This lets one shared scale serve components with different intrinsic
 * defaults without forcing every recipe to override `default:`.
 */
export const sizeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "size@1",
  name: "Size",
  displayName: "Size",
  description:
    "Shared semantic size scale. Used by every component that exposes a Size rendering parameter and wants a consistent scale across the design system.",
  location: { scope: "site", folder: ["Layout"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "xs", displayName: "Extra Small" },
    { name: "sm", displayName: "Small" },
    { name: "md", displayName: "Medium" },
    { name: "lg", displayName: "Large" },
    { name: "xl", displayName: "Extra Large" },
  ],
} satisfies EnumerationRecipe;

export default sizeEnumRecipe;
