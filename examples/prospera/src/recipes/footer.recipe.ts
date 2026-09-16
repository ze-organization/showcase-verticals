import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `Footer` component (./footer.tsx).
 *
 * The footer is a LAYOUT SHELL — placeholder-composed chrome, no field
 * datasource at all. Three variants:
 *
 *   Default — single tier: one permissive placeholder region
 *             (`footer-main-{*}`) on the footer surface.
 *   TwoTier — main tier (`footer-main-{*}`) plus a much narrower
 *             second row (`footer-bottom-{*}`) for the copyright /
 *             legal / social strip. `ShowTierDivider` draws a hairline
 *             between the tiers; `TierTwoBackground` gives the second
 *             tier its own `color-scheme@1` fill (`none` = inherit).
 *   Bands   — N bands (`footer-bands-{*}`), each child owning its own
 *             height, width and surface. Pick this when the footer has
 *             more than two rhythms — a slim tagline strip, a social /
 *             app-badge row, a tall link-column block, a legal line.
 *             Default/TwoTier apply the container, tier padding and a
 *             fixed gap AROUND their region, so their children all
 *             stack at one uniform rhythm and none can paint
 *             edge-to-edge; Bands contributes no width, padding or gap
 *             so each band can. Compose `section-wrapper@1` per band
 *             and set its PaddingY / ColorScheme / MaxWidth.
 *             `ShowBandDividers` rules every band off from the next.
 *
 * Field-specific footer compositions (link columns, brand + social,
 * legal strip) are STOCK EXPERIENCES — partial designs that compose
 * existing renderings into the shell's placeholders:
 * `footer-link-columns@1`, `footer-brand-social@1`,
 * `footer-legal-strip@1`. Author a footer by picking a shell variant
 * and composing (or copying a stock experience).
 *
 * `ColorScheme` / `BackgroundIntensity` / `MaxWidth` follow the shared
 * section-surface / container vocabulary and apply to all three
 * variants. `PaddingY` applies to Default/TwoTier only — Bands
 * deliberately contributes no outer padding so each band owns its own.
 */
export const footerRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "footer@1",
  icon: componentIcons["footer@1"],
  name: "footer",
  displayName: "Footer",
  description:
    "Site footer layout shell. Default = single tier with one permissive placeholder region (footer-main); TwoTier adds a much narrower second row (footer-bottom) with an optional tier divider and its own background; Bands = N full-width bands (footer-bands) where each child owns its own height, width and surface — pick it when the footer has more than two rhythms (slim tagline strip, social/app-badge row, tall link-column block, legal line), since Default and TwoTier stack their children at one uniform gap and cannot paint edge-to-edge. Compose section-wrapper per band and set its PaddingY/ColorScheme/MaxWidth; ShowBandDividers rules every band off from the next. Compose content into the regions — typically via the stock footer experiences (footer-link-columns, footer-brand-social, footer-legal-strip) or the layout splitters.",

  section: { handle: "layout-section@1" },

  variants: [{ name: "Default" }, { name: "TwoTier" }, { name: "Bands" }],

  params: [
    {
      // Shared section-surface vocabulary — same axis as Container /
      // SectionWrapper. `default` keeps the footer's classic quiet
      // surface (bg-background-muted).
      name: "ColorScheme",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Footer surface fill. `default` keeps the quiet muted surface; other schemes apply the matching background token.",
        sortOrder: 100,
      },
    },
    {
      name: "BackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "`subtle` keeps the soft -background tint (default). `bold` uses the pure scheme color and inverts text inside the footer.",
        sortOrder: 200,
      },
    },
    {
      // Exact footer fill — set by chrome generation from the sampled
      // source footer, NOT normally authored by hand. Overrides the
      // quantized ColorScheme surface with an inline background so a
      // brand-coloured footer reproduces its real hue (a dark fill also
      // gets the surface-invert subtree remap). Empty = ColorScheme.
      name: "SurfaceColor",
      shape: "text",
      sitecore: {
        hint: "Exact footer fill color as a hex (`#rrggbb`), primarily set by chrome generation from the sampled source footer. When set it overrides ColorScheme/BackgroundIntensity with the exact tone. Leave empty to use the scheme surface.",
        sortOrder: 210,
      },
    },
    {
      // Same `padding-y` axis as Container's PaddingY. Defaults to the
      // in-list `auto` member: the footer's natural main-tier padding is
      // the responsive `py-12 md:py-16` ramp, which no concrete
      // `padding-y@1` token reproduces (section-wrapper precedent).
      // `auto` maps to that ramp; an explicit pick takes over entirely.
      name: "PaddingY",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Main-tier vertical padding (`py-*`). `auto` (default) keeps the footer's natural responsive padding; an explicit pick (incl. `none`) takes over. The TwoTier second row keeps its own narrow padding.",
        sortOrder: 300,
      },
    },
    {
      // Inner content cap. Defaults to the in-list `auto` member: the
      // footer's natural width is the Tailwind `container` cap, which
      // isn't enum-representable (consent-banner precedent) and is NOT
      // `full`/`max-w-none`. `auto` keeps that container cap.
      name: "MaxWidth",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "max-width@1",
        hint: "Width cap for the content inside the full-width footer band — `auto` (default) keeps the standard container, `narrow`/`standard`/`wide` cap it tighter, `full` runs edge to edge.",
        sortOrder: 400,
      },
    },
    {
      // TwoTier only: hairline between the tiers — the splitters'
      // divide-border treatment.
      // Off by default — omitted `default` IS the unchecked Standard
      // Value (scai encodes a boolean default into the SV checkbox; absent
      // and "false" both land unchecked, so OFF checkboxes omit it per
      // project convention).
      name: "ShowTierDivider",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "TwoTier only: draw a hairline divider between the main tier and the narrow second row.",
        sortOrder: 500,
      },
    },
    {
      // TwoTier only: second-tier surface. `none` inherits the footer
      // surface; a scheme paints the narrow row its own band (composes
      // with BackgroundIntensity).
      name: "TierTwoBackground",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "TwoTier only: background for the narrow second row. `none` (default) inherits the footer surface; a scheme paints the row as its own band.",
        sortOrder: 600,
      },
    },
    {
      // Bands only: hairline between every band. Off by default —
      // omitted `default` IS the unchecked Standard Value (same
      // convention as ShowTierDivider above).
      name: "ShowBandDividers",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Bands only: draw a hairline divider between every band. Full-bleed, because the band region is — the common footer treatment where a tagline strip, a social row, the link columns, and the legal line are each ruled off from the next.",
        sortOrder: 700,
      },
    },
  ],

  dynamicPlaceholders: true,
  // The shell slots. `footer-bottom-{*}` is the TwoTier second tier;
  // Default composes everything into `footer-main-{*}`.
  placeholders: [
    { key: "footer-main-{*}" },
    { key: "footer-bottom-{*}" },
    { key: "footer-bands-{*}" },
  ],
} satisfies ComponentTemplateRecipe;

export default footerRecipe;
