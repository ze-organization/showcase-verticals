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
import { resolvePlaceholderChildren } from "@/lib/registry/placeholder-children";
import {
  type CmsProps,
  type ComponentRendering,
  Placeholder,
} from "@/lib/registry/sitecore";

/**
 * `visual-tabs@1` — placeholder-composed tabs.
 *
 * The field-driven `tabs-block@1` sources its tabs from an Items
 * Treelist; THIS component sources them from a Sitecore placeholder:
 * authors drop `tab-rendering@1` items into `visual-tabs-{*}` and
 * **each dropped rendering becomes another TAB** — trigger from its
 * Label / TriggerImage, panel from its Content / PanelImage / Link
 * plus its own nested `tab-panel-{*}` placeholder for composed
 * renderings. No Items field, no SearchConfig — the placeholder IS
 * the item list.
 *
 * It keeps the full display-variant axis of tabs-block:
 * `Default` (text triggers) / `ImageTriggers` (media-tile triggers) /
 * `VerticalRails` (diageo expanding rails).
 *
 * EDITING: the canvas renders the raw `<Placeholder>` — each tab shows
 * as a compact stacked "tab card" (tab-rendering's standalone render)
 * with full Pages chrome, so authors can add / select / reorder /
 * delete tabs visually. The tabbed presentation itself is what
 * preview / published mode shows.
 */

interface VisualTabChildFields {
  Label?: TextSource;
  Content?: RichTextSource;
  Description?: TextSource;
  TriggerImage?: ImageSource;
  PanelImage?: ImageSource;
  Link?: LinkSource;
}

interface VisualTabChild {
  uid?: string;
  componentName?: string;
  fields?: VisualTabChildFields;
  params?: Record<string, unknown>;
}

export interface VisualTabsProps extends CmsProps {
  title?: TextSource;
  useSectionWrapper?: string | boolean;
  headingLayout?: string;
  headingAnimation?: string;
  headingSize?: string;
  /** Horizontal placement of the tabs list. Defaults to `start`. */
  tabsAlignment?: "start" | "center" | "end";
  dynamicPlaceholderId?: string;
}

const TABS_ALIGNMENT_CLASSES: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

function alignmentClassOf(value: VisualTabsProps["tabsAlignment"]): string {
  return TABS_ALIGNMENT_CLASSES[value ?? "start"] ?? "justify-start";
}

