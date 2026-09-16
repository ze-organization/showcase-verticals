import type { ReactNode } from "react";
import {
  parseHeadingAnimation,
  parseHeadingLayout,
  parseHeadingLevel,
  parseHeadingSize,
  SectionWrapper,
} from "@/components/registry/components/layout/section-wrapper";
import { Prose } from "@/components/registry/primitives/core/prose";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  headingColorClass,
  parseHeadingColor,
  parseProseLeading,
  parseProseSize,
  proseLeadingClass,
  proseSizeClass,
} from "@/lib/registry/param-parsers";
import { resolvePlaceholderChildren } from "@/lib/registry/placeholder-children";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";

/**
 * Shared props for the content-block variants (Default, Placeholders).
 * Each variant takes the flat shape
 * `withSitecore`'s default convention produces — `fields.Title` arrives
 * as `title`, `params.HeadingLayout` as `headingLayout`, and so on.
 *
 * Heading rendering goes through SectionWrapper unconditionally — the
 * older `UseSectionWrapper` boolean was a footgun (HeadingLayout /
 * HeadingAnimation / HeadingSize only fired when it was checked,
 * which was confusing dependent logic). The recipe drives the layout
 * choice; authors pick `start` for a plain start-aligned heading.
 */
export interface ContentBlockProps extends CmsProps {
  title?: TextSource;
  /**
   * Optional kicker line rendered above the heading through the shared
   * Eyebrow block. Styled by `eyebrowColorScheme` / `eyebrowSize` /
   * `eyebrowStyle`.
   */
  eyebrow?: TextSource;
  body?: RichTextSource;
  /**
   * Eyebrow tint (color-scheme@1). Defaults to `primary` via the
   * recipe's param default.
   */
  eyebrowColorScheme?: string;
  /** Eyebrow size override (size@1). `default` keeps the block scale. */
  eyebrowSize?: string;
  /**
   * Eyebrow treatment (eyebrow-style@1): `text` (small-caps line,
   * default) or `badge` (soft-surface pill chip). The `eyebrow`/`pill`
   * aliases are accepted too.
   */
  eyebrowStyle?: string;
  headingLayout?: string;
  headingAnimation?: string;
  headingSize?: string;
  /**
   * Color of the heading's accent scribble + section-divider hairline
   * (color-scheme@1). `default` inherits today's colors. Threaded to
   * SectionWrapper's headingOptions.
   */
  accentLineColor?: string;
  /**
   * Semantic heading tag for the title slot. Sitecore enum
   * `heading-level@1`. Independent of `headingSize` — level controls
   * the document outline, size controls the typographic scale.
   */
  headingLevel?: string;
  /**
   * Heading text color override. Sitecore enum `heading-color@1`.
   * `default` inherits `text-foreground`; other roles compile to
   * `text-<role>` ("role text on page" composition per the
   * `color-roles` skill).
   */
  headingColor?: string;
  /**
   * Line-height for the prose body. Sitecore enum `prose-leading@1`.
   * Independent of `proseSize` — leading is rhythm, size is scale.
   */
  proseLeading?: string;
  /**
   * Body copy size override. Sitecore enum `prose-size@1`. Applied to
   * the Prose container so paragraphs, lists, and quotes inherit it
   * through the cascade.
   */
  proseSize?: string;
  /**
   * Inner content-width toggle. Threads straight through to the
   * SectionWrapper helper, which is the single source of truth for
   * contained vs full-width across every wrapping component. Accepts
   * Sitecore string booleans.
   */
  useSectionWrapper?: string | boolean;
  /**
   * Inline alignment of the heading + body text within the contained
   * column. Logical — `start` / `end` flip under RTL. Independent of
   * `headingLayout` (which controls separator / accent-line chrome).
   */
  contentAlignment?: "start" | "center" | "end";
  /**
   * Per-placement digit suffix SXA injects when the rendering is
   * marked `IsRenderingsWithDynamicPlaceholders=true`. Builds
   * `content-block-<id>` for the Placeholders variant to match the
   * SDK's `^…-\d+$` regex pattern.
   */
  dynamicPlaceholderId?: string;
}

/**
 * Heading + body renderer used by the `Default` variant. Always goes
 * through SectionWrapper so heading layout / animation / size apply
 * regardless of any other param. The `useSectionWrapper` boolean
 * threads straight to SectionWrapper's contained-vs-full-width
 * toggle.
 */
