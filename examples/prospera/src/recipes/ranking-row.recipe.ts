import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `RankingRow` — the leaf datasource item for the
 * `ranking-table@1` family. Recipe-only (no rendering of its own, like
 * `status-item@1`): the parent `ranking-table` reads these via its
 * `Rows` Treelist and renders each as a table row.
 *
 * Deliberately un-opinionated so one template serves league standings
 * (team + played/won/points), world rankings (entity + score),
 * leaderboards (player + total), and business tables (branch +
 * revenue). The six stat slots align with the parent's
 * `Stat1Label…Stat6Label` column headers — only labelled columns
 * render.
 */
export const rankingRowRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "ranking-row@1",
  icon: componentIcons["ranking-row@1"],
  name: "ranking-row",
  displayName: "Ranking Row",
  description:
    "Single ranked entity for the ranking-table family: rank, movement (up/down/steady + places), badge image, name, secondary label, up to six stat values, and an emphasised total.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Rank",
      shape: "integer",
      default: "1",
      sitecore: {
        type: "integer",
        required: true,
        hint: "Rank position, e.g. 1.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Movement",
      shape: "enum",
      default: "steady",
      values: ["up", "down", "steady"],
      sitecore: {
        type: "droplist",
        hint: "Movement versus the previous period. `up` renders green, `down` red, `steady` a neutral dash.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "MovementPlaces",
      shape: "integer",
      sitecore: {
        type: "integer",
        hint: "Places moved, shown next to the movement arrow (ignored for `steady`).",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Badge",
      shape: "image",
      sitecore: {
        type: "image",
        hint: "Small badge / crest / logo / avatar shown before the name.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Name",
      shape: "text",
      default: {
        en: "Entity name",
        ar: "اسم الكيان",
        es: "Nombre de la entidad",
        fr: "Nom de l'entité",
        de: "Name der Entität",
        da: "Enhedens navn",
        ja: "エンティティ名",
        "zh-CN": "实体名称",
        "zh-TW": "實體名稱",
        it: "Nome dell'entità",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "The ranked entity — a team, person, product, branch, or country.",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "SecondaryLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional qualifier under the name — a category, group, region, or confederation.",
        section: "Content",
        sortOrder: 600,
      },
    },
    {
      name: "Stat1",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Value for stat column 1 (renders only when the parent sets Stat1Label).",
        section: "Stats",
        sortOrder: 700,
      },
    },
    {
      name: "Stat2",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Value for stat column 2.",
        section: "Stats",
        sortOrder: 710,
      },
    },
    {
      name: "Stat3",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Value for stat column 3.",
        section: "Stats",
        sortOrder: 720,
      },
    },
    {
      name: "Stat4",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Value for stat column 4.",
        section: "Stats",
        sortOrder: 730,
      },
    },
    {
      name: "Stat5",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Value for stat column 5.",
        section: "Stats",
        sortOrder: 740,
      },
    },
    {
      name: "Stat6",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Value for stat column 6.",
        section: "Stats",
        sortOrder: 750,
      },
    },
    {
      name: "Total",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Emphasised total for the last column — points, score, revenue.",
        section: "Content",
        sortOrder: 800,
      },
    },
  ],
  variants: [{ name: "Default" }],
} satisfies ComponentTemplateRecipe;

export default rankingRowRecipe;
