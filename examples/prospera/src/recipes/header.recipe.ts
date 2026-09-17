import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `Header` component (./header.tsx).
 *
 * The header is a LAYOUT SHELL — placeholder-composed chrome, not a
 * field form:
 *
 * A pure-placeholder shell — no datasource fields consumed; authors
 * compose every affordance (logo, main-nav, utility triggers, mobile
 * menu) into the slots below. One VARIANT per arrangement:
 *
 *   Standard       — start / nav / end bar. No announcement or
 *                    unused utility drop zones.
 *   TwoTier        — slim utility strip on its own tinted top band with
 *                    the brand + nav bar below; the two rows read as
 *                    distinct (populate the utility-start/end slots).
 *   CenteredStack  — brand row centered, nav on a bordered row below —
 *                    the editorial masthead.
 *   CenteredInline — single-row centered-logo masthead: menu one side,
 *                    logo centered, actions the other. `MenuPlacement`
 *                    picks the menu side.
 *   Overlay        — floats transparently over the page's first section,
 *                    light-on-dark. Pair with a full-bleed hero as the
 *                    first section; ignores ColorScheme/BackgroundIntensity
 *                    and Sticky.
 *
 * These were values of a `BarLayout` param until the arrangement moved
 * to the variant axis where authors actually pick it.
 *
 * Header compositions (brand + nav, two-tier utility strip, centered
 * masthead, utility/service chrome, transparent overlay) are STOCK
 * EXPERIENCES — partial designs that compose existing renderings into
 * the shell's placeholders: `header-brand-nav@1`, `header-two-tier@1`,
 * `header-centered-logo@1`, `header-utility-bar@1`,
 * `header-transparent-overlay@1` (see `experiences/partial-designs/`).
 * Author new headers by composing into a shell variant (or copying a
 * stock experience).
 *
 * `Default` is the only variant, and the shell consumes NO datasource
 * fields — every affordance is a rendering placed into a slot.
 *
 * **Default's four placeholders** (plus TwoTier utility slots):
 *
 *   header-start-{*}          always visible (logo slot)
 *   header-nav-{*}            desktop only (main nav strip)
 *   header-end-{*}            desktop only (right cluster)
 *   header-mobile-{*}         mobile only (mobile-menu renderings)
 *   header-utility-start-{*}  TwoTier utility strip (left)
 *   header-utility-end-{*}    TwoTier utility strip (right)
 *
 * `ColorScheme` / `BackgroundIntensity` params follow the shared
 * section-surface vocabulary and tint the shell's bar (`default` keeps
 * the classic page-surface bar); the overlay layout ignores them (its
 * surface is transparent by design).
 */
