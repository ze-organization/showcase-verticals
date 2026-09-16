import { cn } from "@/lib/registry/cn";
import { resolveEditingMode } from "@/lib/registry/editing-mode";
import { isEnabled } from "@/lib/registry/param-parsers";
import { resolvePlaceholderChildren } from "@/lib/registry/placeholder-children";
import {
  parseSectionBackgroundIntensity,
  parseSectionColorScheme,
  parseSectionMaxWidth,
  parseSectionPaddingY,
  resolveChromeSurfaceColor,
  resolveSectionSurfaceClass,
  SECTION_MAX_WIDTH_CLASSES,
  SECTION_PADDING_Y_CLASSES,
} from "@/lib/registry/section-surface";
import { Placeholder } from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

export type FooterProps = Omit<ComponentProps, "rendering" | "params"> & {
  /** Layout-service rendering — required by the shell's
   *  `<Placeholder>` regions. */
  rendering?: ComponentProps["rendering"];
  params?: { [key: string]: string };
  /**
   * Flat SDK-convention props — `withSitecore`'s default map spreads
   * camelCased rendering params to the top level, so a shell mounted
   * outside the params envelope (previews, tests) honors the same
   * surface options.
   */
  styles?: string;
  id?: string;
  isEditing?: boolean;
  /** `ColorScheme` param — section-surface scheme for the footer fill. */
  colorScheme?: string;
  /** `BackgroundIntensity` param — subtle tint vs. bold solid fill. */
  backgroundIntensity?: string;
  /**
   * `SurfaceColor` param — an EXACT footer fill (`#rrggbb`), sampled from
   * a source site's real footer during chrome generation. Overrides the
   * quantized `ColorScheme` surface with an inline background + (dark
   * fill) the `surface-invert` subtree remap. Empty = ColorScheme.
   */
  surfaceColor?: string;
  /** `PaddingY` param — main-tier vertical padding (`padding-y@1`);
   *  `auto` keeps the classic responsive `py-12 md:py-16` ramp. */
  paddingY?: string;
  /** `MaxWidth` param — inner content cap (`max-width@1`); `auto` keeps
   *  the Tailwind `container` cap. */
  maxWidth?: string;
  /** `ShowTierDivider` param — TwoTier only: hairline between tiers
   *  (the splitters' divide-border treatment). Checkbox boolean. */
  showTierDivider?: string | boolean;
  /** `TierTwoBackground` param — TwoTier only: `color-scheme@1` fill
   *  for the narrow second tier. `none` (default) inherits the footer
   *  surface. */
  tierTwoBackground?: string;
  /** `ShowBandDividers` param — Bands only: hairline between every
   *  band. Checkbox boolean. */
  showBandDividers?: string | boolean;
};

/**
 * Resolve the footer's surface classes from the shared section-surface
 * vocabulary (`color-scheme@1` + `background-intensity@1`). The
 * `default` scheme keeps the footer's classic quiet surface.
 */
function resolveFooterSurface(
  scheme: string | undefined,
  intensity: string | undefined,
): string {
  const resolved = resolveSectionSurfaceClass(
    parseSectionColorScheme(scheme),
    parseSectionBackgroundIntensity(intensity),
  );
  return resolved || "bg-background-muted text-foreground";
}

/**
 * Main-tier vertical padding from the shared `padding-y@1` vocabulary.
 * `auto` (the recipe default) keeps the footer's classic responsive
 * ramp, which no single `py-*` token reproduces (same rationale as
 * section-wrapper).
 */
function resolveTierPadding(paddingY: string | undefined): string {
  const parsed = parseSectionPaddingY(paddingY);
  return parsed === "auto"
    ? "py-12 md:py-16"
    : SECTION_PADDING_Y_CLASSES[parsed];
}

/**
 * Inner content-width wrapper. `auto` (the recipe default) keeps the
 * footer's natural Tailwind `container` cap (not enum-representable —
 * the consent-banner precedent); a concrete `max-width@1` pick swaps
 * to that pixel cap so `container`'s own per-breakpoint max-width
 * can't fight it.
 */
function resolveInnerWidthClass(maxWidth: string | undefined): string {
  const parsed = parseSectionMaxWidth(maxWidth);
  if (parsed === "auto") return "container mx-auto px-4";
  return cn("mx-auto w-full px-4", SECTION_MAX_WIDTH_CLASSES[parsed]);
}

