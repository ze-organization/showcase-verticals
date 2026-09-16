import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `VideoPlayback` rendering parameter —
 * ONE axis for how an authored video starts, replacing the old
 * overlapping `MediaAutoplay` + `MediaClickToLoad` checkbox pair.
 * Lands at `<enumerationsRoot>/Components/Video/VideoPlayback`
 * per-site.
 *
 * - `click-to-play` (default) — the media box shows the Image field as
 *   a poster/thumbnail with a play button; the video loads and starts
 *   only on click (bandwidth-friendly, sound allowed since the click
 *   is a user gesture).
 * - `autoplay` — the video starts inline immediately, ALWAYS muted
 *   (browsers block unmuted autoplay) and looped by default — the
 *   ambient background-band treatment. `prefers-reduced-motion`
 *   downgrades it to `click-to-play`.
 */
export const videoPlaybackEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "video-playback@1",
  name: "VideoPlayback",
  displayName: "Video Playback",
  description:
    "How an authored video starts. `click-to-play` (default) shows the Image field as a poster with a play button and defers loading until click; `autoplay` starts the video inline immediately — always muted (browser policy), looped by default. Reduced-motion users always get click-to-play.",
  location: { scope: "site", folder: ["Components", "Video"] },
  default: "click-to-play",
  values: [
    {
      name: "click-to-play",
      displayName: "Click to play (poster + play button)",
      description:
        "Image field renders as the video's poster/thumbnail with a play button; the video loads and starts on click.",
    },
    {
      name: "autoplay",
      displayName: "Autoplay (muted, ambient)",
      description:
        "Video starts inline immediately — always muted (browsers block unmuted autoplay), looped by default.",
    },
  ],
} satisfies EnumerationRecipe;

export default videoPlaybackEnumRecipe;
