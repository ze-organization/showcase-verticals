import type { ReactNode } from "react";
import {
  parseHeadingAnimation,
  parseHeadingLayout,
  parseHeadingSize,
  SectionWrapper,
} from "@/components/registry/components/layout/section-wrapper";
import { Button } from "@/components/registry/components/ui/cta-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/registry/primitives/core/accordion";
import { EditPlaceholder } from "@/components/registry/primitives/core/edit-placeholder";
import {
  TypographyH2,
  TypographyH4,
  TypographyMuted,
  TypographyP,
  TypographySmall,
} from "@/components/registry/primitives/core/typography";
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
  getNonEmptySource,
  isRichTextSource,
  isStringSource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { hoistLinkedItemFields } from "@/lib/registry/placeholder-children";
import type { CmsProps, Field } from "@/lib/registry/sitecore";

/** Sitecore item fields shared by both Default (Q/A) and Media variants. */
export interface AccordionItemFields {
  Title: Field<string>;
  Content: RichTextSource;
  /** Optional description — used by the Media variant. */
  Description?: RichTextSource | TextSource;
  /** Optional thumbnail image — used by the Media variant. */
  Image?: ImageSource;
  /** Optional CTA link — used by the Media variant. */
  Link?: LinkSource;
}

/**
 * Field shape for items authored against the `faq-content@1` template.
 * The Items Treelist source accepts FAQ items alongside accordion-items
 * and accordion-item-renderings — `normalizeAccordionItem` below maps
 * Question/Answer onto Title/Content so the variants stay agnostic.
 */
export interface FaqContentItemFields {
  Question: Field<string>;
  Answer: RichTextSource;
  Category?: Field<string>;
  Tags?: Field<string>;
}

export interface AccordionBlockFields {
  /** Optional section heading */
  Heading?: Field<string>;
  /**
   * Optional supporting copy under the heading. Threaded into
   * SectionWrapper's `lead` slot so it renders below the section
   * title with the same prose treatment as form-builder /
   * subscribe-section / content-block.
   */
  Description?: RichTextSource | TextSource;
  /**
   * Accordion items. Authoring side: a Treelist of
   * `accordion-item@1` linked items. The sibling
   * `accordion-block.sitecore.ts` adapter uses `withSitecore`'s
   * `flattenLinkedItems: ["Items"]` option to hoist each linked
   * item's fields to the top level — what the React side actually
   * reads (`item.Title`, `item.Content`, etc.).
   */
  Items?: Array<{ id: string; fields: AccordionItemFields }>;
}

/**
 * One item in the flattened items array the React component
 * consumes. Mirrors `AccordionItemFields` plus the linked-item
 * identity (`id` / `name`). Named `AccordionBlockItem` to avoid
 * collision with the Radix `AccordionItem` re-export.
 */
export type AccordionBlockItem = AccordionItemFields & {
  id?: string;
  name?: string;
};

/**
 * Flat props delivered by `withSitecore`'s default convention +
 * `flattenLinkedItems: ["Items"]`:
 *   - `fields.Heading`        → `heading`
 *   - `fields.Items`          → `items` (each item flattened to
 *      `{id, name, Title, Content, ...}`)
 *   - `params.UseSectionWrapper` → `useSectionWrapper` (string "1"/"true"
 *      or boolean accepted)
 *   - `params.HeadingLayout` / `HeadingAnimation` / `HeadingSize` → camelCased
 */
