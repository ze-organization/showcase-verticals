import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing a component's `InstanceScope` rendering
 * parameter — controls how personalization history is partitioned for
 * an instance of a component:
 *
 *   - `site` → one shared history for this instance across every page
 *     it appears on. Right for system banners (maintenance notice,
 *     account-wide announcements) that should count as the *same*
 *     interaction regardless of where the visitor saw them.
 *   - `page` → history is scoped to the URL where the interaction
 *     happened. Right for content-specific alerts (campaign promo on
 *     /pricing) where dismissing it on one page shouldn't affect its
 *     visibility on another.
 *
 * Reference from any component recipe via
 * `sitecore.enumHandle: "instance-scope@1"`. The component is
 * responsible for fanning this value into its CDP event meta so the
 * personalization rules on the Sitecore side can match accordingly.
 * Lands at `<enumerationsRoot>/Instance Scope` per-site.
 */
export const instanceScopeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "instance-scope@1",
  name: "Instance Scope",
  displayName: "Instance Scope",
  description:
    "Whether personalization history (dismissals, views, clicks) for this instance is partitioned per-page or shared across the whole site.",
  location: { scope: "site", folder: ["Personalization"] },
  default: "page",
  values: [
    { name: "site", displayName: "Site-wide" },
    { name: "page", displayName: "Page-scoped" },
  ],
} satisfies EnumerationRecipe;

export default instanceScopeEnumRecipe;
