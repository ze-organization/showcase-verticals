import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for a single `SocialLinks` entry — one outbound
 * link to a brand-owned social profile. Used as the Treelist target on
 * `social-links@1`'s `Links` field (the same treelist-of-child-items
 * pattern as `link-list-content@1` → `link-list-item@1`).
 *
 * Two fields make up an item:
 *
 *   Platform  a `social-link-platform@1` droplink — selects which
 *             network's brand icon renders and its native brand color.
 *   Link      the brand's own profile URL on that network (opens in a
 *             new tab). The label half doubles as the accessible name /
 *             tooltip when the item renders icon-only.
 *
 * Field names mirror `SocialLinkLinkedItem`'s `fields` keys in
 * `./social-links.tsx` exactly — scai hashes each name into a
 * deterministic field GUID and the React side reads from those names
 * via the layout-service `fields` object. Don't rename without updating
 * both sides.
 */
export const socialLinkItemRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "social-link-item@1",
  name: "social-link-item",
  displayName: "Social Link Item",
  description:
    "A single brand social-profile link — used by `social-links@1` as a Treelist target. Carries a Platform selector (social-link-platform@1) and the brand's profile URL.",

  fields: [
    {
      name: "Platform",
      shape: "enum",
      default: "facebook",
      sitecore: {
        enumHandle: "social-link-platform@1",
        hint: "Which social network this link points at. Determines the brand icon and its native color. Unknown/empty values drop the item from the row.",
        sortOrder: 100,
      },
    },
    {
      name: "Link",
      // The URL half is a real destination on purpose — scai encodes a
      // `#` URL as linktype="anchor" WITHOUT the `anchor` attribute the
      // Layout Service builds hrefs from, so an item with a `#` link
      // would arrive with href:"" and be dropped as malformed (see
      // link-list-item.recipe.ts / cta-button.recipe.ts diagnosis).
      shape: "link",
      default: "Facebook|https://www.facebook.com",
      sitecore: {
        type: "general-link",
        hint: "The brand's own profile URL on this network (e.g. https://instagram.com/yourbrand). Opens in a new tab. The link text is used as the accessible name and tooltip when the row is icon-only.",
        sortOrder: 200,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default socialLinkItemRecipe;
