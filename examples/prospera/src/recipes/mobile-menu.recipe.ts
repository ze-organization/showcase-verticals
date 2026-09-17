import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `MobileMenu` component (./mobile-menu.tsx).
 *
 * **Three rendering variants for three mobile UX patterns:**
 *
 *   Drawer       slides in from one inline edge (radix Sheet,
 *                RTL-aware). Which edge is the `DrawerSide` PARAM, not
 *                part of the variant — authors flip it per placement.
 *                Best for deep nav hierarchies needing vertical scroll
 *                room.
 *   Overlay      full-screen modal that covers all background chrome
 *                (radix Dialog). Best when the menu should feel like a
 *                dedicated route.
 *   BottomSheet  slides up from the bottom with a drag affordance
 *                (Vaul Drawer primitive). Best for thumb-reachable
 *                nav on mobile, or sites already using bottom-sheet
 *                patterns elsewhere.
 *
 * Each variant ships the hamburger trigger button built in and exposes
 * a `mobile-menu-{*}` dynamic placeholder where authors compose the
 * menu content (typically a vertical stack of LinkLists, possibly with
 * an embedded MainNav for the same items the desktop nav shows).
 *
 * **Placed in the Header shell's `header-mobile-{*}` slot.** The Header
 * shell's responsive CSS hides MobileMenu above the `md` breakpoint
 * and hides the desktop nav cluster below it, so authors can ship one
 * Header partial design that handles both viewports.
 */
