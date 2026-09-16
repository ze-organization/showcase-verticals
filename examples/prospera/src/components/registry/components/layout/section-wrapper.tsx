// Parsers + types live in a non-`'use client'` module so this server-
// component file can call them without crossing the RSC boundary.
// Going through `./section-wrapper.helpers` (a `'use client'` chain)
// would turn each parser into a client reference, and the calls below
// would throw "Attempted to call parseHeadingLayout() from the server".
import {
  type AccentLineColorValue,
  type HeadingLayout,
  parseAccentLineColor,
  parseHeadingAnimation,
  parseHeadingLayout,
  parseHeadingSize,
  type SplitFooterAlignment,
} from "@/components/registry/blocks/section-heading.parsers";
import { Button } from "@/components/registry/components/ui/cta-button";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  hasSectionBackgroundImage,
  parseSectionBackgroundPosition,
  parseSectionBackgroundScrim,
  SectionBackground,
  sectionBackgroundToneClass,
} from "@/lib/registry/section-background";
import {
  resolveSectionSurfaceClass,
  SECTION_MAX_WIDTH_CLASSES,
  SECTION_PADDING_Y_CLASSES,
  type SectionBackgroundIntensity,
  type SectionColorScheme,
  type SectionMaxWidth,
  type SectionPaddingY,
} from "@/lib/registry/section-surface";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";
// `SectionWrapper` is a stateful client component; importing it from
// the `'use client'` helpers file is correct and Next.js handles the
// boundary crossing for components.
import { SectionWrapper } from "./section-wrapper.helpers";
import { SectionWrapperSubscribeFooter } from "./section-wrapper.subscribe-footer.client";

export type {
  HeadingAnimation,
  HeadingLayout,
  HeadingLevel,
  HeadingSize,
  ListingHeadingInput,
  SectionHeadingAxisProps,
  SectionHeadingParams,
  SplitFooterAlignment,
} from "@/components/registry/blocks/section-heading.parsers";
// Public re-exports — other layout/UI components import the parsers and
// types through this module, so the path stays stable.
export {
  adaptSectionHeadingParams,
  parseHeadingAnimation,
  parseHeadingLayout,
  parseHeadingLevel,
  parseHeadingSize,
  resolveListingHeading,
} from "@/components/registry/blocks/section-heading.parsers";
export { SectionWrapper } from "./section-wrapper.helpers";

/** Bottom-region mode picked by the `BottomContent` param. */
type BottomContentMode = "none" | "button" | "subscribe";

/**
 * Flat props delivered by `withSitecore`'s default convention. The
 * recipe declares one canonical name per concept.
 */
