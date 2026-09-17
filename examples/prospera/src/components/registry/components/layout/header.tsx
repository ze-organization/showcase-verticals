import type { ReactNode } from "react";

import {
  HeaderEnd,
  HeaderInner,
  HeaderNav,
  Header as HeaderPrimitive,
  HeaderStart,
} from "@/components/registry/primitives/core/header";
import { cn } from "@/lib/registry/cn";
import { resolveEditingMode } from "@/lib/registry/editing-mode";
import { isEnabled } from "@/lib/registry/param-parsers";
import {
  parseSectionBackgroundIntensity,
  parseSectionColorScheme,
  resolveChromeSurfaceColor,
  resolveSectionSurfaceClass,
} from "@/lib/registry/section-surface";
import { resolvePlaceholderChildren } from "@/lib/registry/placeholder-children";
import { Placeholder } from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

export type HeaderProps = Omit<ComponentProps, "rendering" | "params"> & {
  /** Layout-service rendering — required by the shell's
   *  `<Placeholder>` slots. */
  rendering?: ComponentProps["rendering"];
  params?: { [key: string]: string };
  /**
   * Flat SDK-convention props — `withSitecore`'s default map spreads
   * camelCased rendering params to the top level. `ColorScheme`,
   * `BackgroundIntensity`, and `SurfaceColor` are read from `params`
   * first and fall back to these.
   */
  isEditing?: boolean;
  /** `ColorScheme` param — section-surface scheme for the header bar. */
  colorScheme?: string;
  /** `BackgroundIntensity` param — subtle tint vs. bold solid fill. */
  backgroundIntensity?: string;
  /**
   * `SurfaceColor` param — an EXACT bar color (`#rrggbb`), sampled from a
   * source site's real header during chrome generation. When set it
   * overrides the quantized `ColorScheme` surface with an inline
   * background + (for a dark bar) the `surface-invert` subtree remap.
   */
  surfaceColor?: string;
};

/** Slot arrangement. One exported variant per member — never a param. */
export type HeaderBarLayout =
  | "standard"
  | "two-tier"
  | "centered-stack"
  | "centered-inline"
  | "overlay";

/**
 * `menu-placement@1` — which inline side the primary nav / menu cluster
 * sits on in the `centered-inline` layout (logical; flips under RTL).
 * The other layouts ignore it.
 */
export type HeaderMenuPlacement = "inline-start" | "inline-end";

const MENU_PLACEMENTS: readonly HeaderMenuPlacement[] = [
  "inline-start",
  "inline-end",
];

/** Parse the `MenuPlacement` param; unknown/empty falls back to
 *  `inline-start` (the recipe default — menu-start / actions-end). */
function parseHeaderMenuPlacement(
  value: string | undefined,
): HeaderMenuPlacement {
  const normalized = value?.trim().toLowerCase();
  return MENU_PLACEMENTS.includes(normalized as HeaderMenuPlacement)
    ? (normalized as HeaderMenuPlacement)
    : "inline-start";
}

/**
 * Overlay-bar chrome for the `Overlay` variant: float over the page's
 * first section, light-on-dark text, soft top scrim for legibility.
 * `bg-transparent` clears the Header primitive's `bg-background` so the
 * section behind actually shows through.
 */
const OVERLAY_BAR_CLASS =
  "absolute inset-x-0 top-0 z-40 w-full bg-transparent bg-linear-to-b from-theme-black/50 to-transparent text-theme-white";

/** In editing mode the overlay would cover (and be covered by) the
 *  editor chrome — keep it in-flow on a dark surface so authors can
 *  select and edit it. */
const OVERLAY_EDITING_BAR_CLASS = "static bg-theme-black";