/** Shell chrome shared by every footer layout variant. */
interface ShellChrome {
  params: { [key: string]: string };
  rendering: FooterProps["rendering"];
  styles: string | undefined;
  id: string | undefined;
  editing: boolean;
  phSuffix: string | undefined;
  surface: string;
  /** Exact `SurfaceColor` fill (sampled source footer) — inline so it
   *  paints losslessly; `undefined` falls back to the `surface` class. */
  surfaceStyle: { backgroundColor: string } | undefined;
  innerClass: string;
  mainPadding: string;
}

function resolveShellChrome(props: FooterProps): ShellChrome {
  const params = props.params ?? {};
  // Exact bar color (chrome generation) WINS over the quantized
  // ColorScheme surface: inline background + (dark bar) surface-invert.
  const chromeColor = resolveChromeSurfaceColor(
    params.SurfaceColor ?? props.surfaceColor,
  );
  return {
    params,
    rendering: props.rendering,
    styles: params.styles ?? props.styles,
    id: params.RenderingIdentifier ?? props.id ?? undefined,
    editing: resolveEditingMode({ params }) || Boolean(props.isEditing),
    phSuffix: params.DynamicPlaceholderId,
    surface: chromeColor
      ? chromeColor.className
      : resolveFooterSurface(
          params.ColorScheme ?? props.colorScheme,
          params.BackgroundIntensity ?? props.backgroundIntensity,
        ),
    surfaceStyle: chromeColor?.style,
    innerClass: resolveInnerWidthClass(params.MaxWidth ?? props.maxWidth),
    mainPadding: resolveTierPadding(params.PaddingY ?? props.paddingY),
  };
}

/**
 * One placeholder region of the shell. Always mounts the raw
 * `<Placeholder>` (the region is permanent, visible chrome — never
 * locked behind a toggle); in editing mode an EMPTY region additionally
 * paints the dashed tray treatment (utility-trigger's pattern) so
 * authors have a visible, targetable drop area instead of a
 * zero-height strip.
 */
function FooterRegion({
  name,
  chrome,
  isEmpty,
  className,
}: {
  name: string;
  chrome: ShellChrome;
  isEmpty: boolean;
  className?: string;
}) {
  return (
    <div
      data-slot={name.replace(/-\d+$/, "")}
      className={cn(
        "w-full min-w-0",
        chrome.editing &&
          isEmpty &&
          "min-h-16 rounded-md border border-border border-dashed p-4",
        className,
      )}
    >
      {chrome.rendering ? (
        <Placeholder name={name} rendering={chrome.rendering} />
      ) : null}
    </div>
  );
}

/**
 * Single-tier footer shell: one permissive placeholder region
 * (`footer-main-{*}`) on the footer surface. The footer owns LAYOUT
 * only — surface (ColorScheme / BackgroundIntensity), width (MaxWidth)
 * and padding (PaddingY); everything else (link columns, brand strip,
 * social row, legal strip) is composed INTO the region, typically via
 * the stock footer experiences (footer-link-columns@1,
 * footer-brand-social@1, footer-legal-strip@1) or the layout splitters.
 * Placeholder lookups tolerate suffix drift via
 * `resolvePlaceholderChildren`.
 */
export const Default = (props: FooterProps) => {
  const chrome = resolveShellChrome(props);
  const main = resolvePlaceholderChildren(
    chrome.rendering,
    "footer-main",
    chrome.phSuffix,
  );

  return (
    <footer
      className={cn(
        "component footer relative w-full overflow-hidden",
        chrome.surface,
        chrome.styles,
      )}
      id={chrome.id}
      style={chrome.surfaceStyle}
    >
      <div className={cn(chrome.innerClass, chrome.mainPadding)}>
        <FooterRegion
          name={main.key}
          chrome={chrome}
          isEmpty={main.children.length === 0}
          className="flex flex-col gap-8"
        />
      </div>
    </footer>
  );
};

export default Default;

/**
 * Two-tier footer shell: the main tier (`footer-main-{*}`) plus a much
 * narrower second row (`footer-bottom-{*}`) — the copyright / legal /
 * social strip band. Options:
 *
 *   ShowTierDivider    hairline between the tiers (`divide-y
 *                      divide-border`, the splitters' treatment).
 *   TierTwoBackground  `color-scheme@1` fill for the second tier;
 *                      `none` (default) inherits the footer surface.
 *                      Composes with the footer's BackgroundIntensity.
 */