export interface SectionWrapperProps extends CmsProps {
  // Fields
  title?: TextSource;
  lead?: TextSource;
  /**
   * Optional kicker line above the title — rendered through the shared
   * Eyebrow block (same pattern as content-block). Styled by
   * `eyebrowColorScheme` / `eyebrowSize` / `eyebrowStyle`.
   */
  eyebrow?: TextSource;
  link?: LinkSource;
  /**
   * Optional full-bleed background image painted behind the heading +
   * content placeholder (shared section-background vocabulary). When
   * set it visually overrides the BackgroundColor fill; the
   * BackgroundScrim param keeps the section's text readable over it.
   */
  backgroundImage?: ImageSource;
  // Params (all PascalCase in Sitecore; defaultMap lowercases the first letter)
  headingLayout?: string;
  headingAnimation?: string;
  headingSize?: string;
  /**
   * Color of the heading's accent scribble + section-divider hairline
   * (color-scheme@1). The single accent-decoration param — `accent`
   * (the recipe default) pins the design system's accent color on
   * both. `default` falls back to `accent`. Threaded to
   * SectionWrapper's headingOptions so the same param works on every
   * heading consumer.
   */
  accentLineColor?: string;
  /** Eyebrow tint (color-scheme@1). Recipe default `primary`. */
  eyebrowColorScheme?: string;
  /** Eyebrow size override (size@1). `default` keeps the block scale. */
  eyebrowSize?: string;
  /**
   * Eyebrow treatment (eyebrow-style@1): `text` (small-caps line,
   * default) or `badge` (pill chip). `eyebrow`/`pill` aliases accepted.
   */
  eyebrowStyle?: string;
  /**
   * Inner content-width toggle. `true` (the recipe default) constrains
   * the body to a prose-width centered column; `false` lets it fill
   * the section container's full width. Accepts Sitecore string
   * booleans. Threads straight to the SectionWrapper helper.
   */
  useSectionWrapper?: string | boolean;
  // `BottomContent` / `BottomAlignment` are datasource fields delivered
  // as `{ value: "button" }` Sitecore Field shapes; `parseBottomContent`
  // / `parseBottomAlignment` unwrap them via `coerceFieldString`.
  bottomContent?: unknown;
  bottomAlignment?: unknown;
  /** See container.tsx — same vertical-placement axis. */
  position?: "inline" | "sticky-top" | "sticky-bottom";
  /** See container.tsx — same width-cap axis (caps the section element itself). */
  maxWidth?: SectionMaxWidth;
  /** See container.tsx — same horizontal-alignment axis. */
  alignment?: "start" | "center" | "end";
  /**
   * Per-placement digit suffix SXA injects when the rendering is
   * marked `IsRenderingsWithDynamicPlaceholders=true`. Builds
   * `section-wrapper-content-<id>` to match the SDK's `^…-\d+$`
   * regex pattern.
   */
  dynamicPlaceholderId?: string;
  /** See container.tsx — same surface-fill axis. */
  backgroundColor?: SectionColorScheme;
  /** See container.tsx — same background-intensity axis. */
  backgroundIntensity?: SectionBackgroundIntensity;
  /**
   * Scrim over the BackgroundImage — `dark` (default) dims the photo
   * and flips the section text light, `light` washes it and keeps
   * text dark, `none` leaves the image untreated. No effect without
   * a BackgroundImage.
   */
  backgroundScrim?: string;
  /** Crop anchor of the BackgroundImage — `center` / `top` / `bottom`. */
  backgroundPosition?: string;
  /** See container.tsx — same vertical-padding axis. */
  paddingY?: SectionPaddingY;
}

/**
 * Resolve the single accent-decoration color: an explicit
 * AccentLineColor wins, otherwise `accent`.
 */
function resolveAccentLineColor(
  accentLineColor: string | undefined,
): AccentLineColorValue {
  const explicit = parseAccentLineColor(accentLineColor);
  return explicit !== "default" ? explicit : "accent";
}

// Surface fill + intensity + padding + max-width all resolve through
// the shared section-surface vocabulary in
// `src/lib/registry/section-surface.ts` — the same maps ListingSection
// (cards-and-lists shells) consumes, so the two section shells cannot
// drift. Dark/bold fills additionally pick up the `surface-invert`
// token remap from `resolveSectionSurfaceClass`.

const POSITION_CLASSES: Record<
  NonNullable<SectionWrapperProps["position"]>,
  string
> = {
  inline: "",
  "sticky-top": "sticky top-0 z-40",
  "sticky-bottom": "sticky bottom-0 z-40",
};

const ALIGNMENT_CLASSES: Record<
  NonNullable<SectionWrapperProps["alignment"]>,
  string
> = {
  start: "me-auto",
  center: "mx-auto",
  end: "ms-auto",
};

/**
 * Coerce the raw value `withSitecore` flattens into a plain string.
 * `BottomContent` and `BottomAlignment` moved from rendering-params
 * (always plain strings) to datasource fields, so the runtime value
 * arrives as `{ value: "button" }` (Sitecore `Field<string>` shape).
 * Earlier the parsers called `.trim()` directly and crashed with
 * "value.trim is not a function" on every Pages render once the
 * recipe moved. Accept both shapes — plain string, object with
 * `.value` — and bail on anything else.
 */
function coerceFieldString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "value" in value) {
    const inner = (value as { value?: unknown }).value;
    return typeof inner === "string" ? inner : undefined;
  }
  return undefined;
}

function parseBottomContent(
  value: unknown,
  fallback: BottomContentMode,
): BottomContentMode {
  const raw = coerceFieldString(value);
  if (!raw) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (
    normalized === "button" ||
    normalized === "subscribe" ||
    normalized === "none"
  ) {
    return normalized;
  }
  return fallback;
}

