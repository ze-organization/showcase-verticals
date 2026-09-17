import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { iconByName } from "@/components/registry/graphics/icons/named-icon/icon-vocabulary";
import { NamedIcon } from "@/components/registry/graphics/icons/named-icon/named-icon";
import { Button as PrimitiveButton } from "@/components/registry/primitives/core/button";
import { ArrowLink } from "@/components/registry/primitives/editables/arrow-link";
import {
  Link as LinkPrimitive,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import { cn } from "@/lib/registry/cn";
import {
  buttonColorScheme,
  headingColorClass,
  isEnabled,
  parseButtonVariant,
  parseColorScheme,
  parseHeadingColor,
} from "@/lib/registry/param-parsers";
import type { CmsProps } from "@/lib/registry/sitecore";

// Trailing "→" chrome shared by the editorial link+arrow treatment and
// the orthogonal `showArrow` param. The `group-hover` nudge needs a
// `group` ancestor (added to the button/link shell when the arrow is on).
const ARROW_ICON_CLASS =
  "size-4 shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1";

/**
 * The shared trailing arrow node. Exported so composite CTA surfaces
 * (e.g. `CtaGroup`, which renders its own `asChild` Button + Link) can
 * drop the same "→" into the Link's `after` slot instead of relying on
 * `showArrow`, which is a no-op through an `asChild` Button. Wrap the
 * host in a `group` class so the hover nudge fires.
 */
export function trailingArrow(icon?: ReactNode): ReactNode {
  return icon ?? <ArrowRight className={ARROW_ICON_CLASS} aria-hidden />;
}

type PrimitiveButtonSize = NonNullable<
  ComponentProps<typeof PrimitiveButton>["size"]
>;
type SharedSize = "default" | "xs" | "sm" | "md" | "lg" | "xl";
export type CtaButtonSize = PrimitiveButtonSize | SharedSize;

type PrimitiveButtonVariant = NonNullable<
  ComponentProps<typeof PrimitiveButton>["variant"]
>;

/**
 * Every scheme the Button primitive can paint, derived from its own CVA
 * rather than re-spelled here. The text-token maps below are keyed by
 * this, so adding a `color-scheme@1` value to the primitive without a
 * matching text token breaks the build instead of silently degrading.
 */
type PrimitiveButtonColorScheme = NonNullable<
  ComponentProps<typeof PrimitiveButton>["colorScheme"]
>;
/**
 * CTA-level variant axis — the primitive Button's default/outline/ghost/link.
 * The trailing arrow is NOT a variant: it is the orthogonal `showArrow` prop
 * (`ShowArrow` param), so it composes with any of the four.
 */
export type CtaButtonVariant = PrimitiveButtonVariant;

// Bridges the shared `size@1` Sitecore enum (default/xs/sm/md/lg/xl) to
// the button primitive's native size scale. Standalone callers using
// the primitive's own values (e.g. `size="default"`, `size="icon"`)
// keep working unchanged because the fallback returns the input
// verbatim — and "default" happens to mean the same thing on both
// sides (the button's natural default size), so it falls through too.
const SHARED_TO_PRIMITIVE_SIZE: Record<SharedSize, PrimitiveButtonSize> = {
  default: "default",
  xs: "xs",
  sm: "sm",
  md: "default",
  lg: "lg",
  xl: "lg",
};

// Text color the Link slot receives when CTA's variant === "default"
// (Button paints `bg-{scheme}`; text needs the inverse contrast token
// to read on the saturated fill). Mirrors the compound variants in
// the Button primitive — kept in sync there.
//
// Keyed by the primitive's own scheme union (every scheme the Button
// can paint) plus the local `ai` treatment, so adding a value to
// `color-scheme@1`
// breaks the build here instead of silently degrading to
// `text-foreground`. These were `Record<string, string>` until the
// gradients became selectable, which is exactly why the drift was
// invisible.
const DEFAULT_VARIANT_TEXT: Record<PrimitiveButtonColorScheme | "ai", string> =
  {
    // `none` = transparent fill, so the label keeps the ambient color.
    none: "text-current",
    // white/black paint the theme black/white pair — invert for contrast.
    white: "text-theme-black",
    black: "text-theme-white",
    primary: "text-primary-foreground",
    "primary-gradient": "text-primary-foreground",
    secondary: "text-secondary-foreground",
    "secondary-gradient": "text-secondary-foreground",
    tertiary: "text-tertiary-foreground",
    "tertiary-gradient": "text-tertiary-foreground",
    accent: "text-accent-foreground",
    "accent-gradient": "text-accent-foreground",
    "accent-2": "text-accent-2-foreground",
    "accent-2-gradient": "text-accent-2-foreground",
    "accent-3": "text-accent-3-foreground",
    "accent-3-gradient": "text-accent-3-foreground",
    neutral: "text-neutral",
    success: "text-success-foreground",
    warning: "text-warning-foreground",
    destructive: "text-destructive-foreground",
    info: "text-info-foreground",
    ai: "text-inverse-text",
  };

// Text color the Link slot receives when CTA's variant is "outline"
// or "ghost" (Button has a light/transparent fill; text needs the
// saturated colorScheme token to read on the page-background tint).
// Same set as the Button primitive's outline+colorScheme compounds.
// Gradients tint toward their START role — the same collapse the
// Button primitive's own outline/ghost gradient compounds apply, since
// no gradient TEXT token exists.
const OUTLINE_VARIANT_TEXT: Record<PrimitiveButtonColorScheme | "ai", string> =
  {
    none: "text-current",
    white: "text-theme-white",
    black: "text-theme-black",
    primary: "text-primary",
    "primary-gradient": "text-primary",
    secondary: "text-secondary",
    "secondary-gradient": "text-secondary",
    tertiary: "text-tertiary",
    "tertiary-gradient": "text-tertiary",
    accent: "text-accent",
    "accent-gradient": "text-accent",
    "accent-2": "text-accent-2",
    "accent-2-gradient": "text-accent-2",
    "accent-3": "text-accent-3",
    "accent-3-gradient": "text-accent-3",
    neutral: "text-neutral",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    info: "text-info",
    ai: "text-primary",
  };

/**
 * Look a raw `color-scheme@1` param up in one of the text-token maps
 * above. The maps are exhaustive over what the Button can paint, so a
 * miss here means the author supplied something outside the enum —
 * fall back to a still-legible unbranded token rather than emitting
 * nothing.
 */
function schemeTextClass(
  map: Record<PrimitiveButtonColorScheme | "ai", string>,
  colorScheme: string | null | undefined,
  fallback: string,
): string {
  const key = colorScheme ?? "primary";
  return key in map ? map[key as PrimitiveButtonColorScheme | "ai"] : fallback;
}

function resolveButtonSize(
  size: CtaButtonSize | undefined,
): PrimitiveButtonSize | undefined {
  if (!size) return undefined;
  return (
    SHARED_TO_PRIMITIVE_SIZE[size as SharedSize] ??
    (size as PrimitiveButtonSize)
  );
}

/**
 * Resolve the `Icon` rendering parameter (backed by the shared
 * `icon-name@1` enum) to the leading icon node rendered before the
 * button label. Mirrors card-block's `iconBadgeNode` guard: `none` is
 * the explicit clearing sentinel (Droplinks can't be unset in Pages)
 * and unknown / empty names degrade to no icon — never a broken glyph.
 */
function leadingIconNode(iconName: string | undefined): ReactNode {
  const name = iconName?.trim().toLowerCase();
  if (!name || name === "none" || !iconByName(name)) return undefined;
  // No `label` → NamedIcon renders aria-hidden (decorative) on its own.
  return <NamedIcon name={name} className="size-4 shrink-0" />;
}

/**
 * `CtaButton` is a transparent wrapper over the primitive `Button` plus
 * Sitecore-aware affordances. Inheriting `ComponentProps<typeof
 * PrimitiveButton>` means callers get every standard button concern
 * (`children`, `onClick`, `type`, `className`, `aria-*`, `data-*`,
 * `asChild`, `variant`, `colorScheme`) without us hand-listing them —
 * the wrapper only adds the CTA-specific slots and widens `size` to
 * accept the shared Sitecore `size@1` scale.
 */
export interface CtaButtonProps
  extends Omit<ComponentProps<typeof PrimitiveButton>, "size" | "variant">,
    CmsProps {
  /**
   * Button size. Accepts either the button primitive's native scale
   * (`default | lg | sm | xs | icon | icon-lg | icon-sm | icon-xs`) or
   * the shared `size@1` Sitecore enum
   * (`default | xs | sm | md | lg | xl`). `default` (from the enum)
   * and `md` both resolve to the primitive's `default` size; `xl` maps
   * to `lg` until the primitive grows a distinct XL size.
   */
  size?: CtaButtonSize;
  /**
   * Visual treatment: the primitive Button's default / outline / ghost /
   * link axis. Mirrors the shared `button-variant@1` Sitecore enum that
   * backs both the cta-button rendering and card-block action params.
   */
  variant?: CtaButtonVariant;
  /**
   * Sitecore link source. Rendered as `<Link value={link} />` inside an
   * `asChild` button when no explicit `children` are passed — this is
   * the CMS-driven mode (`<CtaButton link={fields.Link} />`). Ignored
   * when `children` is set, so consumers that want full control over
   * the inner content stay in charge.
   */
  link?: LinkSource;
  /**
   * Override for the default trailing arrow (lucide `ArrowRight`)
   * rendered by `showArrow` / the editorial link+arrow treatment. Lets a
   * call-site or theme swap the arrow glyph.
   */
  icon?: ReactNode;
  /**
   * Leading icon name from the shared `icon-name@1` vocabulary — backs
   * the `IconName` rendering parameter. `none` / empty / unknown names
   * render no icon (`none` is the explicit clearing pick for Droplink
   * params).
   */
  iconName?: string;
  /**
   * Append a trailing arrow (→) after the button label. Orthogonal to
   * `variant` — a filled/outline/link button can all carry the arrow.
   * Backed by the shared `ShowArrow` checkbox rendering parameter, so it
   * accepts Sitecore string-booleans (`"1"`, `"true"`) as well as a real
   * boolean. On the `link` variant this renders the full editorial
   * treatment (trailing arrow + underline rule — the `ArrowLink`
   * chrome).
   */
  showArrow?: string | boolean;
  /**
   * Label color override, independent of `colorScheme`. Backed by the
   * shared `heading-color@1` enum (`FontColor` rendering param).
   * `default` / unset keep the scheme's paired text token (fill
   * foreground on solid, role ink on outline/ghost). Any other value
   * replaces that token so a Brand Accent fill can take White text
   * without changing the fill.
   */
  fontColor?: string;
}

/**
 * Inner content for the children-driven button path. Slot (asChild)
 * requires a single child — pass `children` untouched there (never
 * even a null sibling). The leading icon / arrow only compose in the
 * plain-button path; asChild callers own their inner content (e.g.
 * CtaGroup routes the arrow into the Link's `after` slot itself).
 */
function composeButtonContent({
  asChild,
  children,
  leadingIcon,
  wantsArrow,
  arrowIcon,
}: {
  asChild: boolean | undefined;
  children: ReactNode;
  leadingIcon: ReactNode;
  wantsArrow: boolean;
  arrowIcon: ReactNode;
}): ReactNode {
  if (asChild || !(leadingIcon || wantsArrow)) return children;
  return (
    <>
      {leadingIcon}
      {children}
      {wantsArrow ? trailingArrow(arrowIcon) : null}
    </>
  );
}

/**
 * ClassName the Link slot receives inside the styled button shell.
 *
 * The Link primitive's base styles include `text-primary` (always
 * primary, regardless of the button's colorScheme prop) +
 * `hover:underline` (always, regardless of variant). When the Link
 * is slotted into a styled button shell those styles fight the
 * button's own color + hover treatment.
 *
 * Earlier attempt used `text-inherit` to defer to the parent
 * Button's color, but the cascade didn't survive twMerge + Slot's
 * asChild composition in practice — text-inherit either lost the
 * specificity battle with the Link's text-primary or inherited from
 * outside the Button entirely. Switched to explicit per-scheme
 * colors that mirror the Button primitive's compound variants:
 *
 *   default → text-{scheme}-foreground (Button has bg-{scheme})
 *   outline / ghost → text-{scheme}      (Button has light/transparent bg)
 *   link → leave Link's own text-primary + underline-on-hover
 *
 * Maps live alongside so an unknown colorScheme falls back to
 * text-foreground (still readable, just not branded).
 */
function resolveLinkSlotClassName(
  variant: PrimitiveButtonVariant,
  colorScheme: string | null | undefined,
): string | undefined {
  if (variant === "link") return undefined;
  return cn(
    schemeTextClass(
      variant === "default" ? DEFAULT_VARIANT_TEXT : OUTLINE_VARIANT_TEXT,
      colorScheme,
      "text-foreground",
    ),
    "no-underline hover:no-underline",
  );
}

/**
 * The editorial "Read more →" treatment (`link` variant + arrow — the
 * editorial treatment). Sitecore-link
 * mode delegates to the `ArrowLink` primitive (editorial chrome +
 * trailing arrow as JSX, single source of truth across every
 * consumer). Children mode — `<CtaButton variant="link" showArrow>Read
 * more</CtaButton>` — renders a plain `<button>` with the same chrome,
 * since there's no link to wrap. Text color follows `colorScheme` via
 * the outline/ghost map (transparent-fill variants → colored ink),
 * then `fontColorClass` when the author set FontColor.
 */
function EditorialArrowCta({
  children,
  link,
  arrowIcon,
  leadingIcon,
  colorScheme,
  fontColorClass,
  composedClassName,
  id,
  isEditing,
  buttonProps,
}: {
  children: ReactNode;
  link: LinkSource | undefined;
  arrowIcon: ReactNode;
  leadingIcon: ReactNode;
  colorScheme: string | null | undefined;
  fontColorClass: string;
  composedClassName: string;
  id: string | undefined;
  isEditing: boolean | undefined;
  buttonProps: Record<string, unknown>;
}) {
  const arrowTextClass = cn(
    schemeTextClass(OUTLINE_VARIANT_TEXT, colorScheme, "text-accent"),
    fontColorClass,
  );

  if (children !== undefined && children !== null) {
    return (
      <button
        type="button"
        id={id}
        className={cn(
          "group inline-flex items-center gap-3 border-current border-b pb-0.5",
          "font-semibold leading-8 no-underline hover:no-underline",
          arrowTextClass,
          composedClassName,
        )}
        {...buttonProps}
      >
        {leadingIcon}
        {children}
        {trailingArrow(arrowIcon)}
      </button>
    );
  }

  return (
    <ArrowLink
      value={link}
      icon={arrowIcon}
      before={leadingIcon}
      placeholder="Link"
      isEditing={isEditing}
      className={cn(arrowTextClass, composedClassName)}
      id={id}
    />
  );
}

/**
 * Sitecore-registered CTA block built from the Button primitive.
 *
 * Two rendering modes:
 *   1. **Children-driven** (the common standalone case): the caller
 *      passes `children` (text or a single element) and optionally
 *      `asChild`. The wrapper passes them straight through so the
 *      primitive renders a regular button or, with `asChild`, slots
 *      the children's element type in place of `<button>`.
 *   2. **Sitecore-link-driven**: no `children`, `link` is set. The
 *      wrapper renders `<PrimitiveButton asChild><Link value={link}/></PrimitiveButton>`
 *      so the underlying anchor stays editable in Experience Editor.
 */
export function CtaButton({
  children,
  link,
  icon,
  iconName,
  variant = "default",
  size = "default",
  colorScheme = "primary",
  fontColor,
  showArrow,
  asChild,
  className,
  styles,
  id,
  isEditing,
  rendering: _rendering,
  ...buttonProps
}: CtaButtonProps) {
  const resolvedSize = resolveButtonSize(size);

  const normalizedVariant = parseButtonVariant(variant);
  const resolvedColorScheme = buttonColorScheme(
    parseColorScheme(colorScheme, "primary"),
  );

  // `iconName` is the leading `icon-name@1` icon; `icon` overrides the
  // trailing arrow glyph.
  const leadingIcon = leadingIconNode(iconName);
  const arrowIcon = icon;

  const wantsArrow = isEnabled(showArrow);
  // `link` + arrow renders the editorial treatment (ArrowLink chrome:
  // trailing arrow + underline rule).
  const isEditorialLink = normalizedVariant === "link" && wantsArrow;

  const fontColorClass = headingColorClass(parseHeadingColor(fontColor));

  const composedClassName = cn(
    wantsArrow && "group",
    className,
    styles?.trimEnd(),
    fontColorClass,
  );

  if (isEditorialLink && !asChild) {
    return (
      <EditorialArrowCta
        link={link}
        arrowIcon={arrowIcon}
        leadingIcon={leadingIcon}
        colorScheme={resolvedColorScheme}
        fontColorClass={fontColorClass}
        composedClassName={composedClassName}
        id={id}
        isEditing={isEditing}
        buttonProps={buttonProps}
      >
        {children}
      </EditorialArrowCta>
    );
  }

  if (children !== undefined && children !== null) {
    return (
      <PrimitiveButton
        id={id}
        variant={normalizedVariant}
        size={resolvedSize}
        colorScheme={resolvedColorScheme}
        asChild={asChild}
        className={composedClassName}
        {...buttonProps}
      >
        {composeButtonContent({
          asChild,
          children,
          leadingIcon,
          wantsArrow,
          arrowIcon,
        })}
      </PrimitiveButton>
    );
  }

  const linkClassName = cn(
    resolveLinkSlotClassName(normalizedVariant, resolvedColorScheme),
    fontColorClass,
  );

  return (
    <PrimitiveButton
      id={id}
      variant={normalizedVariant}
      size={resolvedSize}
      colorScheme={resolvedColorScheme}
      className={composedClassName}
      asChild
      {...buttonProps}
    >
      <LinkPrimitive
        value={link}
        placeholder="Link"
        isEditing={isEditing}
        className={linkClassName}
        before={leadingIcon}
        after={wantsArrow ? trailingArrow(arrowIcon) : undefined}
      />
    </PrimitiveButton>
  );
}

// Internal callers (forms, cards, section wrappers) import `Button`
// from this module — load-bearing convenience re-export. Distinct from
// the primitive `Button` (which has no Sitecore awareness).
export { CtaButton as Button };
export default CtaButton;

// Sitecore component-map variant. Visual differentiation (outline /
// ghost / link / default) lives on the CVA `variant` prop per
// the variant-vs-parameter rule.
export const Default = CtaButton;

// Mark this component as universal so the SDK's component-map
// generator includes it in BOTH the server map and the client map.
// Without this marker the generator treats the file as server-only,
// which makes runtime `<Placeholder>` lookups (e.g. inside
// `row-splitter` and other client components) fail with "unknown
// component cta-button."
export const componentType = "universal";
