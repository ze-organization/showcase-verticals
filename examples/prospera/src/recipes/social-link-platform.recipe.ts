import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing `SocialLinks`' per-item `Platform` field —
 * which social network a footer profile link points at. Each value
 * name matches the platform token the React component dispatches on
 * (`SocialLinkPlatform` in `social-links.tsx`).
 *
 * This is the LINK-OUT analogue of `social-platform@1` (which backs
 * `social-share`'s SHARE targets). The two enums are intentionally
 * separate: share targets (native / copy-link / email / whatsapp …)
 * are page-relative actions, whereas these are brand-owned profile
 * destinations shown in a footer / contact block.
 *
 *   facebook    facebook.com/<brand>
 *   instagram   instagram.com/<brand>
 *   x           x.com/<brand> (formerly Twitter)
 *   linkedin    linkedin.com/company/<brand>
 *   youtube     youtube.com/@<brand>
 *   tiktok      tiktok.com/@<brand>
 *   pinterest   pinterest.com/<brand>
 *   threads     threads.net/@<brand>
 *   reddit      reddit.com/r/<brand>
 *   github      github.com/<brand>
 *
 * Referenced by a `social-link-item@1` child template's `Platform`
 * droplink field. Adding a value here surfaces it on the authoring
 * picker automatically; the React component renders react-share's
 * brand icon where one exists (facebook / x / linkedin / pinterest /
 * reddit) and a FontAwesome brand glyph otherwise (instagram /
 * youtube / tiktok / threads / github).
 */
export const socialLinkPlatformEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "social-link-platform@1",
  name: "SocialLinkPlatform",
  displayName: "Social Link Platform",
  description:
    "Brand social-profile destinations for SocialLinks. Picked per item on the Links Treelist; each maps to an outbound link to the brand's own profile on that network.",
  location: { scope: "site", folder: ["Social"] },
  values: [
    { name: "facebook", displayName: "Facebook" },
    { name: "instagram", displayName: "Instagram" },
    { name: "x", displayName: "X" },
    { name: "linkedin", displayName: "LinkedIn" },
    { name: "youtube", displayName: "YouTube" },
    { name: "tiktok", displayName: "TikTok" },
    { name: "pinterest", displayName: "Pinterest" },
    { name: "threads", displayName: "Threads" },
    { name: "reddit", displayName: "Reddit" },
    { name: "github", displayName: "GitHub" },
    { name: "bluesky", displayName: "Bluesky" },
    { name: "mastodon", displayName: "Mastodon" },
    { name: "whatsapp", displayName: "WhatsApp" },
    { name: "telegram", displayName: "Telegram" },
    { name: "snapchat", displayName: "Snapchat" },
    { name: "vimeo", displayName: "Vimeo" },
    { name: "twitch", displayName: "Twitch" },
    { name: "discord", displayName: "Discord" },
    { name: "wechat", displayName: "WeChat" },
  ],
} satisfies EnumerationRecipe;

export default socialLinkPlatformEnumRecipe;