/**
 * Pure-placeholder header shell. Owns layout, responsive visibility,
 * and accessibility — but NO inline rendering. Authors compose every
 * affordance (logo, main nav, utility triggers, search, account,
 * language, mobile menu, etc.) by placing renderings into the slots
 * below.
 *
 * **Four always-mounted placeholders, plus two optional utility slots:**
 *
 *   header-start-{*}                     always visible (logo slot)
 *   header-nav-{*}                       desktop only (main nav strip)
 *   header-end-{*}                       desktop only (right cluster)
 *   header-mobile-{*}                    mobile only (mobile-menu renderings)
 *   header-utility-start-{*}             TwoTier only, and only when filled
 *   header-utility-end-{*}               TwoTier only, and only when filled
 *
 * The desktop/mobile flip happens at the `lg` Tailwind breakpoint via
 * `hidden lg:flex` / `flex lg:hidden` — slot contents stay
 * viewport-agnostic. Announcement / unused utility slots are not
 * mounted, so Pages does not paint empty drop chrome on the Standard
 * header used by page templates.
 *
 * **One VARIANT per arrangement** (see the exports at the bottom):
 *
 *   Standard       one bar: start / nav / end.
 *   TwoTier        slim utility strip on its own tinted top band
 *                  (utility-start / utility-end, when those slots have
 *                  children), brand + nav bar below — the two rows
 *                  read as distinct.
 *   CenteredStack  brand row centered on its own line (end cluster /
 *                  mobile menu pinned to the inline end), nav strip
 *                  centered on a bordered row below — the editorial
 *                  masthead treatment.
 *   CenteredInline single-row centered-logo masthead: the menu cluster
 *                  (nav on desktop, mobile-menu slot on mobile) on one
 *                  inline side, the brand centered, the actions cluster
 *                  on the other side — the `MenuPlacement` param picks
 *                  the menu side (default inline-start).
 *   Overlay        the bar floats transparently over the page's first
 *                  section (light-on-dark, top scrim). Ignores
 *                  `ColorScheme` / `BackgroundIntensity`; pair with a
 *                  full-bleed hero as the first section.
 *
 * `ColorScheme` / `BackgroundIntensity` tint the shell bar via the
 * shared section-surface vocabulary (`default` keeps the classic page
 * surface); `Overlay` ignores both — its surface is transparent by
 * design.
 */
/**
 * Resolve the Default shell's bar surface. Precedence:
 *   overlay      → no surface class (transparent; the overlay classes win)
 *   SurfaceColor → exact inline background (+ `surface-invert` for a dark
 *                  bar) — a sampled source-header hex from chrome generation
 *   ColorScheme  → the quantized section-surface token class
 */
function resolveDefaultShellSurface(
  params: { [key: string]: string },
  props: HeaderProps,
  barLayout: HeaderBarLayout,
): {
  surface: string | undefined;
  shellStyle: { backgroundColor: string } | undefined;
} {
  if (barLayout === "overlay")
    return { surface: undefined, shellStyle: undefined };
  const scheme = parseSectionColorScheme(
    params.ColorScheme ?? props.colorScheme,
  );
  // `SurfaceColor` is MACHINE-set: chrome generation samples the source
  // site's real bar hue and stores it here because a Tailwind arbitrary
  // value built from runtime data never reaches the JIT. It used to win
  // unconditionally — and since generation stamps it onto every header
  // it produces, an author who then picked a ColorScheme or flipped
  // BackgroundIntensity saw NOTHING happen, because this function
  // returned before either was read. That is the "header colour schemes
  // don't work / bold doesn't work" report.
  //
  // An explicit author pick now wins. `default` is the no-opinion
  // sentinel, so a generated header the author hasn't touched still
  // reproduces its sampled hue exactly; choosing any concrete scheme is
  // an opinion and takes the bar back onto the theme vocabulary.
  const authorPickedScheme = scheme !== "default";
  const chromeColor = authorPickedScheme
    ? null
    : resolveChromeSurfaceColor(params.SurfaceColor ?? props.surfaceColor);
  if (chromeColor) {
    return {
      surface: chromeColor.className || undefined,
      shellStyle: chromeColor.style,
    };
  }
  const surface =
    resolveSectionSurfaceClass(
      scheme,
      parseSectionBackgroundIntensity(
        params.BackgroundIntensity ?? props.backgroundIntensity,
      ),
    ) || undefined;
  return { surface, shellStyle: undefined };
}