function childTabId(child: VisualTabChild, index: number): string {
  return child.uid ?? `tab-${index}`;
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
 * One tab's panel: the child's authored fields (Content, PanelImage,
 * Link) followed by its composed `tab-panel-{*}` placeholder children.
 * Fields and placeholder are additive — the design owner's model is
 * "field values display AND the placeholder composes more".
 */
function ChildPanelBody({
  child,
  index,
}: {
  child: VisualTabChild;
  index: number;
}) {
  const fields = child.fields ?? {};
  const panelImage =
    fields.PanelImage != null && !isEmptySource(fields.PanelImage)
      ? fields.PanelImage
      : undefined;
  const hasContent = fields.Content != null && !isEmptySource(fields.Content);
  const hasDescription =
    fields.Description != null && !isEmptySource(fields.Description);
  const link =
    fields.Link != null && !isEmptySource(fields.Link)
      ? fields.Link
      : undefined;
  const { key: panelKey, children: panelChildren } = resolvePlaceholderChildren(
    child as ComponentRendering,
    "tab-panel",
    (child.params?.DynamicPlaceholderId as string | undefined) ??
      String(index + 1),
  );
  return (
    <div className="space-y-4">
      {hasContent ? (
        <RichText value={fields.Content} data-slot="rich-text" />
      ) : hasDescription ? (
        <Text value={fields.Description} tag="p" />
      ) : null}
      {panelImage ? (
        <div className="overflow-hidden rounded-lg">
          {link ? (
            <Link
              value={link}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <NextImage
                value={panelImage}
                className="h-auto w-full object-cover"
                width={1200}
                height={600}
              />
            </Link>
          ) : (
            <NextImage
              value={panelImage}
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
      {panelChildren.length > 0 ? (
        <Placeholder name={panelKey} rendering={child as ComponentRendering} />
      ) : null}
    </div>
  );
}

/** Section shell — mirrors tabs-block's heading handling. */
function VisualTabsSection({
  title,
  useSectionWrapper,
  headingLayout,
  headingAnimation,
  headingSize,
  styles,
  id,
  isEditing,
  children,
}: VisualTabsProps & { children: ReactNode }) {
  const hasTitle = title != null && !isEmptySource(title);
  const layout = parseHeadingLayout(
    headingLayout,
    "start-with-section-divider",
  );
  const animation = parseHeadingAnimation(headingAnimation, "none");
  const size = parseHeadingSize(headingSize, "default");
  const isContained = (() => {
    if (typeof useSectionWrapper === "boolean") return useSectionWrapper;
    if (!useSectionWrapper) return false;
    return ["1", "true", "yes", "on", "enabled"].includes(
      useSectionWrapper.trim().toLowerCase(),
    );
  })();
  const containedClass = isContained ? "mx-auto w-full max-w-2xl" : "w-full";
  return (
    <section
      id={id}
      className={cn(
        "component visual-tabs w-full text-foreground",
        styles?.trimEnd(),
      )}
      aria-label={hasTitle ? undefined : "Tabs"}
      data-slot="visual-tabs"
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

type VariantMode = "text" | "image-triggers" | "vertical-rails";

function VisualTabsBase(
  props: VisualTabsProps & { rendering?: ComponentRendering },
  mode: VariantMode,
) {
  const ariaTitle = getSourceText(props.title);
  const alignmentClass = alignmentClassOf(props.tabsAlignment);
  const { key: itemsKey, children } =
    resolvePlaceholderChildren<VisualTabChild>(
      props.rendering,
      "visual-tabs",
      props.dynamicPlaceholderId,
    );

  // EDITING (or an empty slot): mount the raw Placeholder so Pages
  // chrome can add / select / reorder tab renderings. Each child shows
  // as tab-rendering's compact standalone "tab card". The tabbed
  // presentation below is the preview / published render.
  if (props.isEditing || children.length === 0) {
    return (
      <VisualTabsSection {...props}>
        {props.rendering ? (
          <div className="space-y-3" data-slot="visual-tabs-editing-tray">
            <Placeholder name={itemsKey} rendering={props.rendering} />
          </div>
        ) : props.isEditing ? (
          <EditPlaceholder kind="Tab" variant="block" />
        ) : null}
      </VisualTabsSection>
    );
  }

  const first = children[0];
  const firstValue = first ? childTabId(first, 0) : "tab-0";

  if (mode === "vertical-rails") {
    return (
      <VisualTabsSection {...props}>
        <RailTabs
          ariaLabel={ariaTitle ? `${ariaTitle} tabs` : "Content tabs"}
          defaultItemId={firstValue}
          items={children.map((child, index) => ({
            id: childTabId(child, index),
            label: <Text value={child.fields?.Label} tag="span" />,
            content: <ChildPanelBody child={child} index={index} />,
          }))}
        />
      </VisualTabsSection>
    );
  }

  return (
    <VisualTabsSection {...props}>
      <Tabs defaultValue={firstValue} className="w-full">
        <TabsList
          variant="line"
          className={cn("mb-4 flex w-full flex-wrap gap-2", alignmentClass)}
          aria-label={ariaTitle ? `${ariaTitle} tabs` : "Content tabs"}
        >
          {children.map((child, index) => {
            const value = childTabId(child, index);
            const triggerImage = child.fields?.TriggerImage;
            const hasImage =
              mode === "image-triggers" &&
              triggerImage != null &&
              !isEmptySource(triggerImage);
            const hasLabel =
              child.fields?.Label != null && !isEmptySource(child.fields.Label);
            return (
              <TabsTrigger
                key={value}
                value={value}
                variant="line"
                aria-label={
                  hasLabel
                    ? undefined
                    : (getImageAlt(triggerImage) ?? `Tab ${index + 1}`)
                }
              >
                <span className="flex flex-col items-center gap-1">
                  {hasImage ? (
                    /* object-cover media tile — mirrors tabs-block
                       ImageTriggers (contain letterboxed against the
                       muted backdrop). */
                    <span className="block h-8 w-16 overflow-hidden rounded bg-muted">
                      <NextImage
                        value={triggerImage}
                        className="h-full w-full object-cover"
                        width={64}
                        height={32}
                      />
                    </span>
                  ) : null}
                  {hasLabel ? (
                    <Text value={child.fields?.Label} tag="span" />
                  ) : !hasImage ? (
                    <span>Tab {index + 1}</span>
                  ) : null}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {children.map((child, index) => (
          <TabsContent
            key={childTabId(child, index)}
            value={childTabId(child, index)}
            className="space-y-4 text-foreground"
          >
            <ChildPanelBody child={child} index={index} />
          </TabsContent>
        ))}
      </Tabs>
    </VisualTabsSection>
  );
}

export function Default(
  props: VisualTabsProps & { rendering?: ComponentRendering },
) {
  return VisualTabsBase(props, "text");
}

export function ImageTriggers(
  props: VisualTabsProps & { rendering?: ComponentRendering },
) {
  return VisualTabsBase(props, "image-triggers");
}

export function VerticalRails(
  props: VisualTabsProps & { rendering?: ComponentRendering },
) {
  return VisualTabsBase(props, "vertical-rails");
}

export default Default;

/** See tabs-block.tsx for the universal-map rationale. */
export const componentType = "universal";
