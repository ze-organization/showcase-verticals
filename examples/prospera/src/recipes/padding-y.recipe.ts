import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing a component's `PaddingY` rendering
 * parameter — vertical padding token applied as `py-*` on the
 * container shell. Lands at `<enumerationsRoot>/Layout/PaddingY`
 * per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "padding-y@1"`. Components map each value to a Tailwind `py-*`
 * utility — see the `PADDING_Y_CLASSES` table in container.tsx,
 * section-wrapper.tsx, etc.
 *
 * The literal `default` value was removed 2026-07: it cascaded to
 * "the component's natural padding", which meant a different py per
 * consumer and eroded standard-value logic. Every consuming recipe's
 * param now declares its concrete natural value instead (`none` for
 * the layout shells — caller provides spacing via wrapping section).
 * `none` explicitly flattens vertical padding to zero.
 *
 * `auto` (added 2026-07) is the in-list successor to the removed
 * `default` sentinel for the shells whose natural padding is a
 * responsive ramp (`py-12 md:py-16`, a container-query ramp, or a
 * Size-bound scale) that no single `py-*` token reproduces. It means
 * "the component's own natural vertical padding": each such component
 * maps `auto` to that bespoke ramp in code (see section-wrapper.tsx /
 * footer.tsx). Unlike the old
 * `default`, `auto` is a real enum member, so it selects and saves
 * cleanly in the Pages rendering-parameters dropdown. Components whose
 * natural padding IS a concrete token bind that token directly and do
 * not use `auto`.
 *
 * This enum replaced the inline `type: "droplist"` + `source:
 * { kind: "raw", value: "..." }` shape that didn't reliably render in
 * Pages chrome — the dropdown showed up empty until authors picked a
 * value via Standard Values, mirroring the same fix applied earlier
 * to ColumnCount / Distribution.
 */
export const paddingYEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "padding-y@1",
  name: "PaddingY",
  displayName: "Vertical Padding",
  description:
    "Vertical padding token (`py-*`). Used by every layout-shell component that exposes a PaddingY rendering parameter.",
  location: { scope: "site", folder: ["Layout"] },
  default: "none",
  values: [
    { name: "auto", displayName: "Auto (natural)" },
    { name: "none", displayName: "None" },
    { name: "sm", displayName: "Small" },
    { name: "md", displayName: "Medium" },
    { name: "lg", displayName: "Large" },
    { name: "xl", displayName: "Extra Large" },
    { name: "2xl", displayName: "2X Large" },
  ],
} satisfies EnumerationRecipe;

export default paddingYEnumRecipe;