export const TwoTier = (props: FooterProps) => {
  const chrome = resolveShellChrome(props);
  const params = chrome.params;
  const main = resolvePlaceholderChildren(
    chrome.rendering,
    "footer-main",
    chrome.phSuffix,
  );
  const bottom = resolvePlaceholderChildren(
    chrome.rendering,
    "footer-bottom",
    chrome.phSuffix,
  );
  const dividerOn = isEnabled(params.ShowTierDivider ?? props.showTierDivider);
  const tierTwoSurface = resolveSectionSurfaceClass(
    parseSectionColorScheme(
      params.TierTwoBackground ?? props.tierTwoBackground,
      "none",
    ),
    parseSectionBackgroundIntensity(
      params.BackgroundIntensity ?? props.backgroundIntensity,
    ),
  );

  return (
    <footer
      className={cn(
        "component footer relative w-full overflow-hidden",
        dividerOn && "divide-y divide-border",
        chrome.surface,
        chrome.styles,
      )}
      id={chrome.id}
      style={chrome.surfaceStyle}
      data-slot="footer-two-tier"
    >
      <div className={cn(chrome.innerClass, chrome.mainPadding)}>
        <FooterRegion
          name={main.key}
          chrome={chrome}
          isEmpty={main.children.length === 0}
          className="flex flex-col gap-8"
        />
      </div>
      <div data-slot="footer-tier-two" className={tierTwoSurface}>
        <div className={cn(chrome.innerClass, "py-4 md:py-5")}>
          <FooterRegion
            name={bottom.key}
            chrome={chrome}
            isEmpty={bottom.children.length === 0}
            className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
          />
        </div>
      </div>
    </footer>
  );
};

/**
 * Band-stack footer shell: one region (`footer-bands-{*}`) whose
 * children are each a full-width BAND.
 *
 * Why this exists alongside Default/TwoTier: those two apply the
 * container, the tier padding, and a fixed `gap-8` *around* the
 * placeholder, so every child lands inside the container and stacks at
 * one uniform rhythm. Real footers don't work that way — a tagline
 * strip, a social/app-badge row, a tall link-column block, and a legal
 * line all want different heights, and often their own tint or rule.
 * Adding ThreeTier/FourTier variants would be a dead end, because the
 * band COUNT is content, not a layout archetype.
 *
 * So this variant deliberately contributes no width, padding, or gap.
 * Each band owns its own — compose `section-wrapper@1` (or any
 * self-contained band rendering) and set its PaddingY / ColorScheme /
 * MaxWidth per band. That also lets a band paint edge-to-edge while
 * keeping its content centered, which the container-wrapped regions
 * cannot do.
 *
 * `ShowBandDividers` draws a hairline between every band (`divide-y`,
 * the splitters' treatment) — the common case, and full-bleed here
 * because the region is.
 *
 * The footer's own `PaddingY` is NOT applied: it would reintroduce the
 * outer rhythm this variant exists to remove. Surface, `MaxWidth`, and
 * `SurfaceColor` still apply — `MaxWidth` is left for the bands so it
 * only caps the footer element itself.
 */
export const Bands = (props: FooterProps) => {
  const chrome = resolveShellChrome(props);
  const bands = resolvePlaceholderChildren(
    chrome.rendering,
    "footer-bands",
    chrome.phSuffix,
  );
  const dividersOn = isEnabled(
    chrome.params.ShowBandDividers ?? props.showBandDividers,
  );

  return (
    <footer
      className={cn(
        "component footer relative w-full overflow-hidden",
        chrome.surface,
        chrome.styles,
      )}
      id={chrome.id}
      style={chrome.surfaceStyle}
      // Not `footer-bands` — `FooterRegion` already stamps that on the
      // region itself, and two nested elements sharing one slot name
      // makes `[data-slot="footer-bands"]` ambiguous for callers and
      // tests alike. TwoTier keeps the same split (`footer-two-tier`
      // on the element, `footer-tier-two` on the inner row).
      data-slot="footer-band-stack"
    >
      <FooterRegion
        name={bands.key}
        chrome={chrome}
        isEmpty={bands.children.length === 0}
        className={cn("flex flex-col", dividersOn && "divide-y divide-border")}
      />
    </footer>
  );
};

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Without this marker the file lands in
 * the server map alone, so Pages chrome (browser-side) can't look
 * up Footer or resolve its named-export variants.
 */
export const componentType = "universal";