/**
 * Mount a header slot only when it already has children. Empty
 * `header-announcement` / `header-utility-start` / `header-utility-end`
 * used to always render, which painted Pages drop chrome on every
 * Standard page-template header even though those slots were unused.
 */
function populatedPlaceholder(
  rendering: ComponentProps["rendering"],
  prefix: string,
  ph: string,
): ReactNode {
  const { key, children } = resolvePlaceholderChildren(rendering, prefix, ph);
  if (children.length === 0) return null;
  return <Placeholder name={key} rendering={rendering} />;
}

/** Shared surface + slot context every non-standard shell branch needs. */
type ShellBarContext = {
  shellClass: string;
  shellStyle: { backgroundColor: string } | undefined;
  id: string | undefined;
  announcement: ReactNode;
  utilityRow: ReactNode;
  ph: string;
  rendering: ComponentProps["rendering"];
};

/**
 * `centered-inline` masthead (Södra-style): the primary nav / menu cluster
 * on one inline side, the brand centered, the actions cluster on the other
 * side — all in ONE bar. The nav strip (desktop) and the mobile menu slot
 * (mobile) travel together as the "menu" cluster; `MenuPlacement` picks
 * which side it sits on and the actions cluster takes the opposite side.
 * The brand is absolutely centered so it stays on the bar's midline
 * regardless of how wide either cluster grows.
 *
 * Extracted from `Default` to keep the shell dispatcher under the
 * cognitive-complexity budget.
 */
function CenteredInlineBar({
  shellClass,
  shellStyle,
  id,
  announcement,
  utilityRow,
  ph,
  rendering,
  menuPlacementParam,
}: ShellBarContext & { menuPlacementParam: string | undefined }) {
  const menuPlacement = parseHeaderMenuPlacement(menuPlacementParam);
  const menuCluster = (
    <div className="flex min-w-0 items-center gap-2 lg:gap-4">
      <HeaderNav className="hidden lg:flex">
        <Placeholder name={`header-nav-${ph}`} rendering={rendering} />
      </HeaderNav>
      <div className="flex items-center lg:hidden">
        <Placeholder name={`header-mobile-${ph}`} rendering={rendering} />
      </div>
    </div>
  );
  const actionsCluster = (
    <HeaderEnd className="hidden lg:flex">
      <Placeholder name={`header-end-${ph}`} rendering={rendering} />
    </HeaderEnd>
  );
  // Start-side takes the menu (default) or the actions (inline-end).
  const startSide =
    menuPlacement === "inline-end" ? actionsCluster : menuCluster;
  const endSide = menuPlacement === "inline-end" ? menuCluster : actionsCluster;
  return (
    <HeaderPrimitive className={shellClass} style={shellStyle} id={id}>
      {announcement}
      {utilityRow}
      <div className="container relative mx-auto flex min-h-16 items-center justify-between gap-4 px-4 py-3">
        {startSide}
        <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2">
          <Placeholder name={`header-start-${ph}`} rendering={rendering} />
        </div>
        {endSide}
      </div>
    </HeaderPrimitive>
  );
}

/**
 * Shared shell body for every header layout variant.
 *
 * The arrangement arrives as an argument, NOT as a rendering param:
 * each layout is its own named export below, per the project's
 * rendering-variant convention (separate function exports, never a
 * discriminator prop). This function is the one place the five
 * arrangements are implemented.
 */
