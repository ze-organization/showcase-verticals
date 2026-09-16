import type { ReactNode } from "react";
import {
  parseHeadingAnimation,
  parseHeadingLayout,
  parseHeadingSize,
  SectionWrapper,
} from "@/components/registry/components/layout/section-wrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/registry/primitives/core/accordion";
import { EditPlaceholder } from "@/components/registry/primitives/core/edit-placeholder";
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
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
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
 * `visual-accordion@1` — placeholder-composed accordion; the
 * accordion sibling of `visual-tabs@1`.
 *
 * The field-driven `accordion-block@1` sources rows from an Items
 * Treelist; THIS component sources them from a Sitecore placeholder:
 * authors drop `accordion-item-rendering@1` items into
 * `visual-accordion-{*}` and **each dropped rendering becomes another
 * accordion ROW** — trigger from its Title, panel from its Content /
 * Description / Image / Link plus its own `accordion-panel-{*}`
 * placeholder for composed renderings. No Items field — the
 * placeholder is the item list.
 *
 * EDITING: the canvas renders the raw `<Placeholder>` (stacked
 * editable item cards with full Pages chrome) so authors add /
 * reorder / delete rows visually; the accordion presentation is the
 * preview / published render.
 */

interface VisualAccordionChildFields {
  Title?: TextSource;
  Content?: RichTextSource;
  Description?: TextSource;
  Image?: ImageSource;
  Link?: LinkSource;
}

interface VisualAccordionChild {
  uid?: string;
  componentName?: string;
  fields?: VisualAccordionChildFields;
  params?: Record<string, unknown>;
}

export interface VisualAccordionProps extends CmsProps {
  heading?: TextSource;
  useSectionWrapper?: string | boolean;
  headingLayout?: string;
  headingAnimation?: string;
  headingSize?: string;
  dynamicPlaceholderId?: string;
  /**
   * Index of the row to render already expanded (0-based). Author and
   * preview seam only — Radix keeps a collapsed panel out of the DOM
   * entirely, so with every row shut a static preview paints a stack of
   * bare triggers and no panel body can be seen or measured.
   */
  defaultOpenIndex?: number;
}

function childItemId(child: VisualAccordionChild, index: number): string {
  return child.uid ?? `item-${index}`;
}

/**
 * Resolve `defaultOpenIndex` to the Accordion `value` of that row.
 * Returns undefined for an unset or out-of-range index so a bad author
 * value degrades to "all collapsed" rather than throwing.
 */
function openValue(
  children: VisualAccordionChild[],
  index: number | undefined,
): string | undefined {
  if (index == null) return undefined;
  const child = children[index];
  return child ? childItemId(child, index) : undefined;
}

/** One row's panel — authored fields plus the composed placeholder. */
function ChildPanelBody({
  child,
  index,
}: {
  child: VisualAccordionChild;
  index: number;
}) {
  const fields = child.fields ?? {};
  const hasContent = fields.Content != null && !isEmptySource(fields.Content);
  const hasDescription =
    fields.Description != null && !isEmptySource(fields.Description);
  const image =
    fields.Image != null && !isEmptySource(fields.Image)
      ? fields.Image
      : undefined;
  const link =
    fields.Link != null && !isEmptySource(fields.Link)
      ? fields.Link
      : undefined;
  const { key: panelKey, children: panelChildren } = resolvePlaceholderChildren(
    child as ComponentRendering,
    "accordion-panel",
    (child.params?.DynamicPlaceholderId as string | undefined) ??
      String(index + 1),
  );
  return (
    <div className="space-y-4">
      {image ? (
        <div className="overflow-hidden rounded-lg">
          <NextImage
            value={image}
            className="h-auto w-full object-cover"
            width={1200}
            height={600}
          />
        </div>
      ) : null}
      {hasContent ? (
        <RichText value={fields.Content} data-slot="rich-text" />
      ) : hasDescription ? (
        <Text value={fields.Description} tag="p" />
      ) : null}
      {link ? (
        <div>
          <Link
            value={link}
            className="inline-flex items-center text-primary hover:underline"
          />
        </div>
      ) : null}
      {panelChildren.length > 0 ? (
        <Placeholder name={panelKey} rendering={child as ComponentRendering} />
      ) : null}
    </div>
  );
}

/** Section shell — mirrors accordion-block's heading handling (lean form). */
function VisualAccordionSection({
  heading,
  useSectionWrapper,
  headingLayout,
  headingAnimation,
  headingSize,
  styles,
  id,
  isEditing,
  children,
}: VisualAccordionProps & { children: ReactNode }) {
  const hasHeading = heading != null && !isEmptySource(heading);
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
        "component visual-accordion w-full text-foreground",
        styles?.trimEnd(),
      )}
      aria-label={hasHeading ? undefined : "Accordion"}
      data-slot="visual-accordion"
    >
      <div className="container mx-auto px-4 py-8 md:py-12">
        {hasHeading ? (
          <SectionWrapper
            title={heading}
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

export function Default(
  props: VisualAccordionProps & { rendering?: ComponentRendering },
) {
  const { key: itemsKey, children } =
    resolvePlaceholderChildren<VisualAccordionChild>(
      props.rendering,
      "visual-accordion",
      props.dynamicPlaceholderId,
    );

  // EDITING (or empty): raw Placeholder → stacked editable item cards
  // with drop chrome. See visual-tabs for the rationale.
  if (props.isEditing || children.length === 0) {
    return (
      <VisualAccordionSection {...props}>
        {props.rendering ? (
          <div className="space-y-3" data-slot="visual-accordion-editing-tray">
            <Placeholder name={itemsKey} rendering={props.rendering} />
          </div>
        ) : props.isEditing ? (
          <EditPlaceholder kind="Accordion item" variant="block" />
        ) : null}
      </VisualAccordionSection>
    );
  }

  return (
    <VisualAccordionSection {...props}>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={openValue(children, props.defaultOpenIndex)}
      >
        {children.map((child, index) => {
          const value = childItemId(child, index);
          return (
            <AccordionItem key={value} value={value}>
              <AccordionTrigger className="text-start">
                <Text value={child.fields?.Title} tag="span" />
              </AccordionTrigger>
              <AccordionContent>
                <ChildPanelBody child={child} index={index} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </VisualAccordionSection>
  );
}

export default Default;

/** See tabs-block.tsx for the universal-map rationale. */
export const componentType = "universal";
