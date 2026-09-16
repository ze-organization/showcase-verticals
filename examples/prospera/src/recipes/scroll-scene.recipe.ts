import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `ScrollScene` component (./scroll-scene.tsx).
 *
 * One tall "scene" hosting several child renderings over a SHARED
 * background image, with scroll-driven color stops that re-tint the
 * scene (and therefore its children) as each child section scrolls
 * into view — the premium-brand story-scene pattern.
 *
 * The content placeholder (`scroll-scene-content-{*}`) is permissive —
 * any rendering allowed — mirroring the other layout hosts
 * (section-wrapper, column-splitter). The tint stops reference the
 * shared `color-scheme@1` / section-surface vocabulary; the image
 * treatment reuses the shared section-background axes
 * (BackgroundScrim / BackgroundPosition).
 */
export const scrollSceneRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "scroll-scene@1",
  icon: componentIcons["scroll-scene@1"],
  name: "scroll-scene",
  displayName: "Scroll Scene",
  description:
    "Tall layout scene with one shared background image and scroll-driven color stops that re-tint the scene per child section.",

  section: { handle: "layout-section@1" },

  fields: [
    {
      // The shared backdrop is the point of the component, so —
      // unlike section-wrapper's deliberately role-less opt-in
      // backdrop — this field carries the `hero` role: the
      // installer's image-defaults map substitutes the brand's hero
      // image, and the seed guarantees a media item materialises at
      // push time. Pipe convention: `<alt>|<src>`.
      name: "BackgroundImage",
      shape: "image",
      role: "hero",
      default:
        "Scene background|/theme-photos/hub-01.jpg",
      sitecore: {
        type: "image",
        hint: "The scene's shared full-bleed background image — persists behind every child section while the content scrolls. Painted with the BackgroundScrim treatment for legibility.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      // Canvas-only label: shown in the Pages editing chrome so
      // authors can tell scenes apart in the tree / canvas. The
      // component deliberately never renders it on the live page.
      name: "Title",
      shape: "text",
      default: "Scroll scene",
      sitecore: {
        type: "single-line-text",
        hint: "Editing-mode label for this scene (shown in the editing canvas only — never rendered on the page).",
        section: "Content",
        sortOrder: 200,
      },
    },
  ],

  variants: [{ name: "Default" }],

  params: [
    {
      name: "ColorStops",
      shape: "text",
      // Seed so a freshly dropped scene demonstrates the effect
      // immediately; authors retune per placement.
      default: "neutral,primary,accent",
      sitecore: {
        type: "single-line-text",
        hint: 'Comma-separated color-scheme tokens, ONE PER direct child section in order (e.g. "neutral,accent,primary,neutral"). Valid tokens: none, white, black, neutral, primary, primary-gradient, secondary, secondary-gradient, tertiary, accent, accent-2, accent-3, info, success, warning, destructive. As each child scrolls into view the scene cross-fades to its stop; an invalid or missing token leaves that section untinted.',
        section: "Behavior",
        sortOrder: 100,
      },
    },
    {
      name: "TransitionMs",
      shape: "integer",
      default: "600",
      sitecore: {
        type: "integer",
        hint: "Cross-fade duration between color stops, in milliseconds. Default 600. Ignored when the visitor prefers reduced motion (stops snap instead).",
        section: "Behavior",
        sortOrder: 110,
      },
    },
    {
      // ON by default (the persistent shared backdrop IS the
      // component), so the boolean carries an explicit true Standard
      // Value — the omit-when-off convention applies to OFF defaults
      // only.
      name: "StickyBackground",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Pin the background image to the viewport (sticky) while the sections scroll over it — the persistent-backdrop treatment (default on). Uncheck to stretch the image across the whole scene and let it scroll away with the content.",
        section: "Behavior",
        sortOrder: 120,
      },
    },
    {
      // Shared section-background vocabulary — pairs with the
      // BackgroundImage datasource field (same axes as
      // section-wrapper / the photo-banner family).
      name: "BackgroundScrim",
      shape: "enum",
      default: "dark",
      sitecore: {
        enumHandle: "background-scrim@1",
        hint: "Scrim over the BackgroundImage. `dark` (default) dims the photo and flips the scene text light; `light` washes it and keeps text dark; `none` leaves the image untreated.",
        section: "Background",
        sortOrder: 200,
      },
    },
    {
      name: "BackgroundPosition",
      shape: "enum",
      default: "center",
      sitecore: {
        enumHandle: "background-position@1",
        hint: "Crop anchor of the BackgroundImage (`object-position`) — `center` / `top` / `bottom`.",
        section: "Background",
        sortOrder: 210,
      },
    },
  ],

  dynamicPlaceholders: true,
  // Permissive: any rendering can drop into the scene. Each DIRECT
  // child of this slot is one "section" of the scene — the Nth child
  // pairs with the Nth ColorStops token.
  placeholders: [{ key: "scroll-scene-content-{*}" }],

  placedIn: ["headless-main-{*}"],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Scenes" },
      { scope: "site", subfolder: "Site Shared Layout/Scenes" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default scrollSceneRecipe;
