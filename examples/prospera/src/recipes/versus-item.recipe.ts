import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `VersusItem` — the leaf datasource item for the
 * `versus-list@1` family. Recipe-only (no rendering of its own, like
 * `status-item@1`): the parent `versus-list` reads these via its
 * `Items` Treelist and renders each as a stacked row or a card.
 *
 * Deliberately un-opinionated so one template serves fixtures and
 * results (teams + score/kick-off), debates (speakers + motion),
 * product comparisons, and any two-party head-to-head.
 */
export const versusItemRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "versus-item@1",
  icon: componentIcons["versus-item@1"],
  name: "versus-item",
  displayName: "Versus Item",
  description:
    "Single two-party matchup row for the versus-list family: party A and party B (name + badge image), a center value (score, time, or short text), a status token (upcoming/live/finished), a meta line, a date label for grouping, and an optional link.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "PartyAName",
      shape: "text",
      default: {
        en: "Party A",
        ar: "الطرف أ",
        es: "Parte A",
        fr: "Partie A",
        de: "Partei A",
        da: "Part A",
        ja: "パーティーA",
        "zh-CN": "甲方",
        "zh-TW": "甲方",
        it: "Parte A",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "First party — a team, speaker, product, or candidate.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "PartyABadge",
      shape: "image",
      sitecore: {
        type: "image",
        hint: "First party badge / crest / logo / avatar.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "PartyBName",
      shape: "text",
      default: {
        en: "Party B",
        ar: "الطرف ب",
        es: "Parte B",
        fr: "Partie B",
        de: "Partei B",
        da: "Part B",
        ja: "パーティーB",
        "zh-CN": "乙方",
        "zh-TW": "乙方",
        it: "Parte B",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Second party — a team, speaker, product, or candidate.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "PartyBBadge",
      shape: "image",
      sitecore: {
        type: "image",
        hint: "Second party badge / crest / logo / avatar.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "CenterValue",
      shape: "text",
      default: "18:00",
      sitecore: {
        type: "single-line-text",
        hint: "Value between the parties — a score ('2 – 1'), a start time ('18:00'), or short status text ('TBD').",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "Status",
      shape: "enum",
      default: "upcoming",
      values: ["upcoming", "live", "finished"],
      sitecore: {
        type: "droplist",
        hint: "Lifecycle token driving the status badge. `live` renders with a pulsing dot.",
        section: "Content",
        sortOrder: 600,
      },
    },
    {
      name: "StatusLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional custom badge label (e.g. 'Full time', 'On air'). Defaults to the status name.",
        section: "Content",
        sortOrder: 700,
      },
    },
    {
      name: "Meta",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Meta line under the matchup — competition, venue, category, round.",
        section: "Content",
        sortOrder: 800,
      },
    },
    {
      name: "DateLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Date label used as the group heading when the parent groups by date, e.g. 'Saturday 14 June'.",
        section: "Content",
        sortOrder: 900,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional details link for the row (match centre, event page).",
        section: "Content",
        sortOrder: 1000,
      },
    },
  ],
  variants: [{ name: "Default" }],
} satisfies ComponentTemplateRecipe;

export default versusItemRecipe;
