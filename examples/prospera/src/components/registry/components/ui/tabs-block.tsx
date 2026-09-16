import type { ReactNode } from "react";
import { RailTabs } from "@/components/registry/blocks/rail-tabs";
import {
  parseHeadingAnimation,
  parseHeadingLayout,
  parseHeadingSize,
  SectionWrapper,
} from "@/components/registry/components/layout/section-wrapper";
import { EditPlaceholder } from "@/components/registry/primitives/core/edit-placeholder";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/registry/primitives/core/tabs";
import {
  type ImageSource,
  NextImage,
} from "@/components/registry/primitives/editables/image";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import {
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { hoistLinkedItemFields } from "@/lib/registry/placeholder-children";
import type { CmsProps, Field } from "@/lib/registry/sitecore";

/**
 * Per-tab field shape. Every variant uses the same fields; variants
 * differ in which fields they render (e.g. `Default` reads `Content`
 * while `ImageTriggers` reads `TriggerImage` / `PanelImage`).
 */
export interface TabsBlockItemFields {
  id?: string;
  Label?: TextSource;
  Content?: RichTextSource;
  TriggerImage?: ImageSource;
  PanelImage?: ImageSource;
  Link?: LinkSource;
}

/**
 * Flat props delivered by `withSitecore`'s default convention.
 *
 *   - `fields.Title` → `title`
 *   - `fields.Items` → `items`
 *   - `params.UseSectionWrapper` → `useSectionWrapper` (string/boolean)
 *   - `params.HeadingLayout` / `HeadingAnimation` / `HeadingSize` → camelCased
 */
export interface TabsBlockProps extends CmsProps {
  title?: TextSource;
  items?: TabsBlockItemFields[];
  /**
   * Search-mode config blob — populated by the `sai/search-source`
   * Marketplace plugin into the recipe's `SearchConfig` Plugin field
   * (see `tabs-block.recipe.ts`). Phase-1 wiring: type declared so the
   * field flows through `withSitecore`'s flattening; runtime dispatch
   * to `useSearchResults` lands when the parent surface is upgraded to
   * a client component. The Items Treelist source already accepts
   * both `tabs-item@1` and `tab-rendering@1` items so curated mode
   * works without a parallel adapter — search mode flows through the
   * same items pipeline once resolved.
   */
  searchConfig?: Field<string> | string;
  useSectionWrapper?: string | boolean;
  headingLayout?: string;
  headingAnimation?: string;
  headingSize?: string;
  /**
   * Horizontal placement of the tabs list within the block. Maps to
   * the shared `alignment@1` enum. `default` falls through to the
   * component's natural alignment (start). Logical — flips correctly
   * under RTL.
   */
  tabsAlignment?: "start" | "center" | "end";
  /**
   * Per-placement digit suffix SXA injects when the rendering is
   * marked `IsRenderingsWithDynamicPlaceholders=true`. The Headless
   * variant substitutes it into the `tabs-items-<id>` slot name so
   * the SDK's `^…-\d+$` regex matches and the placeholder resolves
   * — without this the Headless body never finds its children.
   */
  dynamicPlaceholderId?: string;
}

// Translate the shared alignment@1 token into a logical flex
// justify-content class. `default` and `start` both map to start so
// authors picking either get the same natural alignment.
const TABS_ALIGNMENT_CLASSES: Record<
  NonNullable<TabsBlockProps["tabsAlignment"]>,
  string
> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

function resolveTabsAlignmentClass(
  value: TabsBlockProps["tabsAlignment"] | undefined,
): string {
  if (!value) return TABS_ALIGNMENT_CLASSES.start;
  return TABS_ALIGNMENT_CLASSES[value] ?? TABS_ALIGNMENT_CLASSES.start;
}

function getImageAlt(value: ImageSource | undefined): string | undefined {
  if (value == null || typeof value !== "object") return undefined;
  if ("alt" in value && typeof value.alt === "string" && value.alt.trim()) {
    return value.alt.trim();
  }
  if ("value" in value) {
    const imageValue = value.value as { alt?: unknown } | undefined;
    if (
      imageValue != null &&
      typeof imageValue.alt === "string" &&
      imageValue.alt.trim()
    ) {
      return imageValue.alt.trim();
    }
  }
  return undefined;
}

/**
 * Resolve the rendered items list. If the caller didn't pass any, fall
 * back to a single placeholder tab so the editor surface still has a
 * trigger to render.
 */
function resolveItems(
  items: TabsBlockItemFields[] | undefined,
): [TabsBlockItemFields, ...TabsBlockItemFields[]] {
  // Hoist nested `{id, fields: {…}}` linked items (raw layout-service
  // shape). The showcase's generated map flattens Items before the
  // component sees them, but installed starters regenerate their map
  // without the sibling recipe the Treelist discovery needs — items
  // arrive nested there and every field read (`item.Label`,
  // `item.TriggerImage`, …) silently missed. Reading both shapes is
  // the link-list precedent.
  const hoisted = hoistLinkedItemFields<TabsBlockItemFields>(items);
  if (hoisted.length && hoisted.some((item) => item != null)) {
    return hoisted as [TabsBlockItemFields, ...TabsBlockItemFields[]];
  }
  return [{ id: "tab-0" }];
}

/** Stable per-tab id for keys + aria wiring. */
function tabId(item: TabsBlockItemFields, index: number): string {
  return item.id ?? `tab-${index}`;
}

/**
 * Shared per-tab panel body: rich-text content, optional panel image
 * (rendered unconditionally in editing mode so the empty slot stays
 * clickable), and optional CTA link. Used by the `Default` variant's
 * tab panels and the `VerticalRails` variant's expanding panels.
 */
function TabPanelFields({
  item,
  isEditing,
}: {
  item: TabsBlockItemFields;
  isEditing?: boolean;
}) {
  const panelImage =
    item.PanelImage != null && !isEmptySource(item.PanelImage)
      ? item.PanelImage
      : undefined;
  const link =
    item.Link != null && !isEmptySource(item.Link) ? item.Link : undefined;
  const showImageSlot = panelImage != null || isEditing;
  return (
    <>
      <RichText
        value={item.Content}
        placeholder="Content"
        isEditing={isEditing}
        data-slot="rich-text"
      />
      {showImageSlot ? (
        <div className="overflow-hidden rounded-lg">
          {link ? (
            <Link
              value={link}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <NextImage
                value={panelImage}
                placeholder="Panel image"
                isEditing={isEditing}
                className="h-auto w-full object-cover"
                width={1200}
                height={600}
              />
            </Link>
          ) : (
            <NextImage
              value={panelImage}
              placeholder="Panel image"
              isEditing={isEditing}
              className="h-auto w-full object-cover"
              width={1200}
              height={600}
            />
          )}
        </div>
      ) : null}
      {!panelImage && link ? (
        <Link
          value={link}
          className="inline-flex items-center text-primary hover:underline"
        />
      ) : null}
    </>
  );
}

/**
 * Shared section shell — heading, optional section wrapper, and the
 * variant-supplied tabs content. Keeps the heading-handling logic in
 * one place so the variant exports can focus on tab body rendering.
 */
function TabsSection({
  title,
  useSectionWrapper,
  headingLayout,
  headingAnimation,
  headingSize,
  styles,
  id,
  isEditing,
  children,
  ariaFallback,
}: TabsBlockProps & { children: ReactNode; ariaFallback: string }) {
  const hasTitle = title != null && !isEmptySource(title);
  const layout = parseHeadingLayout(
    headingLayout,
    "start-with-section-divider",
  );
  const animation = parseHeadingAnimation(headingAnimation, "none");
  const size = parseHeadingSize(headingSize, "default");

  // Inline mirror of section-heading.helpers' isEnabledStrict so the
  // no-title branch honors the same Sitecore string-boolean shapes
  // that the SectionWrapper path uses — without it, UseSectionWrapper
  // is silently a no-op when the author leaves the heading blank.
  const isContained = (() => {
    if (typeof useSectionWrapper === "boolean") return useSectionWrapper;
    if (!useSectionWrapper) return false;
    return ["1", "true", "yes", "on", "enabled"].includes(
      useSectionWrapper.trim().toLowerCase(),
    );
  })();
  const containedClass = isContained ? "mx-auto w-full max-w-2xl" : "w-full";

  // Always render through SectionWrapper when a heading is present.
  // `useSectionWrapper` pipes straight through — SectionWrapper owns
  // the contained-vs-full-width toggle so the boolean behaves
  // identically across every component that consumes it. The
  // no-title branches apply the same contained class manually so the
  // toggle isn't silently dropped when the heading is blank.
  return (
    <section
      id={id}
      className={cn(
        "component tabs-block w-full text-foreground",
        styles?.trimEnd(),
      )}
      aria-label={hasTitle ? undefined : ariaFallback}
      data-slot="tabs-block"
    >
      <div className="container mx-auto px-4 py-8 md:py-12">
        {hasTitle ? (
          <SectionWrapper
            title={title}
            layout={layout}
            headingOptions={{ animation, size }}
            useSectionWrapper={useSectionWrapper}
          >
            {children}
          </SectionWrapper>
        ) : isEditing ? (
          <>
            <EditPlaceholder kind="Heading" variant="block" />
            <div className={containedClass}>{children}</div>
          </>
        ) : (
          <div className={containedClass}>{children}</div>
        )}
      </div>
    </section>
  );
}

/**
 * Default tab variant: text-labeled triggers + rich-text content panels.
 * The bread-and-butter tabbed content surface.
 */
export function Default(props: TabsBlockProps) {
  const items = resolveItems(props.items);
  const ariaTitle = getSourceText(props.title);
  const alignmentClass = resolveTabsAlignmentClass(props.tabsAlignment);

  return (
    <TabsSection {...props} ariaFallback="Tabs">
      <Tabs defaultValue={tabId(items[0], 0)} className="w-full">
        <TabsList
          variant="line"
          className={cn("mb-4 flex w-full flex-wrap gap-2", alignmentClass)}
          aria-label={ariaTitle ? `${ariaTitle} tabs` : "Content tabs"}
        >
          {items.map((item, index) => {
            const value = tabId(item, index);
            const hasLabel = item.Label != null && !isEmptySource(item.Label);
            return (
              <TabsTrigger key={value} value={value} variant="line">
                {hasLabel ? (
                  <Text value={item.Label} tag="span" />
                ) : props.isEditing ? (
                  <EditPlaceholder kind={`Tab ${index + 1}`} />
                ) : (
                  <span>Tab {index + 1}</span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {items.map((item, index) => {
          const value = tabId(item, index);
          return (
            <TabsContent
              key={value}
              value={value}
              // Force-mount inactive panels in editing mode so Pages
              // chrome can wire inline-edit handles to every tab's
              // children — Radix's default unmounts inactive panels
              // and tore the handles off when authors toggled tabs.
              //
              // A11y: Radix sets `hidden={!selected}` on Tabs.Content
              // (the HTML attribute, not just `data-state`). Browsers
              // skip `hidden` elements for tab order AND the
              // accessibility tree, so inactive panels and their
              // children are correctly non-focusable + unannounced
              // even with `forceMount`. The Tailwind class below is
              // a belt-and-braces visual hide.
              //
              // Panel image renders below the rich-text content (see
              // TabPanelFields): the slot is rendered unconditionally
              // in editing mode so an empty panelImage surfaces an
              // EditPlaceholder the author can click; in runtime mode
              // the slot is omitted entirely when there's no image.
              forceMount={props.isEditing ? true : undefined}
              className="mt-2 space-y-4 p-0 data-[state=inactive]:hidden"
            >
              <TabPanelFields item={item} isEditing={props.isEditing} />
            </TabsContent>
          );
        })}
      </Tabs>
    </TabsSection>
  );
}

/**
 * Image-triggers variant: each trigger is a logo/icon, the panel
 * renders the panel image at large scale with optional CTA link.
 * Used for partner-logo strips, sponsor showcases, etc.
 *
 * Different rendering composition (image triggers + image panels)
 * than `Default` — per the variant-vs-parameter rule, this warrants
 * its own variant export rather than a tabsStyle param.
 */
export function ImageTriggers(props: TabsBlockProps) {
  const items = resolveItems(props.items);
  const ariaTitle = getSourceText(props.title);
  const alignmentClass = resolveTabsAlignmentClass(props.tabsAlignment);

  return (
    <TabsSection {...props} ariaFallback="Tabs">
      <Tabs defaultValue={tabId(items[0], 0)} className="w-full">
        <TabsList
          variant="line"
          className={cn("mb-4 flex w-full flex-wrap gap-2", alignmentClass)}
          aria-label={ariaTitle ? `${ariaTitle} tabs` : "Content tabs"}
        >
          {items.map((item, index) => {
            const value = tabId(item, index);
            const hasImage =
              item.TriggerImage != null && !isEmptySource(item.TriggerImage);
            const hasLabel = item.Label != null && !isEmptySource(item.Label);
            return (
              <TabsTrigger
                key={value}
                value={value}
                variant="line"
                aria-label={
                  hasLabel
                    ? undefined
                    : (getImageAlt(item.TriggerImage) ?? `Tab ${index + 1}`)
                }
              >
                <span className="flex flex-col items-center gap-1">
                  {item.TriggerImage != null &&
                  !isEmptySource(item.TriggerImage) ? (
                    /*
                      object-cover, not object-contain: the trigger image is a
                      media tile, and contain letterboxes any aspect mismatch
                      against the bg-muted backdrop — grey bands above/below
                      the photo. The tile crops instead; bg-muted only shows
                      while the image loads.
                    */
                    <span className="block h-8 w-16 overflow-hidden rounded bg-muted">
                      <NextImage
                        value={item.TriggerImage}
                        className="h-full w-full object-cover"
                        width={64}
                        height={32}
                      />
                    </span>
                  ) : null}
                  {hasLabel ? <Text value={item.Label} tag="span" /> : null}
                  {!hasImage && !hasLabel ? (
                    props.isEditing ? (
                      <EditPlaceholder kind={`Tab ${index + 1}`} />
                    ) : (
                      <span>Tab {index + 1}</span>
                    )
                  ) : null}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {items.map((item, index) => {
          const value = tabId(item, index);
          const panelImage =
            item.PanelImage != null && !isEmptySource(item.PanelImage)
              ? item.PanelImage
              : item.TriggerImage != null && !isEmptySource(item.TriggerImage)
                ? item.TriggerImage
                : undefined;
          const link =
            item.Link != null && !isEmptySource(item.Link)
              ? item.Link
              : undefined;
          return (
            <TabsContent
              key={value}
              value={value}
              forceMount={props.isEditing ? true : undefined}
              className="mt-2 p-0 data-[state=inactive]:hidden"
            >
              {panelImage ? (
                <div className="flex flex-wrap items-center justify-center gap-8 rounded-lg border border-border bg-muted/30 p-8">
                  {link ? (
                    <Link
                      value={link}
                      className="flex focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <NextImage
                        value={panelImage}
                        className="max-h-16 w-auto object-contain"
                        width={160}
                        height={64}
                      />
                    </Link>
                  ) : (
                    <NextImage
                      value={panelImage}
                      className="max-h-16 w-auto object-contain"
                      width={160}
                      height={64}
                    />
                  )}
                </div>
              ) : props.isEditing ? (
                <EditPlaceholder kind="Image" variant="block" />
              ) : null}
            </TabsContent>
          );
        })}
      </Tabs>
    </TabsSection>
  );
}

/**
 * Vertical-rails variant: the tabs render as a row of collapsed
 * vertical rails with rotated labels; selecting a rail expands its
 * panel to fill the remaining width with an animated wipe (the diageo
 * home-page pattern). Same per-tab field schema as `Default` — Label
 * drives the rail, Content / PanelImage / Link fill the expanding
 * panel via the shared `TabPanelFields` body.
 *
 * Structurally distinct composition (horizontal accordion rails vs a
 * trigger strip over stacked panels) — per the variant-vs-parameter
 * rule this is its own export, not a TabsStyle param. The interaction
 * lives in the CMS-agnostic `RailTabs` block.
 */
export function VerticalRails(props: TabsBlockProps) {
  const items = resolveItems(props.items);
  const ariaTitle = getSourceText(props.title);

  return (
    <TabsSection {...props} ariaFallback="Tabs">
      <RailTabs
        ariaLabel={ariaTitle ? `${ariaTitle} tabs` : "Content tabs"}
        items={items.map((item, index) => {
          const value = tabId(item, index);
          const hasLabel = item.Label != null && !isEmptySource(item.Label);
          return {
            id: value,
            label: hasLabel ? (
              <Text value={item.Label} tag="span" />
            ) : props.isEditing ? (
              <EditPlaceholder kind={`Tab ${index + 1}`} />
            ) : (
              <span>Tab {index + 1}</span>
            ),
            content: (
              <div className="space-y-4">
                <TabPanelFields item={item} isEditing={props.isEditing} />
              </div>
            ),
          };
        })}
      />
    </TabsSection>
  );
}

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * named-export variants fail to resolve. No runtime
 * behaviour change: the file stays a plain RSC server component
 * (no useState, no client-only hooks here); the universal marker
 * is purely a generate-map signal.
 */
export const componentType = "universal";
