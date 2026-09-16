import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  cardChromeParams,
  cardTitleLinkIconParam,
} from "./_card-chrome-params";

/**
 * Recipe for `PersonCard` — the leaf card rendering for the persons
 * family. Authors drop these into the `cards-persons-{*}` placeholder
 * exposed by `person-list-grid@1` and `person-carousel@1`
 * (composed mode).
 *
 * Variants map to the React function exports in `./person-card.tsx`:
 *
 *  - `Standard`   → `PersonCardDefault` (headshot on top, eyebrow, name, role, bio, CTA)
 *  - `ImageLed`   → `PersonCardImageTitleOnly` (headshot + name + role only — visually image-forward)
 *  - `CompactRow` → `PersonCardHorizontal` (headshot start, content end)
 *  - `Featured`   → `PersonCardDefault` in a prominent, larger-headline configuration
 *
 * In curated mode the person-card items themselves are the datasource
 * targets the parent person-list-grid/carousel's Treelist references.
 *
 * A "doctor" is just a flavor of person — the `Role` field carries the
 * specialty/title ("Cardiologist", "Engineering Manager", "Partner",
 * etc.). Keep the recipe generic.
 */
export const personCardRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "person-card@1",
  icon: componentIcons["person-card@1"],
  name: "person-card",
  displayName: "Person Card",
  description:
    "Single person card. Use for staff bios, doctor listings, team rosters, leadership grids, etc. Variants: Standard, ImageLed, CompactRow, Featured, Overlay (photo card with gradient scrim — name/role over the headshot).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "FullName",
      shape: "text",
      default: {
        en: "Unnamed person",
        ar: "شخص بدون اسم",
        es: "Persona sin nombre",
        fr: "Personne sans nom",
        de: "Unbenannte Person",
        da: "Unavngiven person",
        ja: "名前のない人物",
        "zh-CN": "未命名人员",
        "zh-TW": "未命名人員",
        it: "Persona senza nome",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: 'Full name (e.g. "Dr. Jane Patel").',
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Role",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: 'Job title, position, or specialty (e.g. "Cardiologist", "Engineering Manager", "Partner").',
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Bio",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Long-form bio narrative shown under the name and role.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: 'Small uppercase label above the name (e.g. "Cardiology Department", "Leadership Team").',
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "person",
      sitecore: {
        type: "image",
        hint: "Headshot photo displayed at the top (Standard/Featured) or start (CompactRow).",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "Email",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Contact email (optional).",
        section: "Contact",
        sortOrder: 100,
      },
    },
    {
      name: "Phone",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Contact phone (optional).",
        section: "Contact",
        sortOrder: 200,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Destination URL for the card — typically a person detail page. Authors set per-placement; falls back to the person item's URL.",
        section: "Content",
        sortOrder: 600,
      },
    },
  ],
  params: [
    ...cardChromeParams,
    cardTitleLinkIconParam,
    {
      name: "MediaAspect",
      shape: "enum",
      default: "3x4",
      sitecore: {
        enumHandle: "media-aspect@1",
        hint: "Aspect ratio of the absolute-fill headshot on the Overlay variant (16x9 / 4x5 / 3x4 / 1x1). Other variants pin their own aspect and ignore this.",
        section: "Style",
        sortOrder: 800,
      },
    },
  ],
  variants: [
    { name: "Standard" },
    { name: "ImageLed" },
    { name: "CompactRow" },
    { name: "Featured" },
    { name: "Overlay" },
  ],
  placedIn: ["cards-persons-{*}", "search-results-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "People" },
      { scope: "site", subfolder: "People" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default personCardRecipe;
