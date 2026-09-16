import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing a component's `Alignment` rendering
 * parameter — horizontal placement of a constrained block within its
 * parent's available width. Lands at `<enumerationsRoot>/Alignment`
 * per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "alignment@1"`. Values map to logical Tailwind utilities (`me-auto`,
 * `mx-auto`, `ms-auto`) so the choice flips correctly under RTL — see
 * the codebase convention against physical `left`/`right` props.
 *
 * The literal `default` value was removed 2026-07: it delegated to
 * "the component's natural alignment", which eroded standard-value
 * logic. Every consuming recipe's param now declares its concrete
 * natural value instead (`start` for most consumers — hence the
 * enum-level default).
 *
 * `auto` was added 2026-07 as that sentinel's in-list successor and
 * removed again 2026-08, because it only ever made sense for ONE of
 * the fifteen consumers. `auto` means "defer to the component's other
 * layout axis" — a component without such an axis has nothing to defer
 * to, so `auto` collapsed onto its declared default and shipped as a
 * knob that did nothing. Fourteen of fifteen consumers were in that
 * position (the preview layer had already carved a hand-written
 * `alignmentPlaced` subset to keep `auto` out of the editor).
 *
 * Consumers that genuinely defer — today only promo's `ContentAlign`,
 * which falls back to its `Layout` param — bind `content-alignment@1`
 * instead, which is this list plus `auto`.
 *
 * Only meaningful when the block has a max-width constraint
 * (`max-width@1` ≠ `full`). With no constraint the block already
 * occupies the parent's full width and alignment is a no-op.
 */
export const alignmentEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "alignment@1",
  name: "Alignment",
  displayName: "Alignment",
  description:
    "Horizontal placement of a constrained block within its parent. Logical (RTL-safe).",
  location: { scope: "site", folder: ["Layout"] },
  default: "start",
  values: [
    { name: "start", displayName: "Start" },
    { name: "center", displayName: "Center" },
    { name: "end", displayName: "End" },
  ],
} satisfies EnumerationRecipe;

export default alignmentEnumRecipe;
