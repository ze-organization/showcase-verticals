"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/registry/primitives/core/accordion";
import {
  NextImage as Image,
  type ImageSource,
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
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  type CmsProps,
  type ComponentRendering,
  Placeholder,
} from "@/lib/registry/sitecore";

/**
 * Flat props delivered by `withSitecore`'s default convention from the
 * `accordion-item-rendering@1` recipe's fields.
 */
export interface AccordionItemRenderingProps extends CmsProps {
  title?: TextSource;
  content?: RichTextSource;
  description?: TextSource;
  image?: ImageSource;
  link?: LinkSource;
  /**
   * Per-placement digit suffix SXA injects when the rendering opts
   * into dynamic placeholders. Substituted into the
   * `accordion-panel-<id>` slot name so the SDK's
   * `^accordion-panel-\d+$` regex matches.
   */
  dynamicPlaceholderId?: string;
  /**
   * Render this row already expanded. Author and preview seam only —
   * outside editing the panel starts collapsed and Radix keeps a
   * collapsed panel out of the DOM, so a static preview paints a bare
   * trigger and the panel body can never be seen or measured.
   */
  defaultOpen?: boolean;
}

/**
 * Sitecore-registered "accordion item" rendering — the visual-editing
 * counterpart to the content-only `accordion-item@1` template.
 *
 * Two Sitecore Variants:
 *
 *   - `Default`  — the panel is an `accordion-panel-{*}` placeholder
 *                  (drop arbitrary renderings into the panel body).
 *   - `Content`  — the panel renders the datasource content
 *                  (Content / Description / Image / Link), same shape
 *                  a content-driven Accordion Item would render.
 *
 * Two render paths:
 *
 *   1. **Inside a visual-accordion** — the parent's
 *      React iterates `props.rendering.placeholders["accordion-items-<id>"]`
 *      and renders each child manually with its own `<Accordion>` /
 *      `<AccordionItem>` wrappers, reading the child's `fields` and
 *      `params.FieldNames` to pick the right treatment. The parent
 *      never invokes the child's own React render in that path.
 *
 *   2. **Standalone placement** — dropped directly onto a page or any
 *      other placeholder, the rendering self-renders into a
 *      single-item collapsible `<Accordion>` shell so authors see a
 *      working accordion item without having to wrap it in an
 *      accordion-block first. Earlier this file exported `null` for
 *      both variants, which made standalone placements invisible and
 *      confused authors into thinking the rendering had no
 *      implementation.
 *
 * The standalone shells use Radix's `<Accordion type="single"
 * collapsible>` so a single rendering still behaves like an
 * interactive accordion item (the trigger toggles the panel).
 */
export function Default({
  title,
  rendering,
  dynamicPlaceholderId,
  styles,
  id,
  isEditing,
  defaultOpen,
}: AccordionItemRenderingProps & { rendering?: ComponentRendering }) {
  const phSuffix = dynamicPlaceholderId ?? "1";
  const panelPlaceholderName = `accordion-panel-${phSuffix}`;
  return (
    <Accordion
      type="single"
      collapsible
      className={cn("w-full", styles?.trimEnd())}
      defaultValue={isEditing || defaultOpen ? "item" : undefined}
      id={id}
    >
      <AccordionItem value="item">
        <AccordionTrigger className="text-start">
          <Text value={title} placeholder="Title" isEditing={isEditing} />
        </AccordionTrigger>
        <AccordionContent className="text-foreground">
          {rendering ? (
            <Placeholder name={panelPlaceholderName} rendering={rendering} />
          ) : null}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function Content({
  title,
  content,
  description,
  image,
  link,
  styles,
  id,
  isEditing,
  defaultOpen,
}: AccordionItemRenderingProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn("w-full", styles?.trimEnd())}
      defaultValue={isEditing || defaultOpen ? "item" : undefined}
      id={id}
    >
      <AccordionItem value="item">
        <AccordionTrigger className="text-start">
          <Text value={title} placeholder="Title" isEditing={isEditing} />
        </AccordionTrigger>
        <AccordionContent className="space-y-4 text-foreground">
          {image ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
              <Image
                value={image}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : null}
          {content ? (
            <RichText
              value={content}
              placeholder="Content"
              isEditing={isEditing}
            />
          ) : description ? (
            <Text
              value={description}
              tag="p"
              placeholder="Description"
              isEditing={isEditing}
            />
          ) : null}
          {link ? (
            <div>
              <Link value={link} isEditing={isEditing} />
            </div>
          ) : null}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default Default;

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
