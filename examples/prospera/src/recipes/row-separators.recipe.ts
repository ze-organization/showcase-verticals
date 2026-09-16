import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the link-list `RowSeparators` rendering
 * parameter — whether row-based link layouts draw hairline rules
 * between rows. Lands at `<enumerationsRoot>/Navigation/RowSeparators`
 * per-site.
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "row-separators@1"`.
 *
 * Replaces a checkbox (2026-08). The checkbox could not express this
 * axis: one Standard Value is shared by every variant, so a checked
 * default meant "separated" for NavList (correct, its historic look)
 * and would have meant "separated" for Default / Compact / MultiColumn
 * / IconLed too the moment they started reading it — growing hairlines
 * on every placement already out there. Hence `default`, which defers
 * to each variant's own treatment and is what makes the axis safe to
 * extend beyond NavList.
 *
 *   `default`    each variant's own rows — NavList keeps its hairlines,
 *                the plain stacks stay plain. Not a look of its own.
 *   `separated`  hairline rule between rows, on any row-based variant.
 *   `plain`      no rules; NavList swaps to its tinted-hover pill rows.
 *
 * The legacy checkbox encodings still arrive from placements authored
 * before the migration and are mapped on read — see
 * `resolveRowSeparators` in
 * [src/components/registry/components/navigation/link-list.tsx].
 */
export const rowSeparatorsEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "row-separators@1",
  name: "RowSeparators",
  displayName: "Row Separators",
  description:
    "Hairline rules between rows on the row-based link layouts: `default` (each variant's own treatment — NavList keeps its hairlines, plain stacks stay plain), `separated` (rules between rows on any row-based variant), or `plain` (no rules; NavList takes its tinted-hover pill rows).",
  location: { scope: "site", folder: ["Navigation"] },
  values: [
    { name: "default", displayName: "Default" },
    { name: "separated", displayName: "Separated" },
    { name: "plain", displayName: "Plain" },
  ],
} satisfies EnumerationRecipe;

export default rowSeparatorsEnumRecipe;