// Strict allow-list — mirrors `isEnabledStrict` in
// section-heading.helpers so the no-title branch honors the same
// Sitecore string-boolean shapes the SectionWrapper path uses.
function isContainedWrapper(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  return ["1", "true", "yes", "on", "enabled"].includes(
    value.trim().toLowerCase(),
  );
}

// Inline alignment classes keyed by the shared alignment@1 enum.
// `start` is the block's real default (and the recipe default);
// Logical tokens so the alignment flips correctly under RTL.
const CONTENT_ALIGNMENT_CLASSES: Record<
  NonNullable<ContentBlockProps["contentAlignment"]>,
  string
> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

function HeadingAndBody({
  title,
  eyebrow,
  body,
  eyebrowColorScheme,
  eyebrowSize,
  eyebrowStyle,
  headingLayout,
  headingAnimation,
  headingSize,
  accentLineColor,
  headingLevel,
  headingColor,
  proseLeading,
  proseSize,
  useSectionWrapper,
  contentAlignment = "start",
  isEditing,
}: ContentBlockProps): ReactNode {
  const hasTitle = title != null && !isEmptySource(title);
  const hasEyebrow = eyebrow != null && !isEmptySource(eyebrow);
  const layout = parseHeadingLayout(headingLayout, "start");
  const animation = parseHeadingAnimation(headingAnimation, "none");
  const size = parseHeadingSize(headingSize, "default");
  const level = parseHeadingLevel(headingLevel, "h2");
  const titleColor = headingColorClass(parseHeadingColor(headingColor));
  const leadingClass = proseLeadingClass(parseProseLeading(proseLeading));
  const sizeClass = proseSizeClass(parseProseSize(proseSize));
  const alignmentClass = CONTENT_ALIGNMENT_CLASSES[contentAlignment];

  // Push alignment to descendant block elements via tailwind's
  // arbitrary-selector syntax. `text-center` on the outer Prose
  // technically inherits through the cascade, but RichText slots its
  // content through ANOTHER Prose wrapper + Sitecore's SdkRichText /
  // dangerouslySetInnerHTML path, and in practice the inherit chain
  // didn't move the rendered `<p>` text — authors saw the
  // ContentAlignment param do nothing. The selectors are written out
  // statically (per-alignment table below) because tailwind's JIT
  // only picks up full literal class strings; a runtime
  // `"[&_p]:" + alignClass` produces no actual CSS at build time.
  const BODY_SELECTORS: Record<
    NonNullable<ContentBlockProps["contentAlignment"]>,
    string
  > = {
    start:
      "[&_p]:text-start [&_h1]:text-start [&_h2]:text-start [&_h3]:text-start [&_h4]:text-start [&_h5]:text-start [&_h6]:text-start [&_li]:text-start [&_blockquote]:text-start",
    center:
      "[&_p]:text-center [&_h1]:text-center [&_h2]:text-center [&_h3]:text-center [&_h4]:text-center [&_h5]:text-center [&_h6]:text-center [&_li]:text-center [&_blockquote]:text-center",
    end: "[&_p]:text-end [&_h1]:text-end [&_h2]:text-end [&_h3]:text-end [&_h4]:text-end [&_h5]:text-end [&_h6]:text-end [&_li]:text-end [&_blockquote]:text-end",
  };
  // The body slot must collapse when empty. `RichText` already returns
  // null for an empty value, but the <Prose> WRAPPER was still non-null,
  // and SectionWrapper decides whether to reserve the body region with
  // `children != null`. So a heading-only block always looked like it
  // had a body: the region was reserved and the heading kept the bottom
  // margin that exists to separate it from copy that isn't there —
  // the "ghost height" under a lone heading.
  //
  // In editing mode the slot stays mounted so authors still get the
  // RichText placeholder to click into.
  const bodyNode = (
    <Prose
      className={cn(
        alignmentClass,
        BODY_SELECTORS[contentAlignment],
        // Size BEFORE leading — tailwind-merge treats a font-size
        // utility as conflicting with `leading-*` (text-<size> sets
        // line-height too), so a later `text-lg` silently strips an
        // earlier `leading-relaxed` and the ProseLeading param does
        // nothing whenever ProseSize is also set. With leading last,
        // both land and the leading utility wins the line-height.
        sizeClass,
        leadingClass,
      )}
    >
      <RichText value={body} placeholder="Body" isEditing={isEditing} />
    </Prose>
  );
  const hasBody = body != null && !isEmptySource(body);
  const bodyContent = hasBody || isEditing ? bodyNode : null;

  // The heading path also fires for an eyebrow-only block — the
  // SectionWrapper renders the kicker without a title, and skipping it
  // here would silently drop the Eyebrow field.
  if (hasTitle || hasEyebrow) {
    return (
      <SectionWrapper
        title={title}
        eyebrow={eyebrow}
        layout={layout}
        headingOptions={{
          animation,
          size,
          level,
          accentLineColor,
          eyebrow: {
            colorScheme: eyebrowColorScheme,
            style: eyebrowStyle,
            size: eyebrowSize,
          },
          // Heading color override is a "role text on page" composition
          // — `text-<role>` only, never `text-<role>-foreground` (which
          // is reserved for text inside a matching solid surface).
          titleClassName: titleColor,
          // ContentAlignment ONLY drives body alignment — heading
          // alignment is controlled by HeadingLayout (centered,
          // accent-line, split-*, section-no-separator). Mirroring
          // alignment into the heading classes here meant the param
          // silently fought HeadingLayout and authors saw the heading
          // move when they only meant to move the body copy.
        }}
        useSectionWrapper={useSectionWrapper}
      >
        {bodyContent}
      </SectionWrapper>
    );
  }

  // Nothing authored in any slot: render nothing rather than an empty
  // contained box that still occupies its wrapper's padding.
  if (bodyContent == null) return null;

  // No title: bypass SectionWrapper but still honor the
  // contained-vs-full-width toggle here, otherwise UseSectionWrapper
  // is silently a no-op when the author leaves the title blank.
  return (
    <div
      className={
        isContainedWrapper(useSectionWrapper) ? "mx-auto max-w-prose" : "w-full"
      }
    >
      {bodyContent}
    </div>
  );
}

