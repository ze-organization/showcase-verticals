"use client";

import { type ReactNode, useMemo } from "react";
import { SearchControllerProvider } from "@/lib/registry/search/search-controller-context";
import { useSearchResults } from "@/lib/registry/search/use-search-results";
import { Placeholder } from "@/lib/registry/sitecore";
import "@/lib/registry/search/providers"; // side-effect: register custom + sitecore-search
import {
  parseHeadingLayout,
  parseHeadingSize,
  SectionHeading,
} from "@/components/registry/blocks/section-heading";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  resolvePlaceholderChildren,
  sxaPlaceholderName,
} from "@/lib/registry/placeholder-children";
import type { SearchConfig } from "@/lib/registry/search/types";
import { useSitecore } from "@/lib/registry/sitecore";
import {
  resolveSectionSurfaceClass,
  SECTION_MAX_WIDTH_CLASSES,
  SECTION_PADDING_Y_CLASSES,
  type SectionSurfaceProps,
} from "@/lib/registry/section-surface";
import type { ComponentRendering } from "@/lib/registry/sitecore";

/**
 * `SearchExperience` — generic wrapper container that owns a search
 * controller and exposes three placeholders authors fill:
 *
 *   - `search-controls-leading-{*}`  — bars above the results
 *     (SearchBar, FilterPanel sidebar, SortDropdown, ResultsSummary,
 *     ViewToggle).
 *   - `search-results-{*}`           — the inner list-grid or carousel
 *     rendering (any `<family>-list-grid@1` or `<family>-carousel@1`).
 *     Reads controller items via `useSearchControllerContext`.
 *   - `search-controls-trailing-{*}` — bars below the results
 *     (Pagination, ResultsPerPage, ResultsSummary).
 *
 * One generic wrapper covers every family. The wrapper itself doesn't
 * care which family's list-grid/carousel sits inside; authors pick the
 * right pair. The inner placeholder on each list-grid/carousel
 * (e.g. `cards-products-{*}`) keeps composed-mode insertOptions
 * type-restricted so cards still can't be mismatched at the leaf.
 *
 * Layout variants drive how the placeholders flow:
 *
 *   - `Default`        — stacked: leading full-width above results,
 *     trailing below. Use this when there are no sidebar facets
 *     (Search Bar or Search Controls Bar in leading).
 *   - `SidebarFacets`  — leading is a left column (Filter Panel);
 *     results + trailing in the main column. Do not put the Search
 *     Bar here unless you also want a facet rail.
 *   - (`TopBar` was dropped — the SearchControlsBar bundled
 *     rendering now covers the "single horizontal controls row above
 *     the results" case in one drop inside the leading slot under
 *     the Default layout.)
 *
 * `search-results-{*}` is the listing only (list-grid / carousel).
 * Search Bar is chrome and is not a valid drop there.
 */
export interface SearchExperienceProps extends SectionSurfaceProps {
  title?: TextSource;
  lead?: TextSource;
  /** Heading arrangement (`heading-layout@1`), parsed leniently. */
  headingLayout?: string;
  /** Heading typographic scale (`heading-size@1`), parsed leniently. */
  headingSize?: string;
  searchConfig?: SearchConfig;

  facetPlacement?: "sidebar" | "horizontal" | "drawer" | "none";
  stickyControls?: boolean;
  defaultView?: "grid" | "list";
  resultsPerPage?: number;
  initialSort?: string;
  /** Show a "Showing X–Y of Z results" line above the results. */
  showResultsSummary?: boolean;

  /** Composed-mode fallback children (Storybook / non-Sitecore). */
  children?: ReactNode;
  rendering?: unknown;
  dynamicPlaceholderId?: string;

  className?: string;
  id?: string;
}