function parseBottomAlignment(
  value: unknown,
  fallback: SplitFooterAlignment,
): SplitFooterAlignment {
  const raw = coerceFieldString(value);
  if (!raw) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (normalized === "start" || normalized === "end" || normalized === "center")
    return normalized;
  return fallback;
}

function isSplitLayout(layout: HeadingLayout): boolean {
  return layout.startsWith("split-");
}

/**
 * `auto` (the recipe default) defers to the section's bespoke
 * responsive padding ramp; every concrete `padding-y@1` token takes
 * over instead.
 */
function usesNaturalSectionPadding(paddingY: SectionPaddingY): boolean {
  return paddingY === "auto";
}

/**
 * Page-section shell with heading, optional lead, content placeholder,
 * and optional bottom region (button or subscribe form). The placeholder
 * (`section-wrapper-content-<id>`) is permissive — any child rendering
 * is allowed.
 *
 * Exported as `SectionWrapperPresentation` for unit tests, and
 * re-exported as `Default` for the Sitecore component map (the
 * component-map generator wraps `Default` with `withSitecore`).
 */
export function SectionWrapperPresentation({
  id,
  styles,
  isEditing,
  title,
  lead,
  eyebrow,
  link,
  headingLayout,
  headingAnimation,
  headingSize,
  accentLineColor,
  eyebrowColorScheme,
  eyebrowSize,
  eyebrowStyle,
  useSectionWrapper,
  bottomContent,
  bottomAlignment,
  position = "inline",
  maxWidth = "full",
  alignment: sectionAlignment = "start",
  backgroundColor = "default",
  backgroundIntensity = "subtle",
  backgroundImage,
  backgroundScrim,
  backgroundPosition,
  paddingY = "auto",
  dynamicPlaceholderId,
  rendering,
}: SectionWrapperProps) {
  const layout = parseHeadingLayout(headingLayout, "center-with-accent");
  const animation = parseHeadingAnimation(headingAnimation, "none");
  const size = parseHeadingSize(headingSize, "default");
  // Single accent-decoration color — explicit AccentLineColor, else `accent`.
  const resolvedAccentLineColor = resolveAccentLineColor(accentLineColor);
  const bottomMode = parseBottomContent(bottomContent, "none");
  const footerAlign = parseBottomAlignment(bottomAlignment, "center");

  // Substitute the SXA-injected DynamicPlaceholderId into the slot
  // name so the SDK's `^section-wrapper-content-\d+$` regex matches.
  // See container.tsx for the full rationale on why the literal `{*}`
  // token doesn't work.
  const phSuffix = dynamicPlaceholderId ?? "1";
  const placeholderName = `section-wrapper-content-${phSuffix}`;

  // PaddingY's natural value is the responsive ramp below, which no
  // concrete padding-y@1 token reproduces — hence the in-list `auto`
  // member as the recipe default.
  const usesNaturalPadding = usesNaturalSectionPadding(paddingY);
  const isConstrained = maxWidth !== "full";

  // Render the bottom region whenever the author has picked "button"
  // or "subscribe" — even when the Link field is empty for the button
  // mode. The wrapping `<span data-bottom-link>` carries the
  // `flex justify-{start|center|end}` so the link sits flush with the
  // requested BottomAlignment; without it the `<Button>` shell was
  // an `inline-flex` element that didn't honour its parent
  // `text-{align}` cascade reliably in every layout (rows + columns
  // in split-heading mode in particular).
  //
  // `<Link isEditing={isEditing} placeholder="Bottom Link">` is the
  // editable surface: when the Link field is blank in Pages chrome
  // the primitive shows an `EditPlaceholder` stub so authors have a
  // click target instead of an invisible button. Earlier the Button
  // shell + bare Link rendered nothing visible when the field was
  // empty, which read as "the bottom isn't rendering" — that's
  // resolved now.
  const bottomJustifyClass =
    footerAlign === "start"
      ? "justify-start"
      : footerAlign === "end"
        ? "justify-end"
        : "justify-center";
  const footer =
    bottomMode === "button" ? (
      <span data-bottom-link className={cn("flex w-full", bottomJustifyClass)}>
        <Button
          variant="link"
          showArrow
          size="sm"
          link={link}
          isEditing={isEditing}
        />
      </span>
    ) : bottomMode === "subscribe" ? (
      <SectionWrapperSubscribeFooter />
    ) : null;

  const splitLayout = isSplitLayout(layout);

  // Optional full-bleed background image (shared section-background
  // vocabulary). All background classes are gated on `hasBackground`
  // so a section without the field renders exactly as before.
  const hasBackground = hasSectionBackgroundImage(backgroundImage);
  const scrim = parseSectionBackgroundScrim(backgroundScrim);
  const scrimPosition = parseSectionBackgroundPosition(backgroundPosition);

  return (
    <section
      id={id}
      className={cn(
        "component section-wrapper @container/section-wrapper",
        // The natural responsive ramp fires when the author hasn't
        // picked a concrete `paddingY` value — i.e. `auto` (the recipe
        // default). Once they pick a concrete token the
        // PADDING_Y_CLASSES entry takes over so picking `none` actually
        // flattens the section to 0 padding.
        usesNaturalPadding &&
          "@[1024px]:pt-14 @[640px]:pt-12 pt-10 @[1024px]:pb-10 @[640px]:pb-10 pb-8",
        !usesNaturalPadding && SECTION_PADDING_Y_CLASSES[paddingY],
        POSITION_CLASSES[position],
        SECTION_MAX_WIDTH_CLASSES[maxWidth],
        isConstrained && ALIGNMENT_CLASSES[sectionAlignment],
        resolveSectionSurfaceClass(backgroundColor, backgroundIntensity),
        // NOTE: no `text-*` class is pinned here — one would tint ALL
        // inherited text in the section (headings, leads, body copy),
        // not just the accent scribble. The accent decoration is
        // colored directly via headingOptions.accentLineColor below;
        // the section's text keeps whatever tone its surface / scrim
        // axes dictate.
        //
        // Background image treatment: positioning context for the
        // absolute image layer + the scrim-driven text tone.
        hasBackground && "relative overflow-hidden",
        hasBackground && sectionBackgroundToneClass(scrim),
        styles,
      )}
    >
      {hasBackground ? (
        <SectionBackground
          image={backgroundImage}
          scrim={scrim}
          position={scrimPosition}
          isEditing={isEditing}
          placeholder="Section background"
        />
      ) : null}
      <div
        className={cn(
          "container mx-auto px-4",
          hasBackground && "relative z-10",
        )}
      >
        <SectionWrapper
          title={title}
          lead={lead}
          eyebrow={eyebrow}
          isEditing={isEditing}
          layout={layout}
          useSectionWrapper={useSectionWrapper}
          headingOptions={{
            animation,
            size,
            accentLineColor: resolvedAccentLineColor,
            eyebrow: {
              colorScheme: eyebrowColorScheme,
              style: eyebrowStyle,
              size: eyebrowSize,
            },
            classes: { centeredContainerClassName: "text-center" },
          }}
          wrapperClassName="w-full"
          footer={footer}
          footerClassName="w-full"
          splitFooterAlignment={footerAlign}
        >
          <div className={cn("mb-12 w-full", !splitLayout && "mt-5")}>
            {/*
              Mirror container.tsx: always render `<Placeholder>` when
              we have a rendering envelope, regardless of whether the
              author has dropped children yet. Pages chrome reads the
              Placeholder component's data attributes to wire drop
              targets; replacing it with a static dashed div when
              `hasPlaceholderItems` was false meant authors couldn't
              drop into the slot — chrome had nowhere to hang the
              drop-zone marker. The chrome shows its own empty-state
              styling when the slot is genuinely empty, so the
              dashed fallback was redundant AND blocking.
            */}
            {rendering ? (
              <Placeholder name={placeholderName} rendering={rendering} />
            ) : null}
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}

export { SectionWrapperPresentation as Default };

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants (Headless, Media, etc.) fail to resolve. No runtime
 * behaviour change: the file stays a plain RSC server component
 * (no useState, no client-only hooks here); the universal marker
 * is purely a generate-map signal.
 */
export const componentType = "universal";
