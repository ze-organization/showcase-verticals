/**
 * Shared video-playback resolution for the `video-playback@1` axis —
 * the ONE knob for how an authored video starts:
 *
 *   - `click-to-play` — (default) poster + play affordance; the video
 *     loads AND starts on click.
 *   - `autoplay`      — muted inline background playback on load.
 *
 * Consumers: `hero@1` today; `promo@1` (and any other video-bearing
 * component) should adopt the same handle + helpers.
 *
 * Lives in `src/lib/registry/` (leaf) so both the component tier and
 * blocks can share it — it deliberately knows nothing about field
 * shapes (extract poster URLs at the call site, e.g. via
 * `getImageSrc`).
 */

/** Allowed values on the shared `video-playback@1` Sitecore enum. */
export type VideoPlaybackValue = "click-to-play" | "autoplay";

const VIDEO_PLAYBACK_VALUES: ReadonlySet<VideoPlaybackValue> = new Set([
  "click-to-play",
  "autoplay",
]);

/**
 * Parse a raw `video-playback@1` param value. Empty / unknown values
 * coerce to the fallback (`click-to-play` unless overridden).
 */
export function parseVideoPlayback(
  value: string | undefined,
  fallback: VideoPlaybackValue = "click-to-play",
): VideoPlaybackValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return VIDEO_PLAYBACK_VALUES.has(normalized as VideoPlaybackValue)
    ? (normalized as VideoPlaybackValue)
    : fallback;
}

export interface ResolveVideoPlaybackInput {
  /** The `MediaPlayback` enum param (`video-playback@1`). Wins when set. */
  playback?: string;
  /** Default when nothing is stored. `click-to-play` unless overridden. */
  fallback?: VideoPlaybackValue;
}

/**
 * Resolve the playback mode: an explicit, valid `MediaPlayback` enum
 * value wins; anything else falls back (`click-to-play` by default).
 */
export function resolveVideoPlayback({
  playback,
  fallback = "click-to-play",
}: ResolveVideoPlaybackInput): VideoPlaybackValue {
  if (playback) {
    const normalized = playback.trim().toLowerCase();
    if (VIDEO_PLAYBACK_VALUES.has(normalized as VideoPlaybackValue)) {
      return normalized as VideoPlaybackValue;
    }
  }
  return fallback;
}

/**
 * Structural mirror of VideoBlock's `behaviorOptions.load` /
 * `behaviorOptions.playback` bags (declared here so the leaf lib
 * doesn't import the blocks tier — the shapes are asserted structurally
 * compatible by the consuming component's types).
 */
export interface VideoPlaybackBehavior {
  load?: {
    enabled: boolean;
    label?: string;
  };
  playback: {
    controls: boolean;
    autoPlay: boolean;
    muted: boolean;
    loop: boolean;
    playsInline: boolean;
    poster?: string;
    preload: "none" | "metadata" | "auto";
  };
}

export interface BuildVideoPlaybackBehaviorInput {
  playback: VideoPlaybackValue;
  /** `prefers-reduced-motion` — suppresses autoplay, surfaces controls. */
  reducedMotion?: boolean;
  /**
   * Ambient/background treatment (e.g. a full-bleed hero backdrop):
   * hides controls while autoplaying. Click-to-play always shows
   * controls once running — the viewer asked for the video.
   */
  ambient?: boolean;
  /**
   * Mute override for click-to-play (defaults false — the viewer
   * clicked, they expect sound). `autoplay` is ALWAYS muted; browsers
   * block unmuted autoplay and the axis is defined as muted-inline.
   */
  muted?: boolean;
  /** Loop override. Defaults: autoplay loops (ambient backdrop), click-to-play doesn't. */
  loop?: boolean;
  /**
   * Poster URL — the authored image. Click-to-play renders it as the
   * clickable thumbnail; autoplay passes it through as the native
   * loading placeholder.
   */
  poster?: string;
}

/**
 * Build the VideoBlock-compatible behavior bag for a playback mode.
 * The click-to-play gate itself (poster + play button + "start on
 * click") is VideoBlock's job — this helper only encodes the axis
 * semantics both hero and promo must agree on.
 */
export function buildVideoPlaybackBehavior({
  playback,
  reducedMotion = false,
  ambient = false,
  muted,
  loop,
  poster,
}: BuildVideoPlaybackBehaviorInput): VideoPlaybackBehavior {
  if (playback === "autoplay") {
    const autoPlay = !reducedMotion;
    return {
      playback: {
        // Reduced-motion viewers keep controls so they can opt in.
        controls: !ambient || reducedMotion,
        autoPlay,
        muted: true,
        loop: loop ?? true,
        playsInline: true,
        poster,
        preload: "auto",
      },
    };
  }
  return {
    load: { enabled: true, label: "Play video" },
    playback: {
      controls: true,
      // Applies once the viewer clicks through the poster gate — the
      // gesture makes (optionally unmuted) playback legal.
      autoPlay: true,
      muted: muted ?? false,
      loop: loop ?? false,
      playsInline: true,
      poster,
      preload: "metadata",
    },
  };
}
