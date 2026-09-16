import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the SocialShare `Platforms` datasource
 * field — the allowlist of share targets a placement exposes. Each
 * value name matches the platform token the React component
 * dispatches on (`SocialPlatform`).
 *
 *   native      Web Share API trigger — opens the OS share sheet on
 *               supported browsers (mobile-first). Falls back silently
 *               on desktop / unsupported browsers.
 *   copy-link   Clipboard copy with a transient "Copied!" announcement.
 *   facebook    facebook.com/sharer — URL only; FB scrapes og: tags.
 *   x           twitter.com/intent — honours text / hashtags / via.
 *   linkedin    linkedin.com/sharing — URL only; LinkedIn scrapes
 *               og: tags.
 *   pinterest   pinterest.com/pin/create — requires og:image.
 *   reddit      reddit.com/submit — honours title.
 *   whatsapp    api.whatsapp.com/send — text + URL concatenated.
 *   telegram    t.me/share/url — honours title + URL.
 *   email       mailto: — opens the user's mail client.
 *
 * Referenced by SocialShare via
 * `sitecore.enumHandle: "social-platform@1"` on its `Platforms`
 * Treelist field. Authors multi-pick which platforms appear and in
 * what order. Adding a value here surfaces it everywhere that
 * picks from this enum automatically (no consumer-side change
 * needed) — needs scai ≥ 0.2.6 for `enumHandle` on `shape: "reference"`.
 */
export const socialPlatformEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "social-platform@1",
  name: "SocialPlatform",
  displayName: "Social Platform",
  description:
    "Share targets for SocialShare. Multi-pick via the Platforms Treelist on the datasource.",
  location: { scope: "site", folder: ["Social"] },
  values: [
    { name: "native", displayName: "Native (Web Share API)" },
    { name: "copy-link", displayName: "Copy Link" },
    { name: "facebook", displayName: "Facebook" },
    { name: "x", displayName: "X" },
    { name: "linkedin", displayName: "LinkedIn" },
    { name: "pinterest", displayName: "Pinterest" },
    { name: "reddit", displayName: "Reddit" },
    { name: "whatsapp", displayName: "WhatsApp" },
    { name: "telegram", displayName: "Telegram" },
    { name: "email", displayName: "Email" },
  ],
} satisfies EnumerationRecipe;

export default socialPlatformEnumRecipe;
