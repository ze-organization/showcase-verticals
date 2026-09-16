import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Layout` rendering parameter on
 * `avatar-block@1`. Controls whether the avatar sits beside the text
 * (`row`) or above it (`stack`).
 *
 * Lands at `<enumerationsRoot>/Components/Avatar/AvatarLayout` per-site.
 *
 * `default` is a value (not just a Sitecore Standard Value setting),
 * matching the convention on `size@1`: authors picking "Default"
 * delegate the concrete layout choice to the component, which maps it
 * to whatever its natural default is (`row` for avatar-block). Lets
 * future consumers with a different intrinsic default share this enum
 * without forcing every recipe to override `default:`.
 */
export const avatarLayoutEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "avatar-layout@1",
  name: "AvatarLayout",
  displayName: "Avatar Layout",
  description: "Position of the avatar relative to its accompanying text.",
  location: { scope: "site", folder: ["Components", "Avatar"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "row", displayName: "Row" },
    { name: "stack", displayName: "Stack" },
  ],
} satisfies EnumerationRecipe;

export default avatarLayoutEnumRecipe;
