import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for a Social Follow datasource — five named link
 * fields covering the canonical social platforms (Facebook, Twitter/X,
 * Instagram, YouTube, LinkedIn). Used as a **compatible datasource**
 * for `link-list@1`.
 *
 * Why a separate template instead of a generic Items Treelist
 * (`link-list-content@1`): authors filling out social profiles see
 * five named slots — one per platform — instead of a list editor where
 * they have to remember to add five items and label each one. The
 * React side (`link-list.tsx`) detects which template shape arrives
 * via the layout-service `fields` object and resolves the icon from
 * each link's URL host, so the same `link-list@1` rendering renders
 * either datasource transparently.
 *
 * **Pairs with `itemStyle: "social-icon"` (or `social-icon-with-label`)
 * on the rendering's parameters** — that's what triggers the URL-host
 * icon resolution. Without it the rendering shows plain text links
 * for the five platforms. Page designs that embed this datasource
 * should pin the param via Standard Values on a parameters template.
 *
 * **No link Standard Values yet.** scai's `default: string` surface
 * skips link/image/treelist defaults — those require a structured
 * payload that needs a `ContentItemRecipe` to layer in. A followup
 * will ship `social-follow-default@1` as a ContentItem with the
 * five platform URLs pre-filled so authors can start from a working
 * default rather than five empty fields.
 */
export const socialFollowContentRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "social-follow-content@1",
  name: "social-follow-content",
  displayName: "Social Follow",
  description:
    'Five named social-platform link fields. Used as a compatible datasource for `link-list@1` — pair with `itemStyle: "social-icon"` to get URL-host icon resolution.',

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Follow us",
        ar: "تابعنا",
        es: "Síguenos",
        fr: "Suivez-nous",
        de: "Folgen Sie uns",
        da: "Følg os",
        ja: "フォローする",
        "zh-CN": "关注我们",
        "zh-TW": "追蹤我們",
        it: "Seguici",
      },
      sitecore: {
        type: "single-line-text",
        hint: 'Optional heading shown above the social icons (e.g. "Follow us").',
        sortOrder: 100,
      },
    },
    {
      name: "FacebookLink",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Facebook profile or page URL (e.g. https://facebook.com/yourbrand).",
        section: "Social",
        sortOrder: 100,
      },
    },
    {
      name: "TwitterLink",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Twitter / X profile URL (twitter.com or x.com).",
        section: "Social",
        sortOrder: 200,
      },
    },
    {
      name: "InstagramLink",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Instagram profile URL.",
        section: "Social",
        sortOrder: 300,
      },
    },
    {
      name: "YoutubeLink",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "YouTube channel URL.",
        section: "Social",
        sortOrder: 400,
      },
    },
    {
      name: "LinkedinLink",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "LinkedIn profile or company-page URL.",
        section: "Social",
        sortOrder: 500,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default socialFollowContentRecipe;
