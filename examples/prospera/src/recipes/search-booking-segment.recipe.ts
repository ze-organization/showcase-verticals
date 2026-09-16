import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `SearchBookingSegment` — the leaf datasource item for the
 * `search-booking-bar@1` family. Recipe-only (no rendering of its own,
 * like `versus-item@1`): the parent `search-booking-bar` reads these
 * via its `Segments` Treelist and renders each as a labelled input
 * cell in the bar.
 */
export const searchBookingSegmentRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "search-booking-segment@1",
  icon: componentIcons["search-booking-segment@1"],
  name: "search-booking-segment",
  displayName: "Search Booking Segment",
  description:
    "Single input cell for the search-booking-bar family: a label, placeholder text, and an input type (text / select with chevron / date with calendar glyph). Presentational — the input is display-only.",
  section: { handle: "search-section@1" },
  fields: [
    {
      name: "Label",
      shape: "text",
      default: {
        en: "From",
        ar: "من",
        es: "Desde",
        fr: "De",
        de: "Von",
        da: "Fra",
        ja: "出発地",
        "zh-CN": "出发地",
        "zh-TW": "出發地",
        it: "Da",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Label above the input cell (accessible name in the Compact variant).",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Placeholder",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Placeholder text inside the input. Falls back to the label when blank.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "SegmentType",
      shape: "enum",
      default: "text",
      values: ["text", "select", "date"],
      sitecore: {
        type: "droplist",
        hint: "Input type — `select` adds a trailing chevron, `date` a calendar glyph.",
        section: "Content",
        sortOrder: 300,
      },
    },
  ],
  variants: [{ name: "Default" }],
} satisfies ComponentTemplateRecipe;

export default searchBookingSegmentRecipe;