export const headerRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "header@1",
  icon: componentIcons["header@1"],
  name: "header",
  displayName: "Header",
  description:
    "Site header layout shell — a pure-placeholder shell with start, nav, end, and mobile slots and no datasource fields. TwoTier also exposes utility-start/end for the tinted utility strip. Pick the arrangement by VARIANT: Standard (start/nav/end bar), TwoTier (slim utility strip on its own tinted top band with the brand + nav bar below), CenteredStack (brand row centered, nav on a bordered row below), CenteredInline (single-row centered-logo masthead — menu one side, logo centered, actions the other; MenuPlacement picks the menu side), Overlay (floats transparently over the page's first section). Compose content into the slots — typically via the stock header experiences (header-brand-nav, header-two-tier, header-centered-logo, header-utility-bar, header-transparent-overlay).",

  section: { handle: "layout-section@1" },

  // One variant per slot arrangement. These used to be values of a
  // `BarLayout` param on a single `Default` variant — but a
  // discriminator param hides the arrangement from the rendering list
  // where authors actually choose it, which is exactly what the
  // rendering-variant convention forbids. `Default` stays exported in
  // the component (aliasing Standard) so stored `variant: "Default"`
  // content keeps resolving, but it is not offered as a choice.
  variants: [
    { name: "Standard" },
    { name: "TwoTier" },
    { name: "CenteredStack" },
    { name: "CenteredInline" },
    { name: "Overlay" },
  ],

  params: [
    {
      // `CenteredInline` variant only: which inline side
      // the primary nav / menu cluster (the header-nav slot on desktop,
      // header-mobile on mobile) occupies; the header-end actions cluster
      // takes the opposite side. Other layouts ignore it.
      name: "MenuPlacement",
      shape: "enum",
      default: "inline-start",
      sitecore: {
        enumHandle: "menu-placement@1",
        hint: "`centered-inline` layout only: which inline side the primary nav / menu sits on. `inline-start` (default) is menu-start / actions-end; `inline-end` swaps them. Ignored by the other bar layouts.",
        sortOrder: 60,
      },
    },
    {
      // Which side the `header-mobile-{*}` slot (the hamburger) sits on.
      // The shell used to render it as the row's last child
      // unconditionally, pinning the trigger to the inline-end with no
      // author control. Standard / TwoTier / Overlay / CenteredStack read
      // it; CenteredInline ignores it because there the trigger rides the
      // menu cluster and MenuPlacement already picks that cluster's side.
      name: "MobilePlacement",
      shape: "enum",
      default: "inline-end",
      sitecore: {
        enumHandle: "mobile-placement@1",
        hint: "Which inline side the mobile hamburger sits on. `inline-end` (default) trails the row — the historical behaviour; `inline-start` leads it, ahead of the brand. Logical, so it flips under RTL. Ignored by the CenteredInline arrangement, where the trigger follows MenuPlacement instead.",
        sortOrder: 65,
      },
    },
    {
      // Pin the header to the top of the viewport as
      // the page scrolls (CSS `position: sticky`). Off by default keeps the
      // header in normal flow. The pinned bar keeps its opaque surface (page
      // `bg-background` or a bold ColorScheme fill) so content scrolls
      // underneath rather than showing through. Boolean params omit
      // `default` — an unchecked checkbox is false per project convention.
      name: "Sticky",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Pin the header to the top of the viewport as the page scrolls (CSS `position: sticky`). Off keeps the header in normal flow. Ignored by the overlay layout (already floats).",
        sortOrder: 75,
      },
    },
    {
      // Shared section-surface vocabulary — same axis as Footer /
      // Container / SectionWrapper. `default` keeps the classic
      // page-surface header bar. The overlay layout ignores both.
      name: "ColorScheme",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Header bar fill. `default` keeps the page surface; other schemes apply the matching background token. Ignored by the overlay layout.",
        sortOrder: 100,
      },
    },
    {
      name: "BackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "`subtle` keeps the soft -background tint (default). `bold` uses the pure scheme color and inverts text inside the bar. Ignored by the overlay layout.",
        sortOrder: 200,
      },
    },
    {
      // Exact bar color — set by chrome generation from the sampled
      // source header, NOT normally authored by hand. Overrides the
      // quantized ColorScheme surface with an inline background so a
      // brand-coloured bar reproduces its real hue (a dark bar also
      // gets the surface-invert subtree remap). Empty = ColorScheme.
      name: "SurfaceColor",
      shape: "text",
      sitecore: {
        hint: "MACHINE-SET — leave this empty. Chrome generation stores the sampled source header's exact hex here because a runtime-built Tailwind colour never reaches the JIT. It applies only while ColorScheme is `default`: pick any concrete ColorScheme and your choice wins instead. Ignored by the Overlay arrangement.",
        sortOrder: 260,
      },
    },
    {
      // TwoTier only: which row sits on top. Brand-specific and a
      // per-placement choice, so it is a param rather than a second
      // variant of the same two-row arrangement.
      name: "TierOrder",
      shape: "enum",
      default: "utility-first",
      sitecore: {
        enumHandle: "header-tier-order@1",
        hint: "TwoTier only: which row is on top. `utility-first` (default) puts the utility strip above the brand + nav bar; `nav-first` swaps them. The other arrangements have no second tier and ignore it.",
        sortOrder: 220,
      },
    },
    {
      // The utility tier's OWN fill. Without this the tier was hardcoded
      // to `bg-muted`, which on any theme whose muted sits near the page
      // background made TwoTier render indistinguishably from Standard.
      // Real two-tier mastheads almost always tint the two rows
      // differently — that contrast IS the arrangement.
      name: "UtilityColorScheme",
      shape: "enum",
      default: "neutral",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Fill behind the utility strip, independent of the main bar's ColorScheme. `neutral` (default) is the muted tint the tier used to hardcode. Set this and ColorScheme to different roles to get the two-tone masthead the TwoTier arrangement exists for.",
        sortOrder: 230,
      },
    },
    {
      name: "UtilityBackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "Subtle = soft `-background` tint on the utility strip; bold = the pure brand colour with inverted text. Composes with UtilityColorScheme exactly like BackgroundIntensity does with ColorScheme.",
        sortOrder: 240,
      },
    },
    // NOTE (Liz's CTA cleanup): the `NavTextTransform`
    // (text-transform@1) param was removed from the authoring surface —
    // casing is authored in content. Do not re-add.
  ],

  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "header-utility-start-{*}",
      allowedRenderingHandles: [
        "cta-button@1",
        "utility-trigger@1",
        "language-switcher@1",
      ],
    },
    {
      key: "header-utility-end-{*}",
      allowedRenderingHandles: [
        "cta-button@1",
        "utility-trigger@1",
        "language-switcher@1",
      ],
    },
    {
      // Logo slot. Stock chrome places `image@1` Logo here (shared
      // `site-logo-content@1`). Do not assign a content item on Header
      // itself — the shell has no fields.
      key: "header-start-{*}",
      allowedRenderingHandles: ["image@1"],
    },
    {
      key: "header-nav-{*}",
      allowedRenderingHandles: ["main-nav@1"],
    },
    {
      key: "header-end-{*}",
      allowedRenderingHandles: [
        "cta-button@1",
        "utility-trigger@1",
        "language-switcher@1",
      ],
    },
    {
      key: "header-mobile-{*}",
      allowedRenderingHandles: ["mobile-menu@1"],
    },
  ],
} satisfies ComponentTemplateRecipe;

export default headerRecipe;