function SearchExperienceInner({
  title,
  lead,
  headingLayout,
  headingSize,
  searchConfig,
  stickyControls = false,
  defaultView = "grid",
  resultsPerPage = 12,
  initialSort = "featured",
  showResultsSummary,
  colorScheme = "default",
  backgroundIntensity = "subtle",
  paddingY = "auto",
  maxWidth = "auto",
  children,
  rendering,
  dynamicPlaceholderId,
  className,
  id,
  layoutVariant,
}: SearchExperienceProps & {
  layoutVariant: "default" | "sidebar-facets";
}) {
  const controller = useSearchResults(searchConfig, {
    initialPageSize: resultsPerPage,
    initialSort,
    initialView: defaultView,
  });

  const wrapperClassName = useMemo(
    () =>
      cn(
        "component search-experience w-full bg-background text-foreground",
        resolveSectionSurfaceClass(colorScheme, backgroundIntensity),
        className?.trimEnd(),
      ),
    [className, colorScheme, backgroundIntensity],
  );

  const layout = useMemo(() => {
    // Variant owns the chrome layout. FacetPlacement used to force a
    // sidebar on Default (its recipe default is `sidebar`), which left
    // an empty `lg:w-72` gutter when authors chose Default / no facets.
    if (layoutVariant === "sidebar-facets") return "sidebar";
    return "stacked";
  }, [layoutVariant]);

  return (
    <SearchControllerProvider controller={controller}>
      <section
        className={wrapperClassName}
        id={id}
        dir="inherit"
        data-slot="search-experience"
      >
        <div
          className={cn(
            "container mx-auto px-4",
            paddingY === "auto"
              ? "py-12 md:py-16"
              : SECTION_PADDING_Y_CLASSES[paddingY],
          )}
        >
          <div
            className={cn(
              "@container mx-auto w-full",
              maxWidth === "auto"
                ? "max-w-6xl"
                : SECTION_MAX_WIDTH_CLASSES[maxWidth],
            )}
          >
            {(title || lead) && (
              <div className="mb-8">
                <SectionHeading
                  title={title}
                  lead={lead}
                  layout={parseHeadingLayout(
                    headingLayout,
                    "start-with-section-divider",
                  )}
                  headingOptions={{
                    size: parseHeadingSize(headingSize, "default"),
                  }}
                />
              </div>
            )}
            {showResultsSummary && controller.totalItems > 0 ? (
              <p
                className="mb-4 text-muted-foreground text-sm"
                data-slot="search-results-summary"
              >
                Showing {controller.resultRange.start}–
                {controller.resultRange.end} of {controller.totalItems} results
              </p>
            ) : null}
            <SearchLayout
              layout={layout}
              stickyControls={stickyControls}
              rendering={rendering}
              dynamicPlaceholderId={dynamicPlaceholderId}
              fallback={children}
            />
          </div>
        </div>
      </section>
    </SearchControllerProvider>
  );
}

function SearchLayout({
  layout,
  stickyControls,
  rendering,
  dynamicPlaceholderId,
  fallback,
}: {
  layout: "sidebar" | "stacked";
  stickyControls: boolean;
  rendering?: unknown;
  dynamicPlaceholderId?: string;
  fallback?: ReactNode;
}) {
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing);
  const envelope = rendering as ComponentRendering | undefined;
  const leadingKey = sxaPlaceholderName(
    envelope,
    "search-controls-leading",
    dynamicPlaceholderId,
  );
  const resultsKey = sxaPlaceholderName(
    envelope,
    "search-results",
    dynamicPlaceholderId,
  );
  const trailingKey = sxaPlaceholderName(
    envelope,
    "search-controls-trailing",
    dynamicPlaceholderId,
  );
  const leadingChildren = resolvePlaceholderChildren(
    envelope,
    "search-controls-leading",
    dynamicPlaceholderId ??
      (envelope as { params?: { DynamicPlaceholderId?: string } } | undefined)
        ?.params?.DynamicPlaceholderId,
  ).children;
  // Keep the facet column in Pages so authors can drop a Filter Panel.
  // On the published page an empty leading slot must not reserve lg:w-72.
  const showSidebar =
    layout === "sidebar" && (isEditing || leadingChildren.length > 0);

  if (showSidebar) {
    return (
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside
          className={cn(
            "w-full lg:w-72 lg:shrink-0",
            stickyControls && "lg:sticky lg:top-24 lg:self-start",
          )}
        >
          {rendering ? (
            <Placeholder name={leadingKey} rendering={rendering as never} />
          ) : (
            fallback
          )}
        </aside>
        <div className="min-w-0 flex-1 space-y-6">
          {rendering ? (
            <>
              <Placeholder name={resultsKey} rendering={rendering as never} />
              <Placeholder name={trailingKey} rendering={rendering as never} />
            </>
          ) : (
            fallback
          )}
        </div>
      </div>
    );
  }

  // A single horizontal controls row above the results is composed
  // by dropping a SearchControlsBar rendering into the leading slot
  // under the Default layout.

  return (
    <div className="space-y-6">
      {rendering ? (
        <>
          <div
            className={cn(
              stickyControls &&
                "sticky top-16 z-10 bg-background/95 backdrop-blur",
            )}
          >
            <Placeholder name={leadingKey} rendering={rendering as never} />
          </div>
          <Placeholder name={resultsKey} rendering={rendering as never} />
          <Placeholder name={trailingKey} rendering={rendering as never} />
        </>
      ) : (
        fallback
      )}
    </div>
  );
}

export function Default(props: SearchExperienceProps) {
  return <SearchExperienceInner {...props} layoutVariant="default" />;
}

export function SidebarFacets(props: SearchExperienceProps) {
  return <SearchExperienceInner {...props} layoutVariant="sidebar-facets" />;
}

export default Default;

export const componentType = "universal";