export interface AccordionBlockProps extends CmsProps {
  /**
   * Index of the row to render already expanded (0-based). Author and
   * preview seam only — outside editing every panel starts collapsed
   * and Radix keeps a collapsed panel out of the DOM, so a static
   * preview paints bare triggers and no panel body can be measured.
   * Out-of-range values fall back to all-collapsed. Accepts a string
   * because Sitecore rendering parameters always arrive as strings.
   */
  defaultOpenIndex?: number | string;
  heading?: TextSource;
  /**
   * Optional supporting copy under the heading. Rich-text source —
   * SectionWrapper renders it as the lead paragraph below the
   * title. withSitecore's default flattening lowercases the field
   * name (`fields.Description` → `description`).
   */
  description?: RichTextSource | TextSource;
  items?: AccordionBlockItem[];
  /**
   * Search-mode config blob — populated by the `sai/search-source`
   * Marketplace plugin into the recipe's `SearchConfig` Plugin field
   * (see `accordion-block.recipe.ts`). Phase-1 wiring: type declared
   * so the field flows through `withSitecore`'s flattening; runtime
   * dispatch to `useSearchResults` lands when the parent surface is
   * upgraded to a client component. Treat a populated `searchConfig`
   * as semantically equivalent to a populated `items` array for the
   * purposes of the variant's dispatch — composed mode still wins
   * (placeholder children), curated/search both flow through the
   * shared items pipeline once resolved.
   */
  searchConfig?: Field<string> | string;
  useSectionWrapper?: string | boolean;
  headingLayout?: string;
  headingAnimation?: string;
  headingSize?: string;
  /**
   * Gate the per-item thumbnail on the Default / Headless variants.
   * Default off — Q&A accordions stay text-only even if items carry
   * an Image field. The Media variant always shows images regardless
   * (that's its identity). Accepts Sitecore string-booleans.
   */
  showImages?: string | boolean;
  /**
   * Per-placement digit suffix SXA injects when the rendering is
   * marked `IsRenderingsWithDynamicPlaceholders=true`. The Headless
   * variant substitutes it into the `accordion-items-<id>` slot name
   * so the SDK's `^…-\d+$` regex matches and the placeholder
   * resolves — without this the Headless body never finds its
   * children (literal `{*}` is the recipe-side declaration; runtime
   * SXA replaces it with the rendering's placement index).
   */
  dynamicPlaceholderId?: string;
}

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqInlineItem = {
  question: string;
  answer: string;
};

export interface AccordionInlineProps {
  className?: string;
  question?: string;
  answer?: string;
  relatedQuestions?: FaqInlineItem[];
}

const defaultSectionItems: FaqItem[] = [
  {
    id: "setup",
    question: "How fast can we launch a new campaign?",
    answer:
      "Most teams ship in days once templates and approvals are configured. Our blocks are ready to reuse across channels.",
  },
  {
    id: "governance",
    question: "Does this work with our existing brand system?",
    answer:
      "Yes. Tokens and components map directly to your brand guidelines, so updates remain consistent across pages.",
  },
  {
    id: "support",
    question: "What support options are available?",
    answer:
      "We offer guided onboarding, office hours, and dedicated success managers for enterprise plans.",
  },
];

function isEmptyValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "object" && "value" in value)
    return (value as { value?: unknown }).value == null;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

/**
 * Shared shell — heading + optional SectionWrapper. Each variant
 * supplies the accordion body as children so heading-handling logic
 * stays in one place.
 */
