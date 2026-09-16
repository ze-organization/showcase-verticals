"use client";

import { usePathname } from "next/navigation";
import {
  BreadcrumbNav,
  type BreadcrumbNavItem,
  type BreadcrumbSeparatorGlyph,
  type BreadcrumbTrailStyle,
} from "@/components/registry/primitives/core/breadcrumb";
import { Link } from "@/components/registry/primitives/editables/link";
import { cn } from "@/lib/registry/cn";
import {
  normalizeRoutePath,
  useAncestorTitles,
} from "@/lib/registry/integrated-graphql/use-ancestor-titles";
import { type CmsProps, useSitecore } from "@/lib/registry/sitecore";

/**
 * Programmatic breadcrumb — NO datasource, NO curated items. Drop it
 * on a page (or a shared partial design) and it renders the page
 * trail derived from the live route. Authors style it via rendering
 * parameters only; there is nothing to select and nothing to author.
 *
 * How the trail is derived (first match wins):
 *
 *   1. `path` prop            — explicit override for previews/tests.
 *   2. layout-service context — `sitecore.context.itemPath`, the
 *      canonical route path the SDK ships with every page. Preferred
 *      over the browser URL because editing hosts commonly load pages
 *      through internal render routes (`/api/.../render/<route>`).
 *   3. `usePathname()`        — the browser route. Works in any
 *      installed starter with zero backend wiring.
 *
 * Each path segment becomes an ancestor crumb with a humanized label
 * (kebab/underscore → Title Case) and a cumulative href. Setting
 * `UseAuthoredTitles` upgrades those guesses to each ancestor's real
 * `NavigationTitle`/`Title` via the Edge proxy — the rendering's only
 * network call, hence opt-in, and it falls back to the slug labels
 * whenever Edge is unconfigured or the lookup fails. The current
 * page's label is upgraded from the layout-service route when
 * available (NavigationTitle → pageTitle → Title → displayName →
 * name), so the leaf crumb shows the authored page title rather than
 * a slug guess — that one comes from data the SDK already delivered,
 * with no extra fetch. `UseAuthoredTitles` is the only path that adds
 * a request, and only for the ANCESTOR labels.
 */

export interface BreadcrumbProps extends CmsProps {
  /**
   * Explicit route-path override (previews, tests, embedding). When
   * set it is the single source of truth — layout-service context and
   * the browser URL are ignored, and all labels (including the
   * current page) are humanized from the path segments.
   */
  path?: string;
  /** `params.TrailStyle` — breadcrumb-trail-style@1. Default "responsive". */
  trailStyle?: string;
  /** `params.Separator` — breadcrumb-separator@1. Default "chevron". */
  separator?: string;
  /** `params.ShowHome` — prepend the home crumb. Sitecore string boolean. Default true. */
  showHome?: string | boolean;
  /** `params.HomeLabel` — visible label for the home crumb. Default "Home". */
  homeLabel?: string;
  /** `params.ShowCurrentPage` — render the unlinked leaf crumb. Sitecore string boolean. Default true. */
  showCurrentPage?: string | boolean;
  /**
   * `params.UseAuthoredTitles` — look up each ancestor's authored
   * `NavigationTitle`/`Title` via the Edge proxy instead of humanizing
   * its URL slug. Sitecore string boolean. Default false: this is the
   * rendering's only network call, so it is opt-in, and it degrades to
   * the slug labels whenever Edge is unconfigured or the lookup fails.
   */
  useAuthoredTitles?: string | boolean;
}

const TRAIL_STYLES: readonly BreadcrumbTrailStyle[] = [
  "responsive",
  "full",
  "shortened",
];

const SEPARATOR_GLYPHS: readonly BreadcrumbSeparatorGlyph[] = [
  "chevron",
  "slash",
  "dot",
  "pipe",
];

function normalizeTrailStyle(raw: string | undefined): BreadcrumbTrailStyle {
  const token = raw?.trim().toLowerCase() as BreadcrumbTrailStyle;
  return TRAIL_STYLES.includes(token) ? token : "responsive";
}

function normalizeSeparator(raw: string | undefined): BreadcrumbSeparatorGlyph {
  const token = raw?.trim().toLowerCase() as BreadcrumbSeparatorGlyph;
  return SEPARATOR_GLYPHS.includes(token) ? token : "chevron";
}

/**
 * Sitecore string-boolean parser with an explicit fallback for the
 * "param never delivered" case. An unchecked rendering-param checkbox
 * emits ""/absent — both read as false once ANY value has been stored;
 * a fully absent param (fresh placement, previews, tests) takes the
 * recipe default instead.
 */
function parseBooleanParam(
  value: string | boolean | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "on", "enabled"].includes(
    value.trim().toLowerCase(),
  );
}

/** "alpine-tent_2024" → "Alpine Tent 2024". */
export function humanizeSegment(segment: string): string {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // Malformed percent-encoding — keep the raw segment rather than
    // dropping the crumb.
  }
  return decoded
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface DerivedTrail {
  /** Every segment as a crumb, root → leaf. Empty on the home route. */
  crumbs: BreadcrumbNavItem[];
}

/**
 * Split a route path into cumulative crumbs. Hrefs preserve the raw
 * (still-encoded) segments so links stay valid; labels are humanized
 * from the decoded form.
 */
export function deriveTrailFromPath(path: string): DerivedTrail {
  const rawSegments = path.split("/").filter((segment) => segment.length > 0);
  const crumbs = rawSegments.map((segment, index) => ({
    id: `crumb-${index}-${segment}`,
    label: humanizeSegment(segment),
    href: `/${rawSegments.slice(0, index + 1).join("/")}`,
  }));
  return { crumbs };
}

