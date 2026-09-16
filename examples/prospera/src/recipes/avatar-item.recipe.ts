import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for a standalone Avatar item — the focused
 * image + name + description trio and nothing else.
 *
 * **Why a dedicated content template (not rendering-inline fields).**
 * An avatar is *content*, not per-placement presentation: the same
 * "Jane Doe, Head of Experience" item can back a testimonial byline on
 * one page and a team tile on another. Rendering-inline fields (the
 * classic SXA pattern where the rendering's own template doubles as
 * the datasource) tie the shape to one rendering's identity; a
 * content template makes the item reusable and lets the folder
 * insert-options offer "Avatar Item" as a first-class type.
 *
 * **Pairing with `author@1`.** Author (./author.recipe.ts) is the
 * *superset* — a full person profile (role, bio, contact, socials)
 * whose AuthorName / About / Avatar fields cover the same concerns as
 * Name / Description / Image here. Renderings that only need the
 * avatar surface (`avatar-block@1`) declare BOTH templates as
 * compatible datasources, with `avatar-item@1` FIRST (the primary
 * shape — `datasource.templates[0]` is what scai's page compiler
 * materialises for scoped/local datasource slots). Pick Avatar Item
 * for ad-hoc attributions — testimonial bylines, team tiles,
 * fictional personas; pick Author when the person is a real,
 * attributed entity that also lives elsewhere on the site.
 *
 * Field names (Name, Description, Image) are the canonical shape
 * `mapAvatarBlock` in
 * `src/components/registry/components/ui/avatar-block.sitecore.ts`
 * prefers, with the author-template names (AuthorName, About, Avatar)
 * as fallbacks. Keep the names exactly aligned with that adapter:
 * scai's compiler hashes each name into a deterministic field GUID,
 * and the React component reads from those names via the
 * layout-service `fields` object.
 */
export const avatarItemRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "avatar-item@1",
  name: "avatar-item",
  displayName: "Avatar Item",
  description:
    "Standalone avatar record — image, name, and short description. The focused datasource shape for avatar surfaces; use Author for full person profiles.",

  fields: [
    {
      name: "Name",
      shape: "text",
      // Generic placeholder so freshly inserted avatars render with a
      // visible name + initials fallback. Authors swap to the real
      // person at authoring time.
      default: "Jane Doe",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Display name. Used for initials fallback when no image is set.",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "text",
      default: {
        en: "Head of Experience",
        ar: "رئيس قسم تجربة العملاء",
        es: "Directora de experiencia",
        fr: "Responsable de l'expérience",
        de: "Leiter Experience",
        da: "Chef for oplevelse",
        ja: "エクスペリエンス責任者",
        "zh-CN": "体验负责人",
        "zh-TW": "體驗負責人",
        it: "Responsabile Experience",
      },
      sitecore: {
        type: "multi-line-text",
        hint: "Short description shown alongside the avatar (e.g. 'Head of Experience').",
        sortOrder: 200,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "avatar",
      // Picsum square seeded off the template handle so each freshly
      // created avatar lands with a stable placeholder image.
      default:
        "Avatar placeholder|/theme-photos/home-hero.jpg",
      sitecore: {
        hint: "Avatar image. Falls back to initials when empty.",
        section: "Media",
        sortOrder: 100,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default avatarItemRecipe;