/**
 * Default content block. The `UseSectionWrapper` rendering parameter
 * (piped through to the SectionWrapper helper) chooses between a
 * prose-width contained body (`true`, the default) and a
 * full-container-width body (`false`). The old separate `FullWidth`
 * variant is gone — the boolean covers that choice.
 */
export function Default({ styles, id, ...rest }: ContentBlockProps) {
  return (
    <section
      className={cn(
        "component w-full text-foreground content-block",
        styles?.trimEnd(),
      )}
      id={id}
      dir="inherit"
      data-slot="content-block"
    >
      <div className="container mx-auto px-4 py-8 md:py-12">
        <HeadingAndBody {...rest} />
      </div>
    </section>
  );
}

/**
 * Placeholders variant: the normal heading + body content, then a
 * dynamic placeholder (`content-block-{*}`) below it so authors can
 * compose any rendering — UI-section components, images, … — under
 * the prose. The slot is permissive (the recipe declares no
 * allow-list; per-section restriction isn't expressible in the
 * placeholder schema).
 */
export function Placeholders({
  styles,
  id,
  dynamicPlaceholderId,
  rendering,
  ...rest
}: ContentBlockProps) {
  // Suffix-tolerant slot resolution: the exact `content-block-<id>`
  // key when the envelope carries it, otherwise the first
  // `content-block-<digits>` key present (older layout snapshots /
  // metadata payloads drop the DynamicPlaceholderId param).
  const { key: placeholderKey } = resolvePlaceholderChildren(
    rendering,
    "content-block",
    dynamicPlaceholderId,
  );
  return (
    <section
      className={cn(
        "component w-full text-foreground content-block content-block-placeholders",
        styles?.trimEnd(),
      )}
      id={id}
      dir="inherit"
      data-slot="content-block"
    >
      <div className="container mx-auto px-4 py-8 md:py-12">
        <HeadingAndBody {...rest} />
        {/*
          Mirror card-block.tsx / section-wrapper.tsx: ALWAYS mount
          `<Placeholder>` when a rendering envelope exists — Pages
          chrome reads the Placeholder component's data attributes to
          wire drop targets, so gating it behind isEditing/hasChildren
          leaves authors with nowhere to drop. Outside editing an empty
          Placeholder renders nothing, so empty slots still collapse.
        */}
        {rendering ? (
          <div className="mt-6 w-full">
            <Placeholder name={placeholderKey} rendering={rendering} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants fail to resolve. No runtime
 * behaviour change: the file stays a plain RSC server component
 * (no useState, no client-only hooks here); the universal marker
 * is purely a generate-map signal.
 */
export const componentType = "universal";
