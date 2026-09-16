import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  cardChromeParams,
  cardTitleLinkIconParam,
} from "./_card-chrome-params";

/**
 * Recipe for `DestinationCard` — the leaf card rendering for the
 * destinations family. Authors drop these into the
 * `cards-destinations-{*}` placeholder exposed by
 * `destinations-list-grid@1` and `destinations-carousel@1` (composed
 * mode).
 *
 * Variants `Full`, `Compact`, `Essential`, `Hero`, `Highlight`, `Tile`,
 * `ListingHorizontal`, and `ListingHorizontalComprehensive` map to the
 * eight `DestinationCard` React function exports — different DOM
 * topology, so the variant boundary captures real composition
 * differences (see [[feedback-variant-vs-parameter]]).
 *
 * `Activities` and `Highlights` are multi-line tag fields preserved as
 * extras on the flat item so search-mode faceting can read them off
 * without re-querying.
 *
 * In curated mode the destination-card items themselves are the
 * datasource targets the parent destinations-list-grid/carousel's
 * Treelist references.
 */
export const destinationCardRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "destination-card@1",
  icon: componentIcons["destination-card@1"],
  name: "destination-card",
  displayName: "Destination Card",
  description:
    "Single destination card. Variants: Full (full metadata), Compact (condensed), Essential (image + CTA), Hero (overlay title), Highlight (outlined), Tile (image-dominant), ListingHorizontal, ListingHorizontalComprehensive.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Bali, Indonesia",
        ar: "بالي، إندونيسيا",
        es: "Bali, Indonesia",
        fr: "Bali, Indonésie",
        de: "Bali, Indonesien",
        da: "Bali, Indonesien",
        ja: "インドネシア・バリ島",
        "zh-CN": "印度尼西亚巴厘岛",
        "zh-TW": "印尼峇里島",
        it: "Bali, Indonesia",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Destination name.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Short description for the destination card.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "content",
      sitecore: {
        type: "image",
        hint: "Hero image for the card.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Destination page link.",
        section: "Action",
        sortOrder: 100,
      },
    },
    {
      name: "StartingPrice",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: 'Starting-price label (e.g. "from $1,299"). Surfaced as a badge when the parent rendering\'s CardStyle is `with-price`.',
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Label",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: 'Card eyebrow — a short kicker above the title (e.g. "Escorted tour"). Surfaced by the Full and Compact variants.',
        section: "Content",
        sortOrder: 150,
      },
    },
    {
      name: "Country",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Country the destination sits in. Shown as a metadata callout by Full / Compact and beside the title on Essential / Tile.",
        section: "Content",
        sortOrder: 610,
      },
    },
    {
      name: "Continent",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Continent the destination sits in. Metadata callout on Full / Compact; also preserved as a facet for search mode.",
        section: "Content",
        sortOrder: 620,
      },
    },
    {
      name: "TripDuration",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: 'Typical trip length as authored copy (e.g. "7 nights"). Metadata callout on Full / Compact.',
        section: "Content",
        sortOrder: 630,
      },
    },
    {
      name: "TripPeriods",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: 'When the trip runs — best season or departure window (e.g. "May–Sep"). Metadata callout on Full / Compact.',
        section: "Content",
        sortOrder: 640,
      },
    },
    {
      name: "Temperatures",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: 'Typical temperature range as authored copy (e.g. "18–27°C"). Metadata callout on Full / Compact.',
        section: "Content",
        sortOrder: 650,
      },
    },
    {
      name: "Rating",
      shape: "number",
      sitecore: {
        type: "number",
        hint: "Star rating from 0 to 5. Surfaced by ListingHorizontalComprehensive; ignored by variants with no rating row.",
        section: "Content",
        sortOrder: 660,
      },
    },
    {
      name: "NumberOfReviews",
      shape: "number",
      sitecore: {
        type: "number",
        hint: "Review count rendered beside the star rating. Ignored when Rating is unset.",
        section: "Content",
        sortOrder: 670,
      },
    },
    {
      name: "Activities",
      shape: "text",
      multiple: true,
      sitecore: {
        type: "multi-line-text",
        hint: "Activity tags, one per line. Surfaced as chips and preserved as facets for search mode.",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "Highlights",
      shape: "text",
      multiple: true,
      sitecore: {
        type: "multi-line-text",
        hint: "Highlight tags, one per line. Surfaced as chips and preserved as facets for search mode.",
        section: "Content",
        sortOrder: 600,
      },
    },
  ],
  variants: [
    { name: "Full" },
    { name: "Compact" },
    { name: "Essential" },
    { name: "Hero" },
    { name: "Highlight" },
    { name: "Tile" },
    { name: "ListingHorizontal" },
    { name: "ListingHorizontalComprehensive" },
  ],
  params: [...cardChromeParams, cardTitleLinkIconParam],
  placedIn: ["cards-destinations-{*}", "search-results-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Destinations" },
      { scope: "site", subfolder: "Destinations" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default destinationCardRecipe;