export const mobileMenuRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "mobile-menu@1",
  icon: componentIcons["mobile-menu@1"],
  name: "mobile-menu",
  displayName: "Mobile Menu",
  description:
    "Hamburger-triggered mobile navigation. Three variants for three UX patterns — Drawer (slides in from an inline edge; the edge itself is the DrawerSide param), Overlay (full-screen), BottomSheet — with a panel placeholder for authored content.",

  section: { handle: "layout-section@1" },

  fields: [
    {
      // No default: leave blank for NO visible heading (most placements
      // put the logo in the mobile header). When blank the panel renders
      // no on-screen title and a generic screen-reader-only name labels
      // the nav region; set a value to show a visible heading. Removing
      // the former localized "Navigation" default is deliberate — it kept
      // an untranslated visible heading on every drawer.
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional visible heading at the top of the open menu panel. Leave blank (default) to render no visible title — a generic screen-reader-only name still labels the nav region. Set a value to show a heading; it also names the nav region for screen readers.",
        sortOrder: 100,
      },
    },
    {
      name: "TriggerLabel",
      shape: "text",
      default: {
        en: "Open menu",
        ar: "فتح القائمة",
        es: "Abrir menú",
        fr: "Ouvrir le menu",
        de: "Menü öffnen",
        da: "Åbn menu",
        ja: "メニューを開く",
        "zh-CN": "打开菜单",
        "zh-TW": "開啟選單",
        it: "Apri menu",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label for the hamburger trigger button. Screen-reader-only by default; turn on ShowTriggerLabel to render it visibly beside the icon (then keep it short — 'Menu').",
        sortOrder: 200,
      },
    },
  ],

  params: [
    {
      // Trigger glyph. `menu` (the default) renders the theme-swappable
      // LibraryIcon hamburger; any other icon-name@1 value renders that
      // vocabulary glyph instead. `none` clears back to the hamburger.
      name: "IconName",
      shape: "enum",
      default: "menu",
      sitecore: {
        enumHandle: "icon-name@1",
        hint: "Glyph on the trigger button. `menu` (default) is the theme's hamburger icon; pick another named icon to replace it, or `none` to clear back to the hamburger.",
        sortOrder: 300,
      },
    },
    {
      // Renders the TriggerLabel VISIBLY beside the trigger icon (off =
      // the classic icon-only hamburger, label SR-only). Turn on for
      // service/utility mastheads that keep a labeled "Menu" trigger on
      // desktop — pairs with placing this rendering in the header
      // shell's always-visible header-start slot.
      name: "ShowTriggerLabel",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the TriggerLabel text next to the trigger icon (labeled 'Menu' button). Off (default) keeps the icon-only hamburger with the label screen-reader-only.",
        sortOrder: 400,
      },
    },
    {
      // Viewport gate on the whole rendering. `all` (default) keeps it
      // visible at every breakpoint; `mobile-only` hides it at `lg`+
      // (lg:hidden) so the hamburger shows only on small viewports and a
      // desktop nav strip in a sibling slot can take over above `lg`.
      // A hamburger is almost always the first/last thing in a row, never
      // stacked — this lets one placement serve mobile without doubling
      // up on desktop.
      name: "VisibleAt",
      shape: "enum",
      default: "all",
      sitecore: {
        enumHandle: "breakpoint-visibility@1",
        hint: "When the hamburger is visible. `all` (default) shows it at every breakpoint; `mobile-only` hides it at the `lg` breakpoint and up (lg:hidden) so it shows only on small viewports.",
        sortOrder: 410,
      },
    },
    {
      // Which edge the Drawer panel enters from. Previously hardcoded to
      // the inline-start edge inside the Drawer variant, which made a
      // per-placement presentation choice into a property of the
      // rendering. Drawer / Overlay / BottomSheet stay the variant axis
      // (three different UX patterns); the edge composes with Drawer.
      name: "DrawerSide",
      shape: "enum",
      default: "inline-start",
      sitecore: {
        enumHandle: "drawer-side@1",
        hint: "Which edge the Drawer panel slides in from. `inline-start` (default) matches the historical behaviour; `inline-end` slides from the opposite edge. Logical, so it flips under RTL. Drawer variant only — Overlay is full-screen and BottomSheet always rises from the bottom, so both ignore it.",
        sortOrder: 420,
      },
    },
    {
      name: "Padding",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "panel-padding@1",
        hint: "Inner inset of the open panel, all sides. `md` matches the classic drawer inset; `none` lets composed content run edge-to-edge.",
        sortOrder: 500,
      },
    },
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Panel surface fill. `none` (default) keeps the theme's popover background; schemes paint the shared section-surface tint.",
        sortOrder: 510,
      },
    },
    {
      name: "BackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "Subtle = soft `-background` tint; bold = pure brand color with inverted text (interior links re-tone automatically).",
        sortOrder: 520,
      },
    },
    {
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable author-friendly handle for analytics (e.g. 'global-mobile-menu'). Defaults to the rendering id when blank.",
        sortOrder: 900,
      },
    },
    {
      name: "InstanceScope",
      shape: "enum",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Whether this instance is reused site-wide or unique per page. Drives personalization partition keys.",
        sortOrder: 910,
      },
    },
    {
      name: "TrackEvents",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Emit CDP events for drawer open/close. Off by default.",
        sortOrder: 920,
      },
    },
  ],

  variants: [{ name: "Drawer" }, { name: "Overlay" }, { name: "BottomSheet" }],

  // `closed` dropped during the taxonomy migration — it's the
  // mirror of `opened` and adds no signal the dashboard couldn't
  // derive (an open without a close = session ended with menu open;
  // not actionable). `opened` survives because OOTB Sitecore CDP
  // can't observe nav widget state.
  events: [
    {
      name: "opened",
      type: "mobile-menu.opened",
      description:
        "Fires when the mobile menu opens. Meta carries the variant (Drawer / Overlay / BottomSheet).",
      action: "navigate",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
  ],

  // Single panel placeholder. SDK substitutes the rendering's
  // DynamicPlaceholderId for {*} at render time so different
  // placements get scoped names.
  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "mobile-menu-{*}",
    },
  ],
  placedIn: ["header-mobile-{*}"],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      // Nested leaf per-component — main-nav and mobile-menu both claim
      // a Navigation parent, so the leaf disambiguates the per-recipe
      // data-folder template (see main-nav.recipe.ts for rationale).
      { scope: "page", subfolder: "Navigation/Mobile Menu" },
      { scope: "site", subfolder: "Navigation/Mobile Menu" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default mobileMenuRecipe;
