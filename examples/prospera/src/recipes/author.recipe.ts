import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for an Author person item.
 *
 * **Compatible-data-source pattern.** Authors are *content* — reusable
 * person items live in the site-level shared content tree (the
 * `Site Shared UI/Authors` pool, e.g.
 * `/sitecore/content/<site>/Data/Site Shared UI/Authors/Liz`) — not
 * per-placement presentation. Renderings that present author profiles
 * (e.g. `avatar-block@1`'s avatar surface, an article byline, a team
 * grid) declare the Author template as one of their compatible
 * datasource templates so the Pages picker offers Author items.
 *
 * Author is a *superset* of the avatar-relevant fields: it carries the
 * author's full profile (bio, role, contact, socials) on top of the
 * name/about/avatar trio. The dedicated `avatar-item@1` template
 * (./avatar-item.recipe.ts) exists for the lighter use case where only
 * the avatar concerns matter. Both feed `avatar-block@1` via its
 * `.sitecore.ts` adapter, which normalises either shape into
 * `AvatarBlockProps`.
 *
 * The author-template field names (AuthorName, About, Avatar) are
 * picked up by `mapAvatarBlock` in `avatar-block.sitecore.ts` as
 * fallbacks behind the `avatar-item@1` canonical names. Keep these names
 * exactly aligned with the adapter: scai's compiler hashes each name
 * into a deterministic field GUID, and the React component reads from
 * those names via the layout-service `fields` object.
 */
export const authorRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "author@1",
  name: "author",
  displayName: "Author",
  description:
    "Reusable Author person record — profile, bio, contact, and socials. Used as a compatible datasource for renderings that present an author profile.",

  fields: [
    {
      name: "AuthorName",
      shape: "text",
      default: "Jordan Lee",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Display name. Used for initials fallback when no image is set.",
        sortOrder: 100,
      },
    },
    {
      name: "JobTitle",
      shape: "text",
      default: "Senior Editor",
      sitecore: {
        type: "single-line-text",
        hint: "Role or job title (e.g. 'Lead Designer', 'Senior Editor').",
        sortOrder: 200,
      },
    },
    {
      name: "Pronouns",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Display pronouns (e.g. 'she/her', 'they/them').",
        sortOrder: 300,
      },
    },
    {
      name: "About",
      shape: "text",
      default: "Senior editor covering design and travel.",
      sitecore: {
        type: "multi-line-text",
        hint: "Short description shown alongside the avatar.",
        sortOrder: 400,
      },
    },
    {
      name: "Bio",
      shape: "richText",
      default:
        "<p>Replace with the full biography. Rendered on dedicated author profile pages.</p>",
      sitecore: {
        hint: "Full biography. Rendered on dedicated author profile pages, not in compact avatar surfaces.",
        sortOrder: 500,
      },
    },
    {
      name: "Avatar",
      shape: "image",
      default: "Author avatar|/theme-photos/hub-02.jpg",
      sitecore: {
        hint: "Profile image. Falls back to initials when empty.",
        section: "Media",
        sortOrder: 100,
      },
    },
    {
      name: "Email",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Public contact email. Surfaced on profile pages and bylines that opt in.",
        section: "Contact",
        sortOrder: 100,
      },
    },
    {
      name: "Website",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Personal website or portfolio.",
        section: "Contact",
        sortOrder: 200,
      },
    },
    {
      name: "Twitter",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Twitter / X profile URL.",
        section: "Social",
        sortOrder: 100,
      },
    },
    {
      name: "LinkedIn",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "LinkedIn profile URL.",
        section: "Social",
        sortOrder: 200,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default authorRecipe;