/** Loose field-value reader for layout-service route fields. */
function fieldText(field: unknown): string | undefined {
  if (!field || typeof field !== "object") return undefined;
  const value = (field as { value?: unknown }).value;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

type RouteLike = {
  name?: string;
  displayName?: string;
  fields?: Record<string, unknown>;
};

/**
 * Authored title for the current page from the layout-service route.
 * NavigationTitle → pageTitle → Title → displayName → name.
 */
function routeCurrentLabel(route: RouteLike | undefined): string | undefined {
  if (!route) return undefined;
  const fields = route.fields ?? {};
  return (
    fieldText(fields.NavigationTitle) ??
    fieldText(fields.pageTitle) ??
    fieldText(fields.Title) ??
    (route.displayName?.trim() || undefined) ??
    (route.name?.trim() || undefined)
  );
}

/**
 * Upgrade each crumb's slug guess to its authored title where Edge
 * returned one. An empty map (disabled, unconfigured, or a failed
 * lookup) leaves every label exactly as derived, which is the whole
 * degrade story — so this is a no-op in the common case.
 */
export function applyAuthoredTitles(
  crumbs: BreadcrumbNavItem[],
  authoredTitles: Map<string, string>,
): BreadcrumbNavItem[] {
  if (authoredTitles.size === 0) return crumbs;
  return crumbs.map((crumb) => {
    const authored = crumb.href
      ? authoredTitles.get(normalizeRoutePath(crumb.href))
      : undefined;
    return authored ? { ...crumb, label: authored } : crumb;
  });
}

/**
 * Default Breadcrumb — the only recipe variant. Programmatic: derives
 * the trail from the current route, styled entirely by rendering
 * parameters. See the module docblock for the derivation order.
 */
export function Default(props: BreadcrumbProps) {
  const pathname = usePathname();
  // Safe without a SitecoreProvider (showcase previews, tests): the
  // SDK's context default is `{}`, so `page` is simply undefined.
  const { page } = useSitecore();

  const layoutSitecore = page?.layout?.sitecore;
  const contextItemPath = layoutSitecore?.context?.itemPath;

  const explicitPath = props.path?.trim() || undefined;
  const resolvedPath =
    explicitPath ??
    (typeof contextItemPath === "string" && contextItemPath.startsWith("/")
      ? contextItemPath
      : undefined) ??
    pathname ??
    "/";

  const trailStyle = normalizeTrailStyle(props.trailStyle);
  const separator = normalizeSeparator(props.separator);
  const showHome = parseBooleanParam(props.showHome, true);
  const showCurrentPage = parseBooleanParam(props.showCurrentPage, true);
  const homeLabel = props.homeLabel?.trim() || "Home";

  // Authored ancestor titles (opt-in). An explicit `path` prop is a
  // self-contained fixture, so it never triggers a lookup.
  const useAuthored =
    parseBooleanParam(props.useAuthoredTitles, false) && !explicitPath;
  const authoredTitles = useAncestorTitles({
    itemPath: resolvedPath,
    language: layoutSitecore?.context?.language,
    enabled: useAuthored,
  });

  const crumbs = applyAuthoredTitles(
    deriveTrailFromPath(resolvedPath).crumbs,
    authoredTitles,
  );
  const ancestors = crumbs.slice(0, -1);
  const leaf = crumbs.length ? crumbs[crumbs.length - 1] : undefined;

  // Authored route title beats the slug guess for the leaf crumb —
  // but only when the trail came from SDK/browser context. An
  // explicit `path` prop is a self-contained fixture.
  const routeLabel = explicitPath
    ? undefined
    : routeCurrentLabel(layoutSitecore?.route ?? undefined);

  // On the home route there are no segments: the page itself is home.
  // Render a single current-page crumb (no "Home > Home").
  const isHomeRoute = crumbs.length === 0;
  const currentLabel = isHomeRoute
    ? (routeLabel ?? homeLabel)
    : (routeLabel ?? leaf?.label ?? "");

  const navItems: BreadcrumbNavItem[] = [
    ...(showHome && !isHomeRoute
      ? [{ id: "home", label: homeLabel, href: "/" }]
      : []),
    ...ancestors,
  ];

  const rendersNothing =
    navItems.length === 0 && !(showCurrentPage && currentLabel);
  if (rendersNothing) {
    // Never render nothing in the Pages canvas — keep the rendering
    // selectable so authors can reach the styling parameters.
    if (!props.isEditing) return null;
    return (
      <div
        className={cn("component breadcrumb", props.styles?.trimEnd())}
        id={props.id}
      >
        <span className="is-empty-hint">
          Breadcrumb — page trail renders automatically on published pages
        </span>
      </div>
    );
  }

  return (
    <BreadcrumbNav
      id={props.id}
      items={navItems}
      currentPage={currentLabel}
      trailStyle={trailStyle}
      separator={separator}
      showHomeIcon={showHome && !isHomeRoute}
      showCurrentPage={showCurrentPage}
      className={cn(
        "component breadcrumb container mx-auto w-full px-4 py-4 lg:py-7",
        props.styles?.trimEnd(),
      )}
      renderLink={(linkItem, children) => (
        <Link value={{ href: linkItem.href || "#" }}>{children}</Link>
      )}
    />
  );
}

export default Default;

export const componentType = "universal";