const HeaderShell = (props: HeaderProps & { barLayout: HeaderBarLayout }) => {
  const params = props.params ?? {};
  const { styles, RenderingIdentifier: id, DynamicPlaceholderId } = params;
  // Substitute SXA's per-placement digit ID into the slot names so
  // they match the SDK's `^<prefix>-\d+$` regex derived from the
  // layout-service's `<prefix>-{*}` template keys. See container.tsx
  // for the full rationale.
  const ph = DynamicPlaceholderId ?? "1";
  const rendering = props.rendering;
  const barLayout = props.barLayout;
  const isEditing = resolveEditingMode({ params }) || Boolean(props.isEditing);
  // `Sticky` param — pin the bar to the top of the viewport on scroll.
  // Ignored by the overlay layout, which already floats absolutely
  // (`position: sticky` cannot compose with the overlay's `absolute`), and
  // relies on the primitive's opaque `bg-background` (or a bold ColorScheme
  // fill) so page content scrolls underneath rather than showing through.
  // `z-40` matches the shared sticky-top convention used across the layout
  // family (container / section-wrapper / row-splitter).
  const stickyClass =
    barLayout !== "overlay" && isEnabled(params.Sticky)
      ? "sticky top-0 z-40"
      : undefined;
  // Shell-bar surface tone (standard / centered-stack). `default`
  // resolves to no class; overlay ignores the axis (transparent by
  // design). `SurfaceColor` (a sampled source-header hex) wins over the
  // quantized ColorScheme surface — see `resolveDefaultShellSurface`.
  const { surface, shellStyle } = resolveDefaultShellSurface(
    params,
    props,
    barLayout,
  );
  const shellClass = cn(
    surface,
    stickyClass,
    barLayout === "overlay" && OVERLAY_BAR_CLASS,
    barLayout === "overlay" && isEditing && OVERLAY_EDITING_BAR_CLASS,
    styles,
  );

  // The shell is pure-placeholder — without a layout-service rendering
  // there is nothing to compose into the slots.
  if (!rendering) {
    return (
      <HeaderPrimitive
        className={shellClass}
        style={shellStyle}
        id={id ?? undefined}
      />
    );
  }

  const announcement = populatedPlaceholder(
    rendering,
    "header-announcement",
    ph,
  );
  // `mobile-placement@1` — which inline side the hamburger sits on. The
  // shell used to render `header-mobile-{*}` as the row's LAST child
  // unconditionally, so the trigger was pinned to the inline-end with no
  // author control; plenty of brands lead with it instead. Unknown /
  // unset aliases to `inline-end`, the historical position, so stored
  // placements render byte-identically.
  const mobileLeads =
    params.MobilePlacement?.trim().toLowerCase() === "inline-start";
  const mobileSlot = (
    <div className="flex items-center lg:hidden">
      <Placeholder name={`header-mobile-${ph}`} rendering={rendering} />
    </div>
  );
  // The utility tier's own fill. It used to be a hardcoded `bg-muted`,
  // which is why TwoTier and Standard looked identical on any theme
  // whose muted tint sits near the page background: the ONLY difference
  // between the two arrangements was `border-b` versus `bg-muted
  // text-sm`. A real two-tier masthead tints its rows differently — that
  // contrast IS the arrangement — so the tier now carries its own
  // scheme + intensity pair, defaulting to the neutral tint it had.
  const utilitySurface =
    resolveSectionSurfaceClass(
      parseSectionColorScheme(params.UtilityColorScheme ?? "neutral"),
      parseSectionBackgroundIntensity(params.UtilityBackgroundIntensity),
    ) || undefined;
  // `header-tier-order@1` — which row sits on top in TwoTier. Unknown /
  // unset aliases to `utility-first`, the historical stacking order.
  const navFirst = params.TierOrder?.trim().toLowerCase() === "nav-first";
  const utilityStart = populatedPlaceholder(
    rendering,
    "header-utility-start",
    ph,
  );
  const utilityEnd = populatedPlaceholder(
    rendering,
    "header-utility-end",
    ph,
  );
  const utilityRow =
    utilityStart || utilityEnd ? (
      <div className="hidden border-b lg:block">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          {utilityStart ? (
            <div className="flex items-center gap-2">{utilityStart}</div>
          ) : (
            <div />
          )}
          {utilityEnd ? (
            <div className="flex items-center gap-2">{utilityEnd}</div>
          ) : (
            <div />
          )}
        </div>
      </div>
    ) : null;

  if (barLayout === "centered-stack") {
    return (
      <HeaderPrimitive
        className={shellClass}
        style={shellStyle}
        id={id ?? undefined}
      >
        {announcement}
        {utilityRow}
        {/* Brand row: the start slot centered on its own line; the end
            cluster (desktop) / mobile menu (mobile) pinned inline-end. */}
        <div className="container relative mx-auto flex min-h-16 items-center justify-center px-4 py-3">
          <Placeholder name={`header-start-${ph}`} rendering={rendering} />
          <HeaderEnd className="absolute end-4 top-1/2 hidden -translate-y-1/2 lg:flex">
            <Placeholder name={`header-end-${ph}`} rendering={rendering} />
          </HeaderEnd>
          <div
            className={cn(
              "absolute top-1/2 flex -translate-y-1/2 items-center lg:hidden",
              mobileLeads ? "start-4" : "end-4",
            )}
          >
            <Placeholder name={`header-mobile-${ph}`} rendering={rendering} />
          </div>
        </div>
        {/* Nav row: centered on a bordered row below the brand. */}
        <div className="hidden border-t lg:block">
          <div className="container mx-auto flex items-center justify-center gap-6 px-4">
            <Placeholder name={`header-nav-${ph}`} rendering={rendering} />
          </div>
        </div>
      </HeaderPrimitive>
    );
  }

  if (barLayout === "centered-inline") {
    return (
      <CenteredInlineBar
        shellClass={shellClass}
        shellStyle={shellStyle}
        id={id ?? undefined}
        announcement={announcement}
        utilityRow={utilityRow}
        ph={ph}
        rendering={rendering}
        menuPlacementParam={params.MenuPlacement}
      />
    );
  }

  if (barLayout === "two-tier") {
    // Two-tier masthead: the utility/secondary slots (utility-start /
    // utility-end — utility links, language, search) ride their OWN
    // tinted band, and the primary brand + nav bar rides the other. The
    // band's fill is the `UtilityColorScheme` param and the stacking
    // order is `TierOrder`, so an author can express both the two-tone
    // contrast the arrangement exists for and the nav-on-top masthead
    // that plenty of brands use.
    const utilityTier =
      utilityStart || utilityEnd ? (
        <div
          className={cn(
            "hidden text-sm lg:block",
            // Falls back to the tier's historical `bg-muted` only when the
            // scheme resolves to nothing (`default` / `none`), so a band
            // with no opinion still reads as a distinct row.
            utilitySurface ?? "bg-muted",
          )}
          data-slot="header-utility-tier"
          data-tier-order={navFirst ? "nav-first" : "utility-first"}
        >
          <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2">
            {utilityStart ? (
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                {utilityStart}
              </div>
            ) : (
              <div />
            )}
            {utilityEnd ? (
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                {utilityEnd}
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      ) : null;
    const primaryTier = (
      <HeaderInner drawer={false}>
        {mobileLeads ? mobileSlot : null}
        <HeaderStart>
          <Placeholder name={`header-start-${ph}`} rendering={rendering} />
        </HeaderStart>
        <HeaderNav className="hidden lg:flex">
          <Placeholder name={`header-nav-${ph}`} rendering={rendering} />
        </HeaderNav>
        <HeaderEnd className="hidden lg:flex">
          <Placeholder name={`header-end-${ph}`} rendering={rendering} />
        </HeaderEnd>
        {mobileLeads ? null : mobileSlot}
      </HeaderInner>
    );
    return (
      <HeaderPrimitive
        className={shellClass}
        style={shellStyle}
        id={id ?? undefined}
      >
        {announcement}
        {navFirst ? primaryTier : utilityTier}
        {navFirst ? utilityTier : primaryTier}
      </HeaderPrimitive>
    );
  }

  // `standard` and `overlay` share the single start/nav/end bar —
  // overlay changes only the shell surface (float + scrim), never the
  // slot arrangement. The overlay bar drops the desktop utility row
  // (a bordered strip has no place on a transparent floating bar).
  // `drawer={false}`: the shell owns its responsive treatment via the
  // `header-mobile-{*}` slot (mobile-menu renderings) — the primitive's
  // built-in hamburger + drawer would render a SECOND floating trigger
  // beside the composed one and duplicate the slot content in its own
  // drawer.
  return (
    <HeaderPrimitive
      className={shellClass}
      style={shellStyle}
      id={id ?? undefined}
    >
      {announcement}
      {barLayout === "overlay" ? null : utilityRow}
      <HeaderInner drawer={false}>
        {mobileLeads ? mobileSlot : null}
        <HeaderStart>
          <Placeholder name={`header-start-${ph}`} rendering={rendering} />
        </HeaderStart>
        <HeaderNav className="hidden lg:flex">
          <Placeholder name={`header-nav-${ph}`} rendering={rendering} />
        </HeaderNav>
        <HeaderEnd className="hidden lg:flex">
          <Placeholder name={`header-end-${ph}`} rendering={rendering} />
        </HeaderEnd>
        {mobileLeads ? null : mobileSlot}
      </HeaderInner>
    </HeaderPrimitive>
  );
};

/**
 * The five header arrangements, one exported variant each.
 *
 * These replaced a single `Default` export that branched on a
 * `BarLayout` rendering param. A discriminator param is the pattern the
 * `rendering-variants` convention exists to forbid: Sitecore authors
 * pick a *variant* from the rendering list, so an arrangement hidden
 * behind a param is invisible where they actually choose it.
 *
 *   Standard       start / nav / end bar. Utility / announcement
 *                  slots are omitted unless they already have children
 *                  (page templates do not use them).
 *   TwoTier        slim utility strip on its own tinted top band, brand
 *                  + nav bar below — the two rows read as distinct.
 *                  Populate the utility-start/end slots.
 *   CenteredStack  brand row centered on its own line, nav on a
 *                  bordered row below.
 *   CenteredInline single-row centered-logo masthead; `MenuPlacement`
 *                  picks which side the menu cluster sits on.
 *   Overlay        floats transparently over the page's first section.
 *                  Ignores `Sticky` (it is already absolutely
 *                  positioned) and drops the utility row.
 */
export const Standard = (props: HeaderProps) => (
  <HeaderShell {...props} barLayout="standard" />
);

export const TwoTier = (props: HeaderProps) => (
  <HeaderShell {...props} barLayout="two-tier" />
);

export const CenteredStack = (props: HeaderProps) => (
  <HeaderShell {...props} barLayout="centered-stack" />
);

export const CenteredInline = (props: HeaderProps) => (
  <HeaderShell {...props} barLayout="centered-inline" />
);

export const Overlay = (props: HeaderProps) => (
  <HeaderShell {...props} barLayout="overlay" />
);

/**
 * `Default` stays exported and maps to `Standard` — the arrangement a
 * bare `Default` placement already rendered, since `BarLayout` fell
 * back to `standard` when unset. Existing placements therefore keep
 * their appearance. It is deliberately NOT listed in the recipe's
 * `variants[]`: authors pick a named arrangement, and Default only
 * exists so stored `variant: "Default"` content keeps resolving.
 */
export const Default = Standard;

export default Default;

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Without this marker the file lands in
 * the server map alone, so Pages chrome (browser-side) can't look
 * up Header or resolve its `Default` variant export.
 */
export const componentType = "universal";
