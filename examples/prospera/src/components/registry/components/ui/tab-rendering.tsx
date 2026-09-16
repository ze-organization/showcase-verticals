"use client";

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
 * Flat props delivered by `withSitecore`'s default convention from the
 * `tab-rendering@1` recipe's fields.
 */
export interface TabRenderingProps extends CmsProps {
  label?: TextSource;
  content?: RichTextSource;
  description?: TextSource;
  triggerImage?: ImageSource;
  panelImage?: ImageSource;
  link?: LinkSource;
  /**
   * Per-placement digit suffix SXA injects when the rendering opts
   * into dynamic placeholders. Substituted into the
   * `tab-panel-<id>` slot name so the SDK's `^tab-panel-\d+$`
   * regex matches.
   */
  dynamicPlaceholderId?: string;
}

/**
 * Sitecore-registered "one tab" rendering — the layout-bearing
 * counterpart to the content-only `tabs-item@1` template. Same
 * datasource shape (Label / Content / Description / TriggerImage /
 * PanelImage / Link).
 *
 * The mental model (per the design owner):
 *
 *   - `tabs-item@1` is a CONTENT template — no layout, no styling
 *     options; a tabs component renders its values.
 *   - `tab-rendering@1` HAS layout: it renders its own field values
 *     AND exposes a `tab-panel-{*}` placeholder for composing extra
 *     renderings into the panel. Field values and the placeholder are
 *     no longer mutually exclusive variants — one merged body shows
 *     Content / PanelImage / Link (whatever is authored) followed by
 *     the composed placeholder children.
 *
 * Render paths:
 *
 *   1. **Inside `visual-tabs@1` / a tabs-block** — the parent
 *      enumerates its placeholder children and renders each child's
 *      fields as a real tab (trigger + panel). The parent never
 *      invokes this component's own render in that path.
 *
 *   2. **Standalone placement** (dropped directly on a page, or shown
 *      stacked inside the visual-tabs editing tray) — renders as a
 *      compact bordered "tab card": label heading + the merged panel
 *      body. Deliberately NOT a full single-tab `<Tabs>` shell — a
 *      stack of tab cards reads as "these are the tabs you've added",
 *      whereas a stack of complete tabs sections read as a broken
 *      tabs component (the exact confusion this replaced).
 *
 * `Default` and `Content` remain as exports because existing content
 * stores both variant names; they render the same merged body now.
 */
export function Default({
  label,
  content,
  description,
  panelImage,
  link,
  rendering,
  dynamicPlaceholderId,
  styles,
  id,
  isEditing,
}: TabRenderingProps & { rendering?: ComponentRendering }) {
  const { key: panelPlaceholderName } = resolvePlaceholderChildren(
    rendering,
    "tab-panel",
    dynamicPlaceholderId,
  );
  const hasPanelImage = panelImage != null && !isEmptySource(panelImage);
  const hasContent = content != null && !isEmptySource(content);
  const hasDescription = description != null && !isEmptySource(description);
  const hasLink = link != null && !isEmptySource(link);

  return (
    <div
      className={cn(
        "w-full rounded-[var(--card-radius,var(--radius-lg,0.75rem))] border border-border",
        styles?.trimEnd(),
      )}
      id={id}
      data-slot="tab-rendering"
    >
      <div className="border-border border-b px-4 py-2.5 font-heading font-semibold text-sm">
        <Text value={label} placeholder="Label" isEditing={isEditing} />
      </div>
      <div className="space-y-4 px-4 py-4 text-foreground">
        {hasPanelImage || isEditing ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            <Image
              value={panelImage}
              placeholder="Panel image"
              isEditing={isEditing}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : null}
        {hasContent || isEditing ? (
          <RichText
            value={content}
            placeholder="Content"
            isEditing={isEditing}
          />
        ) : hasDescription ? (
          <Text
            value={description}
            tag="p"
            placeholder="Description"
            isEditing={isEditing}
          />
        ) : null}
        {hasLink || isEditing ? (
          <div>
            <Link value={link} placeholder="Link" isEditing={isEditing} />
          </div>
        ) : null}
        {rendering ? (
          <Placeholder name={panelPlaceholderName} rendering={rendering} />
        ) : null}
      </div>
    </div>
  );
}

/**
 * `Content` variant — the datasource-content mode. Same body as
 * `Default` (both return `null`); the parent visual-tabs reads the
 * resolved variant name and does the rendering.
 */
export const Content = Default;

export default Default;

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants fail to resolve. No runtime behaviour change: the file
 * stays a plain RSC server component (no useState, no client-only
 * hooks here); the universal marker is purely a generate-map signal.
 */
export const componentType = "universal";
