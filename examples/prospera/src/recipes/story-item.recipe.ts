import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `StoryItem` — the leaf datasource item for the
 * `stories-rail@1` family. Recipe-only (no rendering of its own, like
 * `logo-item@1` / `quick-link-tile@1`): the parent `stories-rail`
 * reads these via its `Items` Treelist and renders each as a circular
 * ring-framed thumbnail with a short label.
 */
export const storyItemRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "story-item@1",
  icon: componentIcons["story-item@1"],
  name: "story-item",
  displayName: "Story Item",
  description:
    "Single story entry for the stories-rail family: a circular thumbnail image, a short label (score, name, topic), and an optional link the whole item follows.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Image",
      shape: "image",
      role: "content",
      sitecore: {
        type: "image",
        required: true,
        hint: "Thumbnail image. Cropped to a circle — center the subject; portraits and square crops render best.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Story",
        ar: "قصة",
        es: "Historia",
        fr: "Story",
        de: "Story",
        da: "Historie",
        ja: "ストーリー",
        "zh-CN": "故事",
        "zh-TW": "故事",
        it: "Storia",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Short label under the thumbnail — a score ('FRA 2-0 ESP'), a name, or a topic. Clamped to two lines.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional destination the whole item links to (story viewer, highlight reel, profile).",
        section: "Content",
        sortOrder: 300,
      },
    },
  ],
  variants: [{ name: "Default" }],
} satisfies ComponentTemplateRecipe;

export default storyItemRecipe;
