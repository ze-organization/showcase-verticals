import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing a component's `MaxWidth` rendering
 * parameter — caps the inner content width to a semantic preset rather
 * than a free pixel value. Lands at `<enumerationsRoot>/MaxWidth`
 * per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "max-width@1"`. Components map each value to a Tailwind `max-w-*`
 * utility appropriate for their context — `narrow` is a reading width
 * (~md), `standard` is most page content (~lg), `wide` is broader
 * sections (~xl), `full` is an explicit "no constraint" pick.
 *
 * The literal `default` value was removed 2026-07: it delegated to
 * "the component's natural max-width", which meant a different thing
 * per consumer and eroded standard-value logic. Every consuming
 * recipe's param now declares its concrete natural value instead.
 *
 * `auto` (added 2026-07) is the in-list successor to the removed
 * `default` sentinel for shells whose natural width isn't
 * enum-representable — e.g. consent-banner's / footer's Tailwind
 * responsive `container` cap. It means "the component's own natural
 * width": those components map `auto` to that container cap, emitting
 * no extra `max-w-*` class. Note this is
 * NOT `full` — `full` (`max-w-none`) would strip the container cap via
 * tailwind-merge and widen the row. Unlike the old `default`, `auto`
 * is a real enum member that selects and saves cleanly in the Pages
 * dropdown. Components whose natural width IS a concrete preset bind
 * that preset directly and do not use `auto`.
 *
 * Sticky/sticky-bottom placements (`position@1`) usually want
 * `full` — a constrained max-width plus sticky tends to float the
 * bar oddly inside a wide viewport. Designed to compose with
 * `alignment@1` (orthogonal axis).
 */
export const maxWidthEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "max-width@1",
  name: "MaxWidth",
  displayName: "Max Width",
  description:
    "Semantic max-width preset. Composes with `alignment@1` for horizontal placement of the constrained block.",
  location: { scope: "site", folder: ["Layout"] },
  default: "standard",
  values: [
    { name: "auto", displayName: "Auto (natural)" },
    { name: "narrow", displayName: "Narrow (reading width)" },
    { name: "standard", displayName: "Standard" },
    { name: "wide", displayName: "Wide" },
    { name: "full", displayName: "Full (no constraint)" },
  ],
} satisfies EnumerationRecipe;

export default maxWidthEnumRecipe;