function AccordionSection({
  heading,
  description,
  useSectionWrapper,
  headingLayout,
  headingAnimation,
  headingSize,
  id,
  styles,
  isEditing,
  children,
}: AccordionBlockProps & {
  children: ReactNode;
}) {
  const layout = parseHeadingLayout(
    headingLayout,
    "start-with-section-divider",
  );
  const animation = parseHeadingAnimation(headingAnimation, "none");
  const size = parseHeadingSize(headingSize, "default");
  const hasHeading = heading != null && !isEmptyValue(heading);
  const hasDescription = description != null && !isEmptyValue(description);
  // Render the lead paragraph manually for the no-heading branch
  // (the standard heading branch delegates to SectionWrapper's
  // `lead` slot). Use the same source-shape detection the per-item
  // description pass uses below so plain strings and rich-text
  // payloads both render correctly.
  const leadFallback =
    hasDescription && description != null ? (
      <div className="mb-6 text-muted-foreground">
        {isStringSource(description) ? (
          <p>{description}</p>
        ) : isRichTextSource(description) ? (
          <RichText value={description} />
        ) : null}
      </div>
    ) : null;

  // Inline mirror of section-heading.helpers' isEnabledStrict so the
  // no-heading branch honors the same Sitecore string-boolean shapes
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
  // no-heading branches apply the same contained class manually so the
  // toggle isn't silently dropped when the heading is blank.
  //
  // Outer `container py-8 md:py-12` mirrors content-block so the
  // accordion has page-section padding by default; UseSectionWrapper
  // controls only the inner width constraint, not vertical padding.
  return (
    <section
      id={id}
      className={cn(
        "component accordion-block w-full text-foreground",
        styles?.trimEnd(),
      )}
      aria-label={heading ? undefined : "Accordion"}
    >
      <div className="container mx-auto px-4 py-8 md:py-12">
        {hasHeading ? (
          <SectionWrapper
            title={heading}
            lead={description}
            layout={layout}
            headingOptions={{ animation, size }}
            useSectionWrapper={useSectionWrapper}
          >
            {children}
          </SectionWrapper>
        ) : isEditing ? (
          <>
            <EditPlaceholder kind="Heading" variant="block" className="mb-4" />
            <div className={containedClass}>
              {leadFallback}
              {children}
            </div>
          </>
        ) : (
          <div className={containedClass}>
            {leadFallback}
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * If the caller didn't pass any items, render a single placeholder slot
 * so the editor surface still has a trigger to render.
 */
/**
 * Normalize an authored item into the `AccordionBlockItem` shape the
 * variants consume. Handles three referenceable source-template shapes:
 *
 *   - `accordion-item@1`           → already in shape; pass through
 *   - `accordion-item-rendering@1` → same field shape (Title/Content/...);
 *                                    pass through
 *   - `faq-content@1`              → Question → Title, Answer → Content
 *
 * The block-level `Items` Treelist filter allows all three so authors
 * can mix curated content rows freely. See `accordion-block.recipe.ts`.
 */
function normalizeAccordionItem(item: AccordionBlockItem): AccordionBlockItem {
  // Cast through unknown — FAQ-shaped items arrive with Question/Answer
  // instead of Title/Content. They're structurally distinct enough that
  // a union type would force every callsite to discriminate; cheaper to
  // normalize once at the boundary.
  const candidate = item as unknown as
    | AccordionBlockItem
    | (FaqContentItemFields & { id?: string; name?: string });
  if ("Question" in candidate && candidate.Question != null) {
    return {
      id: candidate.id,
      name: candidate.name,
      Title: candidate.Question,
      Content: candidate.Answer as RichTextSource,
    };
  }
  return item;
}

function resolveItems(
  items: AccordionBlockProps["items"],
): NonNullable<AccordionBlockProps["items"]> {
  // Hoist nested `{id, fields: {…}}` linked items first — installed
  // starters' generated maps miss the Treelist flatten (no sibling
  // recipe to discover), so items arrive in the raw layout-service
  // shape there. See hoistLinkedItemFields.
  const hoisted = hoistLinkedItemFields<AccordionBlockItem>(items);
  if (hoisted.length) return hoisted.map(normalizeAccordionItem);
  return [
    {
      id: "placeholder",
    } as AccordionBlockItem,
  ];
}

/**
 * Default accordion: title trigger + rich-text content panel, with
 * optional Image (trigger thumbnail), Description (under title), and
 * Link (CTA in the panel). The richer fields render only when
 * populated — leaving them blank keeps the classic Q/A look.
 *
 * In editing mode, all items render expanded so authors can edit
 * every field without first clicking each trigger.
 */
/**
 * One Default-variant accordion row: optional thumbnail + title +
 * description in the trigger, rich-text content + optional CTA in the
 * panel. Extracted from `Default` so the per-item branching stays out
 * of the variant's map callback.
 */
function DefaultAccordionItem({
  item,
  itemValue,
  showImages,
  isEditing,
}: {
  item: AccordionBlockItem;
  itemValue: string;
  showImages: boolean;
  isEditing?: boolean;
}) {
  const hasTitle = item.Title && !isEmptyValue(item.Title);
  const hasContent = item.Content && !isEmptyValue(item.Content);
  const hasDescription = item.Description && !isEmptyValue(item.Description);
  // ShowImages param gates Default-variant thumbnails. Media
  // variant ignores this and always renders images.
  const hasImage = showImages && item.Image && !isEmptyValue(item.Image);
  const hasLink = item.Link && !isEmptyValue(item.Link);
  return (
    <AccordionItem value={itemValue}>
      <AccordionTrigger className="text-start">
        <div className="flex w-full items-center gap-3">
          {hasImage && item.Image ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded">
              <Image
                value={item.Image}
                className="object-cover"
                fill
                sizes="48px"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            {hasTitle ? (
              <Text value={item.Title} tag="span" isEditing={isEditing} />
            ) : isEditing ? (
              <EditPlaceholder kind="Title" />
            ) : null}
            {hasDescription ? (
              <span className="mt-1 block text-muted-foreground text-sm">
                <Text
                  value={item.Description}
                  tag="span"
                  isEditing={isEditing}
                />
              </span>
            ) : null}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 text-foreground">
        {hasContent ? (
          <RichText
            value={item.Content}
            className="text-foreground"
            placeholder="Content"
            isEditing={isEditing}
          />
        ) : isEditing ? (
          <EditPlaceholder kind="Content" variant="block" />
        ) : null}
        {hasLink ? (
          <Button asChild variant="outline" size="sm">
            <Link value={item.Link} isEditing={isEditing} />
          </Button>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}

/**
 * Resolve `defaultOpenIndex` to the Accordion `value` list for that row.
 * Returns undefined for an unset or out-of-range index so a bad author
 * value degrades to "all collapsed" rather than opening the wrong row.
 */
function accordionOpenValues(
  items: { id?: string }[],
  index: number | string | undefined,
): string[] | undefined {
  if (index == null || index === "") return undefined;
  const at = Number(index);
  if (!Number.isInteger(at) || at < 0) return undefined;
  const item = items[at];
  return item ? [`${item.id || "item"}-${at}`] : undefined;
}

export function Default(props: AccordionBlockProps) {
  const items = resolveItems(props.items);
  // Open every item up front when authoring so the SDK editing chrome
  // wraps every field. Without this, panels stay collapsed by default
  // and authors can't see / click into Content, Description, or Link
  // until they manually open each row.
  const defaultValue = props.isEditing
    ? items.map((item, index) => `${item.id || "item"}-${index}`)
    : accordionOpenValues(items, props.defaultOpenIndex);

  // Sitecore checkbox params arrive as the string `"1"` / `""` (and
  // sometimes `true`/`false` from non-Sitecore preview callers). Gate
  // image rendering on the truthy set — empty / `"0"` / `"false"`
  // keep images hidden even when the item carries one.
  const showImagesResolved = (() => {
    const v = props.showImages;
    if (typeof v === "boolean") return v;
    if (!v) return false;
    return ["1", "true", "yes", "on", "enabled"].includes(
      v.trim().toLowerCase(),
    );
  })();

  return (
    <AccordionSection {...props}>
      <Accordion type="multiple" className="w-full" defaultValue={defaultValue}>
        {items.map((item, index) => {
          const itemValue = `${item.id || "item"}-${index}`;
          return (
            <DefaultAccordionItem
              key={itemValue}
              item={item}
              itemValue={itemValue}
              showImages={showImagesResolved}
              isEditing={props.isEditing}
            />
          );
        })}
      </Accordion>
    </AccordionSection>
  );
}

/**
 * Media variant: each item has a thumbnail, title, description, and
 * optional CTA link. Single-open mode (only one item expanded at a time)
 * matches the visual treatment.
 *
 * Different field schema (`Image` + `Description` + `Link` carry meaning
 * here, ignored by Default) → distinct rendering variant per the
 * variant-vs-parameter rule.
 */
/**
 * One Media-variant accordion row: thumbnail + title + truncated
 * description preview in the trigger, full description (string or rich
 * text) + optional CTA in the panel. Extracted from `Media` so the
 * per-item branching stays out of the variant's map callback.
 */
function MediaAccordionItem({
  item,
  itemValue,
  isEditing,
}: {
  item: AccordionBlockItem;
  itemValue: string;
  isEditing?: boolean;
}) {
  const hasTitle = item.Title && !isEmptyValue(item.Title);
  const hasLink = item.Link && !isEmptyValue(item.Link);
  const descriptionSource = getNonEmptySource(item.Description ?? item.Content);
  const previewDescriptionText =
    descriptionSource && isStringSource(descriptionSource)
      ? descriptionSource
      : descriptionSource
        ? "Expanded details available"
        : undefined;

  return (
    <AccordionItem
      value={itemValue}
      className="mb-4 rounded-lg bg-card px-4 last:mb-0"
    >
      <AccordionTrigger className="items-center py-4 text-start hover:no-underline">
        <div className="flex w-full items-center gap-4">
          {item.Image && !isEmptyValue(item.Image) ? (
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                value={item.Image}
                className="object-cover"
                fill
                sizes="112px"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            {hasTitle ? (
              <span className="block truncate font-medium text-base text-foreground">
                <Text value={item.Title} tag="span" isEditing={isEditing} />
              </span>
            ) : isEditing ? (
              <EditPlaceholder kind="Title" />
            ) : null}
            {previewDescriptionText ? (
              <span className="mt-1 line-clamp-2 block text-muted-foreground text-sm">
                {previewDescriptionText}
              </span>
            ) : null}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pb-2">
          {descriptionSource ? (
            <div className="text-muted-foreground [&_p]:mb-2">
              {isStringSource(descriptionSource) ? (
                <TypographyMuted className="text-inherit">
                  {descriptionSource}
                </TypographyMuted>
              ) : isRichTextSource(descriptionSource) ? (
                <RichText value={descriptionSource} isEditing={isEditing} />
              ) : null}
            </div>
          ) : null}
          {hasLink ? (
            <Button asChild variant="outline" size="sm">
              <Link value={item.Link} isEditing={isEditing} />
            </Button>
          ) : null}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function Media(props: AccordionBlockProps) {
  const items = resolveItems(props.items);
  // Edit mode: open the first item by default so the SDK editing
  // chrome reaches the panel's fields (Description / Content / Link)
  // without the author needing to click. Single-open mode means only
  // one panel is open at a time, but the first being open lets the
  // editor at least see the typical panel shape.
  const defaultValue = props.isEditing
    ? `${items[0]?.id || "item"}-0`
    : accordionOpenValues(items, props.defaultOpenIndex)?.[0];

  return (
    <AccordionSection {...props}>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={defaultValue}
      >
        {items.map((item, index) => {
          const itemValue = `${item.id || "item"}-${index}`;
          return (
            <MediaAccordionItem
              key={itemValue}
              item={item}
              itemValue={itemValue}
              isEditing={props.isEditing}
            />
          );
        })}
      </Accordion>
    </AccordionSection>
  );
}

/**
 * React-only design-system sample showcasing a generic FAQ section.
 * Not a Sitecore rendering variant — used by showcase previews.
 */
export function Section({
  className,
  heading = "Frequently asked questions",
  description = "Everything you need to know about onboarding and delivery.",
  items = defaultSectionItems,
}: {
  className?: string;
  heading?: string;
  description?: string;
  items?: FaqItem[];
}) {
  const headingId = "faq-accordion-heading";

  return (
    <section className={cn("w-full", className)} aria-labelledby={headingId}>
      <div className="space-y-2">
        <TypographyH2
          id={headingId}
          className="border-0 pb-0 text-xl sm:text-2xl"
        >
          {heading}
        </TypographyH2>
        <TypographyMuted className="text-sm">{description}</TypographyMuted>
      </div>

      <Accordion type="multiple" className="mt-6 w-full">
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-start text-base">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

/**
 * React-only inline FAQ — a primary question/answer plus related
 * "People also ask" items. Not a Sitecore rendering variant.
 */
export function Inline({
  className,
  question,
  answer,
  relatedQuestions = [],
}: AccordionInlineProps) {
  const hasMain = Boolean(answer && question);
  const hasRelated = relatedQuestions.length > 0;
  if (!hasMain && !hasRelated) {
    return (
      <div className={cn("w-full", className)}>
        <div className="mb-8 rounded-lg border border-border border-dashed bg-muted/30 p-6 text-center text-muted-foreground text-sm">
          <span>FAQ</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-8 rounded-lg border border-border bg-background p-5 shadow-sm">
        {hasMain && (
          <div className="mb-6 border-border border-b p-3">
            <TypographyH4 className="text-lg">{question}</TypographyH4>
            <TypographyP className="mt-2">{answer}</TypographyP>
          </div>
        )}
        {hasRelated && (
          <div className="space-y-4">
            <TypographyH4 className="mb-4 text-base">
              People also ask ...
            </TypographyH4>
            <Accordion type="multiple">
              {relatedQuestions.map(
                ({ answer: relatedAnswer, question: relatedQuestion }) => (
                  <AccordionItem
                    className="w-full border-border not-last:border-b py-4"
                    value={`${relatedAnswer}-${relatedQuestion}`}
                    key={`${relatedAnswer}-${relatedQuestion}`}
                  >
                    <AccordionTrigger className="flex w-full justify-between gap-x-2 text-start text-sm">
                      <TypographySmall>{relatedQuestion}</TypographySmall>
                    </AccordionTrigger>
                    <AccordionContent className="pt-5">
                      <TypographyP className="font-light text-sm">
                        {relatedAnswer}
                      </TypographyP>
                    </AccordionContent>
                  </AccordionItem>
                ),
              )}
            </Accordion>
          </div>
        )}
      </div>
    </div>
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
