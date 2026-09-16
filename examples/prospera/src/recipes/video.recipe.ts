import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `Video` component (./video.tsx).
 *
 * A standalone video block — YouTube/Vimeo embed or native HTML5 video
 * with an optional title, caption, poster, and captions track, plus the
 * full playback control surface as rendering parameters. The React
 * component reads these params (`MediaControls` / `MediaAutoplay` / …)
 * and threads them into `VideoBlock`.
 */
export const videoRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "video@1",
  icon: componentIcons["video@1"],
  name: "video",
  displayName: "Video",
  description:
    "Video block — YouTube/Vimeo embed or native HTML5 video with optional title, caption, poster, and captions track, plus playback controls (controls / autoplay / muted / loop / plays-inline / preload / click-to-load).",

  section: { handle: "cards-and-lists-section@1" },

  fields: [
    {
      name: "VideoUrl",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "YouTube/Vimeo embed URL or a direct video file URL.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "ThumbnailUrl",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional poster/thumbnail image URL. Used as the native `<video>` poster and the click-to-load preview image.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional heading shown above the player.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Caption",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Optional caption shown below the player.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "CaptionFileUrl",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional .vtt captions/subtitles track URL (native video only).",
        section: "Content",
        sortOrder: 500,
      },
    },
  ],

  params: [
    {
      name: "MediaControls",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Show the native player controls. On by default.",
        section: "Playback",
        sortOrder: 100,
      },
    },
    {
      name: "MediaAutoplay",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Auto-play on load. Forces muted (browsers block unmuted autoplay) and honors `prefers-reduced-motion`.",
        section: "Playback",
        sortOrder: 110,
      },
    },
    {
      name: "MediaMuted",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Mute audio. Required for autoplay in most browsers.",
        section: "Playback",
        sortOrder: 120,
      },
    },
    {
      name: "MediaLoop",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Loop playback.",
        section: "Playback",
        sortOrder: 130,
      },
    },
    {
      name: "MediaPlaysInline",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Play inline on mobile instead of going fullscreen.",
        section: "Playback",
        sortOrder: 140,
      },
    },
    {
      name: "MediaPreload",
      shape: "enum",
      default: "metadata",
      sitecore: {
        enumHandle: "media-preload@1",
        hint: "Native video preload strategy — `none`, `metadata` (default), or `auto`.",
        section: "Playback",
        sortOrder: 150,
      },
    },
    {
      name: "ClickToLoad",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Defer loading the player behind a click — saves bandwidth on first paint.",
        section: "Playback",
        sortOrder: 160,
      },
    },
  ],

  variants: [{ name: "Default" }],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Videos" },
      { scope: "site", subfolder: "Videos" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default videoRecipe;
